import { json } from '@sveltejs/kit';
import {
  users,
  globalSettings,
  squarePayments,
  squareDisputes,
  robuxClaims,
  robuxLedger
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

    const robuxAmount = payment.robuxAmount;

    // 1. Deduct Robux from User Balance
    await users.updateOne(
      { _id: user._id },
      {
        $inc: {
          robux: -robuxAmount
        }
      }
    );

    // 2. Create Ledger Entry (Chargeback)
    await robuxLedger.create({
      userId: user._id,
      type: 'chargeback',
      amount: -robuxAmount,
      balanceAfter: (user.robux || 0) - robuxAmount,
      referenceId: dispute.id,
      description: `Chargeback for payment ${payment.paymentId}`
    });

    // 3. Cancel ALL pending claims
    const pendingClaims = await robuxClaims.find({
      'user.id': user._id,
      status: 'pending'
    });

    const claimsAffected = [];

    if (pendingClaims.length > 0) {
      console.log(
        `Found ${pendingClaims.length} pending claims for user ${user.username}`
      );

      for (const claim of pendingClaims) {
        await robuxClaims.updateOne(
          { _id: claim._id },
          {
            $set: {
              status: 'cancelledDueToDispute',
              resolved: true,
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

    // 4. Create Dispute Record
    await squareDisputes.create({
      disputeId: dispute.id,
      paymentId: payment.paymentId,
      userId: user._id,
      robuxAmount: robuxAmount,
      status: 'created',
      reason: dispute.reason_code || 'unknown',
      claimsAffected: claimsAffected,
      reversalProcessed: true // We processed the reversal immediately
    });

    // Update payment status
    await squarePayments.updateOne(
      { paymentId: payment.paymentId },
      { $set: { status: 'disputed', disputeId: dispute.id } }
    );

    // Notify admin via Discord
    await notifyDiscord(settings.discordDisputeWebhookUrl, {
      title: '🚨 CHARGEBACK PROCESSED',
      description: `Dispute created for user ${user.username}. Balance deducted and pending claims cancelled.`,
      color: 15158332, // RED
      fields: [
        {
          name: 'User',
          value: user.username,
          inline: true
        },
        {
          name: 'Deducted Amount',
          value: `${robuxAmount} Bloxypoints`,
          inline: true
        },
        {
          name: 'Cancelled Claims',
          value: pendingClaims.length.toString(),
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
        }
      ]
    });

    console.log(
      `Dispute ${dispute.id} processed for user ${user.username}`
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
