import { model, connect, disconnect, Schema } from 'mongoose';
import { orderItemSchema } from '../src/aserver/schemes.server';

// Adding new reciever field to orders
const ordersSchema = new Schema({
  email: String,
  id: String,
  items: [orderItemSchema],
  totalAmount: Number,
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  },
  game: String,
  reciever: {
    username: { type: String, default: '' },
    displayName: { type: String, default: '' },
    id: { type: String, default: '' },
    thumbnail: { type: String, default: '' }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Order = model('Order', ordersSchema, 'orders');

async function runMigration() {
  try {
    // Connect to the MongoDB
    await connect(
      process.env.MONGODB_URI || "mongodb+srv://bloxyadmin:bloxypassword@test-cluster.sgs7n.mongodb.net/bloxyfruit"
    );

    console.log('Connected to database. Starting migration...');

    // Update orders that don't have a reciever field
    const result = await Order.updateMany(
      { reciever: { $exists: false } },
      {
        $set: {
          reciever: {
            username: '',
            displayName: '',
            id: '',
            thumbnail: ''
          }
        }
      }
    );

    console.log(
      `Migration complete. Matched: ${result.nMatched}, Modified: ${
        result.nModified || result.modifiedCount
      }`
    );
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await disconnect();
    console.log('Disconnected from database.');
  }
}

// Execute migration
runMigration();
