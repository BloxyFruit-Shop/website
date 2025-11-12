import { json } from '@sveltejs/kit';
import {
  users,
  globalSettings,
  squarePayments,
  robuxTransactions,
  squareDisputes,
  robuxClaims
} from '$server/mongo';
import crypto from 'crypto';

/**
 * Verify Square webhook signature using official Square SDK
 */
async function verifyWebhookSignature(
  body,
  signature,
  signatureKey,
  notificationUrl
) {
  if (!signatureKey) {
    console.warn('Square webhook signature key not configured');
    return false;
  }

  try {
    return await WebhooksHelper.verifySignature({
      requestBody: body,
      signatureHeader: signature,
      signatureKey: signatureKey,
      notificationUrl: notificationUrl
    });
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

/**
 * Send Discord notification for dispute events
 */
async function notifyDiscord(webhookUrl, message) {
  if (!webhookUrl) {
    console.log('Discord webhook not configured, skipping notification');
    return;
  }

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [
          {
            title: message.title,
            description: message.description,
            color: message.color || 15158332,
            timestamp: new Date().toISOString(),
            fields: message.fields || []
          }
        ]
      })
    });
  } catch (error) {
    console.error('Failed to send Discord notification:', error);
  }
}

/**
 * Handle dispute.created event with chargeback protection
 */
