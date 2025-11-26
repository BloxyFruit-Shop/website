import { createConnection } from 'mongoose';
import {
  usersSchema,
  verificationsSchema,
  ordersSchema,
  productsSchema,
  inventoryItemSchema,
  globalSettingsSchema,
  robuxClaimsSchema,
  robuxPurchasesSchema,
  squarePaymentsSchema,
  squareDisputesSchema,
  robuxLedgerSchema
} from './schemes.server';
import { MONGODB_URI } from '$env/static/private';
import { building } from '$app/environment';

const db = !building ? createConnection(MONGODB_URI) : null;

const users = db ? db.model('users', usersSchema) : null;
const verifications = db
  ? db.model('verifications', verificationsSchema)
  : null;
const orders = db ? db.model('orders', ordersSchema) : null;
const products = db ? db.model('products', productsSchema) : null;
const inventory = db
  ? db.model('inventory', inventoryItemSchema, 'inventory')
  : null;
const globalSettings = db
  ? db.model('globalSettings', globalSettingsSchema)
  : null;
const robuxClaims = db ? db.model('robuxClaims', robuxClaimsSchema) : null;
const robuxPurchases = db ? db.model('robuxPurchases', robuxPurchasesSchema) : null;
const squarePayments = db ? db.model('squarePayments', squarePaymentsSchema) : null;
const squareDisputes = db ? db.model('squareDisputes', squareDisputesSchema) : null;
const robuxLedger = db ? db.model('robuxLedger', robuxLedgerSchema) : null;

export const closeConnection = () => {
  db.close();
};

export { users, verifications, orders, products, inventory, globalSettings, robuxClaims, robuxPurchases, squarePayments, squareDisputes, robuxLedger };
