import { users, inventory } from "$server/mongo"
import { timeOffset } from "$server/utils"
import { statusEnums } from "$server/schemes"

export const usersCache = {} // Stores users ( sessionId: { _id, username, status } )
export const productsCache = {} // Stores products from Shopify ( productId: { _id, title, image, price } )
export const inventoryCache = {} // Stores inventory items ( productId: { _id, status, claimedBy, claimedAt } )
export const productStockCache = new Map() // Stores product stock counts (productId: number)

const STOCK_CACHE_DURATION = 5 * 60 * 1000

export const invalidateUserBySession = (session) => delete usersCache[session]

export const cacheUserBySession = (session, _id, data) => {
  usersCache[session] = {
    _id: _id.toString(),
    ...data,
    date: Date.now() - timeOffset
  }
}

export const getUserBySession = async(session) => {
  if (usersCache[session]) {
    const { date, ...userWithoutDate } = usersCache[session]
    return userWithoutDate
  }

  const dbUser = await users.findOne({ "session.id": session }, { username: 1, email: 1, status: "$status.code" }).lean()
  if (!dbUser || dbUser.status == statusEnums.banned) return null
  
  cacheUserBySession(session, dbUser._id, {
    username: dbUser.username,
    email: dbUser.email,
    status: dbUser.status,
  })

  const { date, ...userWithoutDate } = usersCache[session]
  return userWithoutDate
}

export const cacheProductById = (productId, data) => {
  productsCache[productId] = data
}

export const getProductById = (productId) => {
  return productsCache[productId]
}

export const cacheInventoryItem = (_id, data) => {
  inventoryCache[_id] = data
}

export const getInventoryItemById = async (_id) => {
  if (inventoryCache[_id]) return inventoryCache[_id]

  const dbItem = await inventory.findOne({ _id }, { productId: 1, status: 1, data: 1, claimedBy: 1, claimedAt: 1 }).lean()
  if (!dbItem) return null

  cacheInventoryItem(_id, dbItem)
  return dbItem
}

export const checkInventoryItemAvailability = (productId) => {
  return Object.values(inventoryCache).find(item => item.productId === productId && item.status === "available")
}

export const updateProductStock = async (productId) => {
  try {
    const count = await inventory.countDocuments({
      productId,
      status: 'available'
    })
    
    productStockCache.set(productId, {
      count,
      date: Date.now()
    })
    
    return count
  } catch (err) {
    console.error(`Error updating stock for product ${productId}:`, err)
    return 0
  }
}

export const getProductStock = async (productId) => {
  const cached = productStockCache.get(productId)
  
  // If cached and not expired, return cached value
  if (cached && (Date.now() - cached.date) < STOCK_CACHE_DURATION) {
    return cached.count
  }
  
  // Otherwise fetch and cache new count
  return await updateProductStock(productId)
}

// Add this to clean up old cache entries every hour
setInterval(() => {
  const now = Date.now()
  for (const [productId, data] of productStockCache.entries()) {
    if (now - data.date > STOCK_CACHE_DURATION) {
      productStockCache.delete(productId)
    }
  }
}, STOCK_CACHE_DURATION)

// Make an interval that goes every 1 minute through usersCache and checks if the user is 5 minutes old, if so then delete it.