async function handleDisputeCreated(dispute, settings) {
  try {
    // Find payment & user
    const payment = await squarePayments.findOne({
      paymentId: dispute.payment_id
    });

    if (!payment) {
      console.error('Payment not found for dispute:', dispute.id);
      return;
    }

    const user = await users.findById(payment.userId);
    if (!user) {
      console.error('User not found for payment:', payment.paymentId);
      return;
    }

    console.log(`Processing dispute ${dispute.id} for user ${user.username}`);

    // 1. Check for PENDING claims (not yet resolved)
    const pendingClaims = await robuxClaims.find({
      'user.email': user.email,
      resolved: false
    });

    const claimsAffected = [];
    let reversalAmount = payment.robuxAmount;

    if (pendingClaims.length > 0) {
      console.log(
        `Found ${pendingClaims.length} pending claims for user ${user.username}`
      );

      // IMMEDIATELY cancel pending claims
      for (const claim of pendingClaims) {
        await robuxClaims.updateOne(
          { _id: claim._id },
          {
            $set: {
              resolved: true,
              cancelledDueToDispute: true,
              disputeId: dispute.id,
              resolvedAt: new Date()
            }
          }
        );

        claimsAffected.push({
          claimId: claim._id,
          status: 'pending_cancelled',
          action: 'auto_cancelled'
        });

        console.log(`Cancelled pending claim ${claim._id} due to dispute`);
      }
    }

    // 2. Check if robux was ALREADY CLAIMED
    const claimedClaims = await robuxClaims.find({
      'user.email': user.email,
      resolved: true,
      cancelledDueToDispute: false
    });

    if (claimedClaims.length > 0) {
      console.log(
        `Found ${claimedClaims.length} already-claimed claims for user ${user.username}`
      );

      // Flag for MANUAL REVIEW
      for (const claim of claimedClaims) {
        claimsAffected.push({
          claimId: claim._id,
          status: 'already_claimed',
          action: 'manual_review_required'
        });
      }

      // Create dispute record for manual review
      await squareDisputes.create({
        disputeId: dispute.id,
        paymentId: payment.paymentId,
        userId: user._id,
        robuxAmount: payment.robuxAmount,
        status: 'created',
        reason: dispute.reason_code || 'unknown',
        claimsAffected: claimsAffected,
        reversalProcessed: false
      });

      // Notify admin via Discord - MANUAL REVIEW REQUIRED
      await notifyDiscord(settings.discordDisputeWebhookUrl, {
        title: '⚠️ DISPUTE - MANUAL REVIEW REQUIRED',
        description: `Dispute created for user ${user.username}. User has already claimed robux from gamepass.`,
        color: 15158332,
        fields: [
          {
            name: 'User',
            value: user.username,
            inline: true
          },
          {
            name: 'Robux Amount',
            value: `${payment.robuxAmount} R$`,
            inline: true
          },
          {
            name: 'Dispute Reason',
            value: dispute.reason_code || 'unknown',
            inline: true
          },
          {
            name: 'Claimed Robux Count',
            value: claimedClaims.length.toString(),
            inline: true
          },
          {
            name: 'Dispute ID',
            value: dispute.id,
            inline: false
          },
          {
            name: 'Action Required',
            value: 'Manual review needed - check if robux was spent',
            inline: false
          }
        ]
      });

      console.log(
        `Dispute ${dispute.id} flagged for manual review - user has claimed robux`
      );
      return;
    }

    // 3. If NO claims (pending or resolved) - REVERSE ROBUX IMMEDIATELY
    console.log(
      `No claims found - reversing ${reversalAmount} robux for user ${user.username}`
    );

    const balanceBefore = user.robux;
    const balanceAfter = balanceBefore - reversalAmount;

    // Update user robux
    await users.updateOne(
      { _id: user._id },
      {
        $inc: {
          robux: -reversalAmount,
          'robuxBreakdown.purchased': -reversalAmount
        }
      }
    );

    // Log transaction reversal
    const transactionRecord = await robuxTransactions.create({
      userId: user._id,
      type: 'chargeback_reversal',
      amount: -reversalAmount,
      source: 'square_dispute',
      sourceId: dispute.id,
      balanceBefore: balanceBefore,
      balanceAfter: balanceAfter,
      metadata: {
        reason: 'Automatic reversal due to chargeback dispute',
        disputeReason: dispute.reason_code || 'unknown'
      }
    });

    // Mark dispute as processed
    await squareDisputes.create({
      disputeId: dispute.id,
      paymentId: payment.paymentId,
      userId: user._id,
      robuxAmount: payment.robuxAmount,
      status: 'created',
      reason: dispute.reason_code || 'unknown',
      claimsAffected: claimsAffected,
      reversalProcessed: true,
      reversalTransactionId: transactionRecord._id
    });

    // Update payment status
    await squarePayments.updateOne(
      { paymentId: payment.paymentId },
      { $set: { status: 'disputed', disputeId: dispute.id } }
    );

    // Notify admin via Discord - AUTO REVERSED
    await notifyDiscord(settings.discordDisputeWebhookUrl, {
      title: '🔄 DISPUTE - AUTO REVERSED',
      description: `Dispute created and robux automatically reversed for user ${user.username}`,
      color: 15105570,
      fields: [
        {
          name: 'User',
          value: user.username,
          inline: true
        },
        {
          name: 'Robux Reversed',
          value: `${reversalAmount} R$`,
          inline: true
        },
        {
          name: 'New Balance',
          value: `${balanceAfter} R$`,
          inline: true
        },
        {
          name: 'Dispute Reason',
          value: dispute.reason_code || 'unknown',
          inline: true
        },
        {
          name: 'Dispute ID',
          value: dispute.id,
          inline: false
        },
        {
          name: 'Action Taken',
          value: 'Robux automatically reversed - no claims were made',
          inline: false
        }
      ]
    });

    console.log(
      `Dispute ${dispute.id} processed - robux reversed for user ${user.username}`
    );
  } catch (error) {
    console.error('Error handling dispute:', error);

    // Send error alert to Discord
    const settings = await globalSettings.findOne({ _id: 'settings' }).lean();
    await notifyDiscord(settings?.discordDisputeWebhookUrl, {
      title: '❌ DISPUTE PROCESSING ERROR',
      description: `Error processing dispute: ${error.message}`,
      color: 15158332,
      fields: [
        {
          name: 'Error',
          value: error.message,
          inline: false
        }
      ]
    });
  }
}

export async function POST({ request }) {
  try {
    // Get the signature from Square header
    const signature = request.headers.get('x-square-hmacsha256-signature');
    const body = await request.text();

    // Get webhook signature key and notification URL from database
    const settings = await globalSettings.findOne({ _id: 'settings' }).lean();
    if (!settings?.squareWebhookSignatures?.payments) {
      console.error('Square payments webhook signature key not configured');
      return json({ success: false }, { status: 500 });
    }

    const notificationUrl =
      (SITE_URL ?? 'https://bloxyfruit.com') + '/api/webhooks/square/disputes';

    // Verify webhook signature using official Square SDK
    if (
      !(await verifyWebhookSignature(
        body,
        signature,
        settings.squareWebhookSignatures.payments,
        notificationUrl
      ))
    ) {
      console.warn('Invalid Square webhook signature');
      return json({ success: false }, { status: 401 });
    }

    const event = JSON.parse(body);

    // Handle dispute.created event
    if (event.type === 'dispute.created') {
      const dispute = event.data.object.dispute;
      await handleDisputeCreated(dispute, settings);
    }

    return json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Dispute webhook processing error:', error);
    return json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
