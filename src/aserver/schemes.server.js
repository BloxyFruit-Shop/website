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
  referralCode: { type: String, default: createCode },
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
    enum: ['account', 'manual'],
    required: true
  },
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
    enum: ['account', 'manual'],
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

export const globalSettingsSchema = new Schema({
  _id: { type: String, default: 'settings' }, // Single document identifier
  lastOrdersCursor: String,
  euroToRobuxRate: { type: Number, default: 10 },
  updatedAt: { type: Date, default: Date.now }
});

export const robuxClaimsSchema = new Schema({
  user: {
    id: String,
    username: String,
    displayName: String,
    email: { type: String, default: '' },
  },
  resolved: { type: Boolean, default: false },
  resolvedAt: { type: Date, default: null },
  robuxAmount: { type: Number, default: 0 },
  game: {
    id: String,
    name: String
  },
  gamepass: {
    id: String,
    displayName: String,
    price: Number
  },
  createdAt: { type: Date, default: Date.now }
});