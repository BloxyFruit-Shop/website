import { json } from '@sveltejs/kit';
import {
  users,
  globalSettings,
  squarePayments,
  robuxClaims,
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
 * Send Discord notification for payment events
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
            color: message.color || 3447003,
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
      (SITE_URL ?? 'https://bloxyfruit.com') + '/api/webhooks/square';

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

    // Handle payment.created event
    if (event.type === 'payment.created') {
      const payment = event.data.object.payment;

      // Find the payment record in our database
      const paymentRecord = await squarePayments.findOne({
        paymentId: payment.id
      });

      if (!paymentRecord) {
        console.log('Payment record not found for:', payment.id);
        return json({ success: true }, { status: 200 });
      }

      // Update payment status to 'authorized' (payment is authorized but not yet captured)
      await squarePayments.updateOne(
        { paymentId: payment.id },
        {
          $set: {
            status: 'authorized',
            authorizedAt: new Date()
          }
        }
      );

      console.log(`Payment authorized for payment ID: ${payment.id}`);
    }

    // Handle payment.updated event
    if (event.type === 'payment.updated') {
      const payment = event.data.object.payment;
      console.log(payment);
      // Only process if payment status is COMPLETED (captured)
      if (payment.status !== 'COMPLETED') {
        console.log(`Payment status is ${payment.status}, not processing yet`);
        return json({ success: true }, { status: 200 });
      }

      // Find the payment record in our database
      const paymentRecord = await squarePayments.findOne({
        paymentId: payment.id
      });

      if (!paymentRecord) {
        console.log('Payment record not found for:', payment.id);
        return json({ success: true }, { status: 200 });
      }

      // Skip if already completed
      if (paymentRecord.status === 'completed') {
        console.log('Payment already completed:', payment.id);
        return json({ success: true }, { status: 200 });
      }

      // Get user
      const user = await users.findById(paymentRecord.userId);
      if (!user) {
        console.error('User not found for payment:', payment.id);
        return json({ success: true }, { status: 200 });
      }

      // Update payment status to 'completed' and store receipt URL
      await squarePayments.updateOne(
        { paymentId: payment.id },
        {
          $set: {
            status: 'completed',
            completedAt: new Date(),
            receiptUrl: payment.receiptUrl || null
          }
        }
      );

      const robuxAmount = paymentRecord.robuxAmount;

      // If this is a robux purchase (has claimData), update the pending purchase and create order
      if (paymentRecord.claimData) {
        // Find the pending robux purchase created before payment
        const pendingPurchase = await robuxPurchases.findOne({
          'user.id': paymentRecord.userId,
          status: 'pending',
          resolved: false,
          robuxAmount: robuxAmount
        });

        if (pendingPurchase) {
          // Update the pending purchase to completed (visible)
          await robuxPurchases.updateOne(
            { _id: pendingPurchase._id },
            {
              $set: {
                status: 'completed',
                paymentId: payment.id,
                eurAmount: paymentRecord.amount / 100, // Convert cents to EUR
                resolved: false, // Keep as false - staff will manually fulfill
                resolvedAt: null // Will be set when staff fulfills
              }
            }
          );
          console.log(
            `Updated robux purchase ${pendingPurchase._id} to completed status`
          );

          // Create corresponding order for robux purchase
          const newOrder = await orders.create({
            email: user.email,
            id: user._id.toString(),
            items: [],
            totalAmount: paymentRecord.amount / 100,
            status: 'ready',
            game: pendingPurchase.game?.name || 'Robux Purchase',
            reciever: {
              username: pendingPurchase.user.displayName || '',
              displayName: pendingPurchase.user.displayName || '',
              id: '',
              thumbnail: ''
            },
            robuxPurchase: {
              robuxPurchaseId: pendingPurchase._id,
              robuxAmount: pendingPurchase.robuxAmount,
              eurAmount: paymentRecord.amount / 100,
              gamepass: {
                id: pendingPurchase.gamepass?.id || '',
                displayName: pendingPurchase.gamepass?.displayName || '',
                price: pendingPurchase.gamepass?.price || 0
              },
              fulfillmentDate: null
            },
            createdAt: new Date(),
            updatedAt: new Date()
          });

          console.log(
            `Created order ${newOrder._id} for robux purchase ${pendingPurchase._id}`
          );
        } else {
          console.warn(
            `No pending robux purchase found for user ${paymentRecord.userId} with amount ${robuxAmount}`
          );
        }
      }

      // Send Discord notification
      await notifyDiscord(settings.discordDisputeWebhookUrl, {
        title: '✅ Robux Purchase Completed',
        description: `User ${user.username} completed payment for ${robuxAmount} Robux`,
        color: 3066993,
        fields: [
          {
            name: 'User',
            value: user.username,
            inline: true
          },
          {
            name: 'Robux Amount',
            value: `${robuxAmount} R$`,
            inline: true
          },
          {
            name: 'EUR Amount',
            value: `€${(paymentRecord.amount / 100).toFixed(2)}`,
            inline: true
          },
          {
            name: 'Status',
            value: 'Order Created - Awaiting Staff Fulfillment',
            inline: true
          },
          {
            name: 'Payment ID',
            value: payment.id,
            inline: false
          }
        ]
      });

      console.log(
        `Payment completed for user ${user.username}: ${robuxAmount} Robux`
      );
    }

    return json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return json({ success: false, error: error.message }, { status: 500 });
  }
}
