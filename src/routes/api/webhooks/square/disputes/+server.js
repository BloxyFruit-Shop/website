import { json } from '@sveltejs/kit';
import {
  users,
  globalSettings,
  squarePayments,
  squareDisputes,
  robuxPurchases,
  orders
} from '$server/mongo';
import { SITE_URL } from '$env/static/private';
import { WebhooksHelper } from 'square';

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

    // 1. Check for PENDING robux purchases (not yet resolved)
    const pendingPurchases = await robuxPurchases.find({
      'user.id': payment.userId,
      status: 'pending'
    });

    const claimsAffected = [];
    let reversalAmount = payment.robuxAmount;

    if (pendingPurchases.length > 0) {
      console.log(
        `Found ${pendingPurchases.length} pending robux purchases for user ${user.username}`
      );

      // IMMEDIATELY cancel pending robux purchases
      for (const purchase of pendingPurchases) {
        await robuxPurchases.updateOne(
          { _id: purchase._id },
          {
            $set: {
              status: 'cancelledDueToDispute',
              resolved: true,
              resolvedAt: new Date(),
              disputeId: dispute.id
            }
          }
        );

        // Also cancel corresponding order
        await orders.updateOne(
          { 'robuxPurchase.robuxPurchaseId': purchase._id },
          {
            $set: {
              status: 'cancelled'
            }
          }
        );

        claimsAffected.push({
          purchaseId: purchase._id,
          status: 'pending_cancelled',
          action: 'auto_cancelled'
        });

        console.log(`Cancelled pending robux purchase ${purchase._id} due to dispute`);
      }
    }

    // 2. Check if robux was ALREADY FULFILLED (resolved robux purchases)
    const fulfilledPurchases = await robuxPurchases.find({
      'user.id': payment.userId,
      status: 'completed',
      resolved: true
    });

    if (fulfilledPurchases.length > 0) {
      console.log(
        `Found ${fulfilledPurchases.length} already-fulfilled robux purchases for user ${user.username}`
      );

      // Flag for MANUAL REVIEW
      for (const purchase of fulfilledPurchases) {
        claimsAffected.push({
          purchaseId: purchase._id,
          status: 'already_fulfilled',
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
        description: `Dispute created for user ${user.username}. User has already received robux from gamepass.`,
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
            name: 'Fulfilled Robux Count',
            value: fulfilledPurchases.length.toString(),
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
        `Dispute ${dispute.id} flagged for manual review - user has fulfilled robux purchases`
      );
      return;
    }

    // 3. If NO purchases (pending or resolved) - This should not happen with the new system
    // All robux purchases create records, so if we reach here something went wrong
    console.warn(
      `No robux purchases found for dispute ${dispute.id} on payment ${payment.paymentId} - this should not happen with the new system`
    );

    // Mark dispute as processed but flag for manual review
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

    // Update payment status
    await squarePayments.updateOne(
      { paymentId: payment.paymentId },
      { $set: { status: 'disputed', disputeId: dispute.id } }
    );

    // Notify admin via Discord - UNEXPECTED STATE
    await notifyDiscord(settings.discordDisputeWebhookUrl, {
      title: '⚠️ DISPUTE - UNEXPECTED STATE',
      description: `Dispute created but no robux purchases found for user ${user.username}. This indicates a system issue.`,
      color: 16776960,
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
          name: 'Dispute ID',
          value: dispute.id,
          inline: false
        },
        {
          name: 'Action Required',
          value: 'Manual review needed - no robux purchases were found for this payment',
          inline: false
        }
      ]
    });

    console.log(
      `Dispute ${dispute.id} flagged for manual review - no robux purchases found (unexpected state)`
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
