import { Schema } from 'mongoose';
import { init } from '@paralleldrive/cuid2';

const createCode = init({
  length: 10
});

const sessionSchema = new Schema(
  {
    id: String,
    date: Date
  },
  { _id: false }
);

export const statusEnums = {
  active: 0,
  verifying: 1,
  banned: 2,
  0: 'active',
  1: 'verifying',
  2: 'banned'
};

const statusSchema = new Schema(
  {
    code: Number,
    banReason: { type: String, required: false },
    banBy: { type: String, required: false },
    banDate: { type: Date, required: false }
  },
  { _id: false }
);

export const roleEnums = {
  Member: 0,
  Admin: 1,
  Owner: 2,
  0: 'Member',
  1: 'Admin',
  2: 'Owner'
};

export const usersSchema = new Schema({
  username: String,
  email: String,
  password: String,
  status: statusSchema,
  role: Number,
  session: sessionSchema,
  robux: { type: Number, default: 0 },
  robuxBreakdown: {
    purchased: { type: Number, default: 0 },
    claimed: { type: Number, default: 0 }
  },
  referralCode: { type: String, default: createCode },
  lastPurchaseAt: { type: Date, default: null },
  squareCustomerId: { type: String, default: null }
});

export const verificationsSchema = new Schema({
  type: String, // forgot-password, verify-account, change-email
  author: String,
  code: String
});

export const inventoryItemSchema = new Schema({
  productId: String,
  type: {
    type: String,
    enum: ['account'],
    required: true
  },
  data: {
    username: String,
    password: String
  },
  status: {
    type: String,
    enum: ['available', 'claimed'],
    default: 'available'
  },
  claimedBy: { type: String, default: null },
  claimedAt: { type: Date, default: null }
});

export const productsSchema = new Schema({
  productId: String,
  title: String,
  image: String,
  price: Number,
  comparePrice: Number,
  category: String,
  rarity: String,
  game: String,
  deliveryType: {
    type: String,
    enum: ['account', 'manual', 'bloxypoints'],
    required: true
  },
  robuxAmount: Number,
  stockCount: { type: Number, default: 0 }
});

export const orderItemSchema = new Schema({
  _id: false,
  productId: String,
  title: String,
  image: String,
  price: Number,
  quantity: Number,
  category: String,
  deliveryType: {
    type: String,
    enum: ['account', 'manual', 'bloxypoints'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'claimed'],
    default: 'pending'
  },
  inventoryIds: [{ type: Schema.Types.ObjectId, ref: 'Inventory' }]
});

export const ordersSchema = new Schema({
  email: String,
  id: String,
  items: [orderItemSchema],
  totalAmount: Number,
  status: {
    type: String,
    enum: ['pending', 'completed', 'ready', 'cancelled'],
    default: 'pending'
  },
  game: String,
  reciever: {
    username: { type: String, default: '' },
    displayName: { type: String, default: '' },
    id: { type: String, default: '' },
    thumbnail: { type: String, default: '' }
  },
  robuxPurchase: {
    robuxPurchaseId: { type: Schema.Types.ObjectId, ref: 'robuxPurchases', default: null },
    robuxAmount: { type: Number, default: null },
    eurAmount: { type: Number, default: null },
    gamepass: {
      id: { type: String, default: null },
      displayName: { type: String, default: null },
      price: { type: Number, default: null }
    },
    fulfillmentDate: { type: Date, default: null }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const globalSettingsSchema = new Schema({
   _id: { type: String, default: 'settings' }, // Single document identifier
   lastOrdersCursor: String,
   euroToRobuxRate: { type: Number, default: 10 },
   // Square Payment Settings
   usdToRobuxRate: { type: Number, default: 0.00829 },
   squareWebhookSignatures: {
      payments: { type: String, default: null },      // For payment.created events
      disputes: { type: String, default: null }       // For dispute.created events
   },
   discordDisputeWebhookUrl: { type: String, default: null },
   // Purchase Limits
   maxRobuxPerPurchase: { type: Number, default: 10000 },
   minRobuxPerPurchase: { type: Number, default: 300 },
   purchaseLimitHours: { type: Number, default: 6 },
   updatedAt: { type: Date, default: Date.now }
});

export const robuxClaimsSchema = new Schema({
  user: {
    id: String,
    username: String,
    displayName: String,
    email: { type: String, default: '' },
    discordUsername: { type: String, default: '' }
  },
  source: {
    type: String,
    enum: ['affiliate'],
    default: 'affiliate'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled', 'cancelledDueToDispute', 'refunded'],
    default: 'pending'
  },
  game: {
    id: String,
    name: String
  },
  gamepass: {
    id: String,
    displayName: String,
    price: Number
  },
  resolved: { type: Boolean, default: false },
  resolvedAt: { type: Date, default: null },
  robuxAmount: { type: Number, default: 0 },
  hidden: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export const robuxPurchasesSchema = new Schema({
  user: {
    id: String,
    username: String,
    displayName: String,
    email: { type: String, default: '' },
  },
  robuxAmount: { type: Number, default: 0 },
  adjustedRobuxAmount: { type: Number, default: 0 },
  game: {
    id: String,
    name: String
  },
  gamepass: {
    id: String,
    displayName: String,
    price: Number
  },
  paymentId: {
    type: String,
    default: null
  },
  eurAmount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled', 'cancelledDueToDispute'],
    default: 'pending'
  },
  resolved: { type: Boolean, default: false },
  resolvedAt: { type: Date, default: null },
  disputeId: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

// DEPRECATED: Square integration is being replaced by Shopify
export const squarePaymentsSchema = new Schema({
    paymentId: String,
    userId: { type: Schema.Types.ObjectId, ref: 'users' },
    amount: Number,           // USD cents
    robuxAmount: Number,
    status: {
      type: String,
      enum: ['pending', 'authorized', 'completed', 'failed', 'disputed'],
      default: 'pending'
    },
    idempotencyKey: String,
    sourceAmount: Number,     // Original amount before conversion
    sourceCurrency: String,   // USD
    claimData: {              // NEW: Claim data for robux purchases
      type: Schema.Types.Mixed,
      default: null
    },
    createdAt: { type: Date, default: Date.now },
    authorizedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    failureReason: { type: String, default: null },
    disputeId: { type: String, default: null },
    receiptUrl: { type: String, default: null }
});

// DEPRECATED: Square integration is being replaced by Shopify
export const squareDisputesSchema = new Schema({
  disputeId: String,
  paymentId: String,
  userId: { type: Schema.Types.ObjectId, ref: 'users' },
  robuxAmount: Number,
  status: {
    type: String,
    enum: ['created', 'evidence_under_review', 'won', 'lost'],
    default: 'created'
  },
  reason: String,
  evidence: { type: String, default: null },
  claimsAffected: [{
    claimId: { type: Schema.Types.ObjectId, ref: 'robuxClaims' },
    status: String,         // pending_cancelled, already_claimed
    action: String          // auto_cancelled, manual_review_required
  }],
  reversalProcessed: { type: Boolean, default: false },
  reversalTransactionId: { type: Schema.Types.ObjectId, ref: 'robuxTransactions', default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date, default: null }
});

export const robuxLedgerSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  type: {
    type: String,
    enum: ['purchase', 'exchange', 'chargeback', 'adjustment'],
    required: true
  },
  amount: { type: Number, required: true }, // Positive for credit, negative for debit
  balanceAfter: { type: Number, required: true },
  referenceId: { type: String, default: null }, // paymentId, claimId, etc.
  description: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});