import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { 
    usersSchema, 
    ordersSchema, 
    robuxLedgerSchema, 
    robuxClaimsSchema, 
    globalSettingsSchema 
} from '../src/aserver/schemes.server.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in environment variables');
    process.exit(1);
}

// Create Models
const Users = mongoose.model('users', usersSchema);
const Orders = mongoose.model('orders', ordersSchema);
const RobuxLedger = mongoose.model('robuxLedger', robuxLedgerSchema);
const RobuxClaims = mongoose.model('robuxClaims', robuxClaimsSchema);
const GlobalSettings = mongoose.model('globalSettings', globalSettingsSchema);

async function notifyDiscord(webhookUrl, message) {
    if (!webhookUrl) {
        console.log('⚠️ Discord webhook not configured, skipping notification');
        return;
    }

    try {
        const response = await fetch(webhookUrl, {
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
        if (response.ok) {
            console.log('✅ Discord notification sent');
        } else {
            console.error(`❌ Failed to send Discord notification: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        console.error('❌ Failed to send Discord notification:', error);
    }
}

async function main() {
    const orderId = process.argv[2];

    if (!orderId) {
        console.error('❌ Please provide an Order ID');
        console.log('Usage: node scripts/test-dispute.js <ORDER_ID>');
        process.exit(1);
    }

    console.log(`🔌 Connecting to MongoDB...`);
    await mongoose.connect(MONGODB_URI);
    console.log(`✅ Connected to MongoDB`);

    try {
        console.log(`🔍 Searching for Order ID: ${orderId}`);
        const order = await Orders.findOne({ id: orderId.toString() });

        if (!order) {
            console.error(`❌ Order not found for ID: ${orderId}`);
            process.exit(1);
        }
        console.log(`✅ Order found: ${order._id} (Status: ${order.status})`);

        // Find User
        let user = null;
        if (order.reciever?.id) {
            user = await Users.findById(order.reciever.id);
        } else if (order.email) {
            user = await Users.findOne({ email: order.email });
        }

        if (!user) {
            console.error(`❌ User not found for order`);
            process.exit(1);
        }
        console.log(`✅ User found: ${user.username} (${user._id})`);
        console.log(`💰 Current Balance: ${user.robux}`);

        // Determine Robux Amount
        let robuxAmount = order.robuxPurchase?.robuxAmount || 0;
        
        // Fallback: Check ledger if amount is 0
        if (robuxAmount <= 0) {
            console.log(`🔍 Robux amount not found in order, checking ledger for referenceId: ${orderId}`);
            const ledgerEntry = await RobuxLedger.findOne({
                referenceId: orderId.toString(),
                type: 'purchase'
            });

            if (ledgerEntry) {
                robuxAmount = ledgerEntry.amount;
                console.log(`✅ Found purchase amount from ledger: ${robuxAmount}`);
            }
        }

        console.log(`📉 Amount to revoke: ${robuxAmount}`);

        if (robuxAmount > 0) {
            console.log(`🔄 Deducting points...`);
            await Users.updateOne(
                { _id: user._id },
                { $inc: { robux: -robuxAmount } }
            );
            console.log(`✅ Points deducted`);

            console.log(`📝 Creating ledger entry...`);
            await RobuxLedger.create({
                userId: user._id,
                type: 'chargeback',
                amount: -robuxAmount,
                balanceAfter: (user.robux || 0) - robuxAmount,
                referenceId: orderId.toString(),
                description: `Chargeback/Cancellation for order ${order.id} (Manual Trigger)`
            });
            console.log(`✅ Ledger entry created`);
        } else {
            console.log(`⚠️ No points to revoke`);
        }

        // Cancel Claims Selectively
        console.log(`🔍 Checking balance and pending claims...`);
        
        // Re-fetch user to get updated balance
        const updatedUser = await Users.findById(user._id);
        let currentBalance = updatedUser.robux;
        const cancelledClaims = [];

        if (currentBalance < 0) {
            console.log(`⚠️ User balance is negative (${currentBalance}), checking for pending claims to cancel...`);

            const pendingClaims = await RobuxClaims.find({
                'user.id': user._id.toString(),
                status: 'pending'
            }).sort({ createdAt: -1 });

            if (pendingClaims.length > 0) {
                console.log(`found ${pendingClaims.length} pending claims`);
                
                for (const claim of pendingClaims) {
                    if (currentBalance >= 0) {
                        console.log(`✅ Balance recovered (${currentBalance}), stopping cancellation.`);
                        break;
                    }

                    console.log(`🚫 Cancelling claim ${claim._id} (Amount: ${claim.robuxAmount}) to recover balance...`);

                    // Cancel Claim
                    await RobuxClaims.updateOne(
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
                    await Users.updateOne(
                        { _id: user._id },
                        { $inc: { robux: claim.robuxAmount } }
                    );

                    // Create Ledger Entry for Refund
                    await RobuxLedger.create({
                        userId: user._id,
                        type: 'adjustment',
                        amount: claim.robuxAmount,
                        balanceAfter: currentBalance + claim.robuxAmount,
                        referenceId: claim._id.toString(),
                        description: `Refund for cancelled claim ${claim._id} due to dispute recovery (Manual Trigger)`
                    });

                    currentBalance += claim.robuxAmount;
                    cancelledClaims.push(claim);
                    console.log(`✅ Claim cancelled and refunded. New Balance: ${currentBalance}`);
                }
            } else {
                console.log(`ℹ️ No pending claims found to recover balance`);
            }
        } else {
            console.log(`✅ User balance is positive (${currentBalance}), no claims cancelled.`);
        }

        // Update Order Status
        console.log(`🔄 Updating order status...`);
        await Orders.updateOne(
            { id: orderId.toString() },
            { $set: { status: 'cancelled' } }
        );
        console.log(`✅ Order status set to cancelled`);

        // Notify Discord
        console.log(`🔔 Sending Discord notification...`);
        const settings = await GlobalSettings.findOne({ _id: 'settings' }).lean();
        await notifyDiscord(settings?.discordDisputeWebhookUrl, {
            title: '🚨 MANUAL DISPUTE TRIGGERED',
            description: `Order ${order.id} cancelled manually via script.`,
            color: 15158332,
            fields: [
                { name: 'User', value: user.username, inline: true },
                { name: 'Deducted', value: `${robuxAmount}`, inline: true },
                { name: 'Claims Cancelled', value: cancelledClaims.length.toString(), inline: true },
                { name: 'Final Balance', value: `${currentBalance}`, inline: true }
            ]
        });

        console.log(`✨ Dispute processing completed successfully`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log(`👋 Disconnected from MongoDB`);
        process.exit(0);
    }
}

main();
