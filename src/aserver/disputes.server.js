import { users, globalSettings, orders, robuxLedger, robuxClaims } from '$server/mongo';

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
 * Process a dispute or cancellation for a given order ID
 * @param {string} orderId - The Shopify Order ID
 * @param {string} reason - The reason for cancellation/dispute
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function processDispute(orderId, reason = 'unknown') {
  try {
    console.log(`Processing dispute/cancellation for Order ID: ${orderId}`);

    // 1. Find the order in our DB
    const order = await orders.findOne({ id: orderId.toString() });

    if (!order) {
      console.error(`Order not found for ID: ${orderId}`);
      return { success: false, message: 'Order not found' };
    }

    // 2. Find the user
    let user = null;
    if (order.reciever?.id) {
        user = await users.findById(order.reciever.id);
    } else if (order.email) {
        user = await users.findOne({ email: order.email });
    }

    if (!user) {
         console.error(`User not found for order: ${order.id}`);
         return { success: false, message: 'User not found' };
    }

    console.log(`Processing dispute/cancellation for user ${user.username} (${user._id})`);

    // 3. Determine Robux Amount to revoke
    let robuxAmount = order.robuxPurchase?.robuxAmount || 0;

    // Fallback: Check ledger if amount is 0
    if (robuxAmount <= 0) {
        console.log(`Robux amount not found in order, checking ledger for referenceId: ${orderId}`);
        const ledgerEntry = await robuxLedger.findOne({
            referenceId: orderId.toString(),
            type: 'purchase'
        });

        if (ledgerEntry) {
            robuxAmount = ledgerEntry.amount;
            console.log(`Found purchase amount from ledger: ${robuxAmount}`);
        }
    }

    let deducted = false;

    if (robuxAmount <= 0) {
        console.warn(`No Robux amount found for order ${order.id}, skipping deduction.`);
    } else {
        // 4. Deduct Robux from User Balance
        await users.updateOne(
            { _id: user._id },
            {
                $inc: {
                    robux: -robuxAmount
                }
            }
        );

        // 5. Create Ledger Entry (Chargeback)
        await robuxLedger.create({
            userId: user._id,
            type: 'chargeback',
            amount: -robuxAmount,
            balanceAfter: (user.robux || 0) - robuxAmount,
            referenceId: orderId.toString(),
            description: `Chargeback/Cancellation for order ${order.id}`
        });
        deducted = true;
    }

    // 6. Check Balance and Cancel Claims Selectively
    // We only cancel claims if the user has a negative balance after the deduction.
    // We cancel claims one by one (newest first) until the balance is non-negative.
    
    // Re-fetch user to get updated balance
    const updatedUser = await users.findById(user._id);
    let currentBalance = updatedUser.robux;
    const cancelledClaims = [];

    if (currentBalance < 0) {
        console.log(`User balance is negative (${currentBalance}), checking for pending claims to cancel...`);

        const pendingClaims = await robuxClaims.find({
            'user.id': user._id,
            status: 'pending'
        }).sort({ createdAt: -1 }); // Newest first

        if (pendingClaims.length > 0) {
            console.log(`Found ${pendingClaims.length} pending claims`);

            for (const claim of pendingClaims) {
                if (currentBalance >= 0) {
                    console.log(`Balance recovered (${currentBalance}), stopping cancellation.`);
                    break;
                }

                console.log(`Cancelling claim ${claim._id} (Amount: ${claim.robuxAmount}) to recover balance...`);

                // Cancel Claim
                await robuxClaims.updateOne(
                    { _id: claim._id },
                    {
                        $set: {
                            status: 'refunded',
                            resolved: true,
                            resolvedAt: new Date()
                        }
                    }
                );

                // Refund Points
                await users.updateOne(
                    { _id: user._id },
                    { $inc: { robux: claim.robuxAmount } }
                );

                // Create Ledger Entry for Refund
                await robuxLedger.create({
                    userId: user._id,
                    type: 'adjustment', // or 'refund'
                    amount: claim.robuxAmount,
                    balanceAfter: currentBalance + claim.robuxAmount,
                    referenceId: claim._id.toString(),
                    description: `Refund for cancelled claim ${claim._id} due to dispute recovery`
                });

                currentBalance += claim.robuxAmount;
                cancelledClaims.push(claim);
                console.log(`Claim cancelled and refunded. New Balance: ${currentBalance}`);
            }
        } else {
            console.log('No pending claims found to recover balance.');
        }
    } else {
        console.log(`User balance is positive (${currentBalance}), no claims cancelled.`);
    }

    // 7. Update Order Status
    await orders.updateOne(
        { id: orderId.toString() },
        { $set: { status: 'cancelled' } }
    );

    // 8. Notify Discord
    const settings = await globalSettings.findOne({ _id: 'settings' }).lean();
    await notifyDiscord(settings?.discordDisputeWebhookUrl, {
        title: '🚨 ORDER CANCELLED / DISPUTED',
        description: `Order ${order.id} cancelled for user ${user.username}. Balance deducted.`,
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
                value: cancelledClaims.length.toString(),
                inline: true
            },
            {
                name: 'Final Balance',
                value: `${currentBalance} Bloxypoints`,
                inline: true
            },
            {
                name: 'Reason',
                value: reason,
                inline: true
            },
            {
                name: 'Shopify Order ID',
                value: orderId.toString(),
                inline: false
            }
        ]
    });

    return { success: true, message: 'Dispute processed successfully' };

  } catch (error) {
    console.error('Error processing dispute:', error);
    
    // Notify Discord of error
    const settings = await globalSettings.findOne({ _id: 'settings' }).lean();
    await notifyDiscord(settings?.discordDisputeWebhookUrl, {
        title: '❌ DISPUTE PROCESSING ERROR',
        description: `Error processing dispute for order ${orderId}: ${error.message}`,
        color: 15158332,
        fields: [
            {
                name: 'Error',
                value: error.message,
                inline: false
            }
        ]
    });

    throw error;
  }
}
