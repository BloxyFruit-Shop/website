import { createConnection } from 'mongoose';
import {
  usersSchema,
  verificationsSchema,
  ordersSchema,
  productsSchema,
  inventoryItemSchema,
  globalSettingsSchema,
  robuxClaimsSchema
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

export const closeConnection = () => {
  db.close();
};

export { users, verifications, orders, products, inventory, globalSettings, robuxClaims };
