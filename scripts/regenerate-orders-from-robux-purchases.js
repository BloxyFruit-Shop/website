import { createConnection } from 'mongoose';
import {
  usersSchema,
  ordersSchema,
  robuxPurchasesSchema,
  squarePaymentsSchema
} from '../src/aserver/schemes.server.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI environment variable is not set');
  process.exit(1);
}

// Create database connection
const db = createConnection(MONGODB_URI);

const users = db.model('users', usersSchema);
const orders = db.model('orders', ordersSchema);
const robuxPurchases = db.model('robuxPurchases', robuxPurchasesSchema);
const squarePayments = db.model('squarePayments', squarePaymentsSchema);

/**
 * Generate an order from a robuxPurchase ID
 * @param {string} robuxPurchaseId - The MongoDB ObjectId of the robux purchase
 * @returns {Promise<Object>} The created order document
 */
async function generateOrderFromRobuxPurchase(robuxPurchaseId) {
  try {
    // Find the robux purchase
    const robuxPurchase = await robuxPurchases.findById(robuxPurchaseId);
    
    if (!robuxPurchase) {
      throw new Error(`Robux purchase not found with ID: ${robuxPurchaseId}`);
    }

    console.log(`Found robux purchase: ${robuxPurchaseId}`);
    console.log(`  User: ${robuxPurchase.user.username}`);
    console.log(`  Robux Amount: ${robuxPurchase.robuxAmount}`);
    console.log(`  Status: ${robuxPurchase.status}`);

    // Find the user
    const user = await users.findOne({ email: robuxPurchase.user.email });
    
    if (!user) {
      throw new Error(`User not found with email: ${robuxPurchase.user.email}`);
    }

    // Get payment info if available
    let eurAmount = robuxPurchase.eurAmount || 0;
    if (robuxPurchase.paymentId) {
      const payment = await squarePayments.findOne({ paymentId: robuxPurchase.paymentId });
      if (payment) {
        eurAmount = payment.amount / 100; // Convert cents to EUR
      }
    }

    // Create the order following the same structure as the webhook handler
    const newOrder = await orders.create({
      email: user.email,
      id: user._id.toString(),
      items: [],
      totalAmount: eurAmount,
      status: 'ready',
      game: robuxPurchase.game?.name || 'Robux Purchase',
      reciever: {
        username: robuxPurchase.user.displayName || '',
        displayName: robuxPurchase.user.displayName || '',
        id: '',
        thumbnail: ''
      },
      robuxPurchase: {
        robuxPurchaseId: robuxPurchase._id,
        robuxAmount: robuxPurchase.robuxAmount,
        eurAmount: eurAmount,
        gamepass: {
          id: robuxPurchase.gamepass?.id || '',
          displayName: robuxPurchase.gamepass?.displayName || '',
          price: robuxPurchase.gamepass?.price || 0
        },
        fulfillmentDate: null
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log(`✅ Successfully created order: ${newOrder._id}`);
    console.log(`   Order Status: ${newOrder.status}`);
    console.log(`   Total Amount: €${eurAmount.toFixed(2)}`);
    
    return newOrder;
  } catch (error) {
    console.error(`❌ Error generating order: ${error.message}`);
    throw error;
  }
}

/**
 * Generate orders for multiple robux purchases
 * @param {string[]} robuxPurchaseIds - Array of robux purchase IDs
 */
async function generateOrdersFromMultipleRobuxPurchases(robuxPurchaseIds) {
  const results = {
    successful: [],
    failed: []
  };

  for (const id of robuxPurchaseIds) {
    try {
      const order = await generateOrderFromRobuxPurchase(id);
      results.successful.push({
        robuxPurchaseId: id,
        orderId: order._id
      });
    } catch (error) {
      results.failed.push({
        robuxPurchaseId: id,
        error: error.message
      });
    }
  }

  return results;
}

/**
 * Main execution
 */
async function main() {
  try {
    // Get robux purchase IDs from command line arguments
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      console.log('Usage: node regenerate-orders-from-robux-purchases.js <robuxPurchaseId1> [robuxPurchaseId2] ...');
      console.log('');
      console.log('Example:');
      console.log('  node regenerate-orders-from-robux-purchases.js 507f1f77bcf86cd799439011');
      console.log('  node regenerate-orders-from-robux-purchases.js 507f1f77bcf86cd799439011 507f1f77bcf86cd799439012');
      process.exit(0);
    }

    console.log(`\n📋 Regenerating orders for ${args.length} robux purchase(s)...\n`);

    const results = await generateOrdersFromMultipleRobuxPurchases(args);

    console.log('\n' + '='.repeat(60));
    console.log('SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successful: ${results.successful.length}`);
    console.log(`❌ Failed: ${results.failed.length}`);

    if (results.successful.length > 0) {
      console.log('\nSuccessful Orders:');
      results.successful.forEach((item) => {
        console.log(`  - Robux Purchase: ${item.robuxPurchaseId}`);
        console.log(`    Order ID: ${item.orderId}`);
      });
    }

    if (results.failed.length > 0) {
      console.log('\nFailed Orders:');
      results.failed.forEach((item) => {
        console.log(`  - Robux Purchase: ${item.robuxPurchaseId}`);
        console.log(`    Error: ${item.error}`);
      });
    }

    console.log('='.repeat(60) + '\n');

    process.exit(results.failed.length > 0 ? 1 : 0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    await db.close();
  }
}

main();
