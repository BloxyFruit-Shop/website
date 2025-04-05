import { users, inventory } from '$server/mongo';
import { timeOffset } from '$server/utils';
import { statusEnums } from '$server/schemes';

// Existing Caches
export const usersCache = {}; // Stores users ( sessionId: { _id, username, status } )
export const productsCache = {}; // Stores products from Shopify ( productId: { _id, title, image, price } )
export const inventoryCache = {}; // Stores inventory items ( productId: { _id, status, claimedBy, claimedAt } )
export const productStockCache = new Map(); // Stores product stock counts (productId: number)

// New Roblox Caches
export const robloxUsersCache = new Map(); // Stores Roblox user data keyed by username (lowercase): Map<username, { data: { displayName, username, userId, thumbnail }, timestamp: number }>
export const robloxGameThumbnailsCache = new Map(); // Stores Roblox game thumbnails keyed by universeId: Map<universeId, { url: string, timestamp: number }>

// Cache Durations
const STOCK_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const ROBLOX_USER_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
const ROBLOX_GAME_THUMBNAIL_CACHE_DURATION = 24 * 60 * 60 * 1000; // A day
const USER_SESSION_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

export const invalidateUserBySession = (session) => delete usersCache[session];

export const cacheUserBySession = (session, _id, data) => {
  usersCache[session] = {
    _id: _id.toString(),
    ...data,
    date: Date.now() - timeOffset
  };
};

export const getUserBySession = async (session) => {
  if (usersCache[session]) {
    const { date, ...userWithoutDate } = usersCache[session];
    return userWithoutDate;
  }

  const dbUser = await users
    .findOne(
      { 'session.id': session },
      { username: 1, email: 1, status: '$status.code' }
    )
    .lean();
  if (!dbUser || dbUser.status == statusEnums.banned) return null;

  cacheUserBySession(session, dbUser._id, {
    username: dbUser.username,
    email: dbUser.email,
    referralCode: dbUser.referralCode,
    status: dbUser.status
  });

  const { date, ...userWithoutDate } = usersCache[session];
  return userWithoutDate;
};

export const cacheProductById = (productId, data) => {
  productsCache[productId] = data;
};

export const getProductById = (productId) => {
  return productsCache[productId];
};

export const cacheInventoryItem = (_id, data) => {
  inventoryCache[_id] = data;
};

export const getInventoryItemById = async (_id) => {
  if (inventoryCache[_id]) return inventoryCache[_id];

  const dbItem = await inventory
    .findOne(
      { _id },
      { productId: 1, status: 1, data: 1, claimedBy: 1, claimedAt: 1 }
    )
    .lean();
  if (!dbItem) return null;

  cacheInventoryItem(_id, dbItem);
  return dbItem;
};

export const checkInventoryItemAvailability = (productId) => {
  return Object.values(inventoryCache).find(
    (item) => item.productId === productId && item.status === 'available'
  );
};

export const updateProductStock = async (productId) => {
  try {
    const count = await inventory.countDocuments({
      productId,
      status: 'available'
    });

    productStockCache.set(productId, {
      count,
      date: Date.now()
    });

    return count;
  } catch (err) {
    console.error(`Error updating stock for product ${productId}:`, err);
    return 0;
  }
};

export const getProductStock = async (productId) => {
  const stringProductId = String(productId);
  const cached = productStockCache.get(stringProductId);

  // If cached and not expired, return cached value
  if (cached && Date.now() - cached.date < STOCK_CACHE_DURATION) {
    return cached.count;
  }

  // Otherwise fetch and cache new count
  return await updateProductStock(productId);
};

// Roblox user cache functions
export const getRobloxUserByUsername = (username) => {
  const lowerCaseUsername = username.toLowerCase();
  const cached = robloxUsersCache.get(lowerCaseUsername);

  if (cached && Date.now() - cached.timestamp < ROBLOX_USER_CACHE_DURATION) {
    return cached.data;
  }

  return null;
};

export const cacheRobloxUser = (username, data) => {
  const lowerCaseUsername = username.toLowerCase();
  robloxUsersCache.set(lowerCaseUsername, {
    data,
    timestamp: Date.now()
  });
};

// Roblox game thumbnail cache functions
export const getRobloxGameThumbnail = (universeId) => {
  const stringUniverseId = String(universeId);
  const cached = robloxGameThumbnailsCache.get(stringUniverseId);

  if (
    cached &&
    Date.now() - cached.timestamp < ROBLOX_GAME_THUMBNAIL_CACHE_DURATION
  ) {
    return cached.url;
  }

  return null;
};

export const cacheRobloxGameThumbnail = (universeId, url) => {
  robloxGameThumbnailsCache.set(String(universeId), {
    url,
    timestamp: Date.now()
  });
};

// Cache cleanup helper
const cleanupCache = (cache, duration) => {
  const now = Date.now();
  for (const [key, data] of cache.entries()) {
    const timestamp = data.timestamp || data.date;
    if (timestamp && now - timestamp > duration) {
      cache.delete(key);
    }
  }
};

// Cleanup all caches periodically
setInterval(() => {
  const now = Date.now();

  // Clean up map caches
  cleanupCache(productStockCache, STOCK_CACHE_DURATION);
  cleanupCache(robloxUsersCache, ROBLOX_USER_CACHE_DURATION);
  cleanupCache(robloxGameThumbnailsCache, ROBLOX_GAME_THUMBNAIL_CACHE_DURATION);

  // Clean up old sessions cache
  for (const session in usersCache) {
    if (usersCache.hasOwnProperty(session)) {
      const userEntry = usersCache[session];
      if (
        userEntry.date &&
        now - userEntry.date > USER_SESSION_CACHE_DURATION
      ) {
        delete usersCache[session];
      }
    }
  }
}, CLEANUP_INTERVAL);
