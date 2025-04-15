import { orders, users, robuxClaims } from "$server/mongo"
import { getInventoryItemById } from "$server/cache"
import { redirect } from "@sveltejs/kit"

const ORDERS_PER_PAGE = 10 // Define how many orders per page

export const load = async ({ locals, url }) => {
  const localUser = locals.localUser
  if (!localUser) return redirect(303, "/")

  let page = parseInt(url.searchParams.get("page") || "1", 10)
  if (isNaN(page) || page < 1) {
    page = 1
  }

  const limit = ORDERS_PER_PAGE
  
  // Fetch total order count for pagination calculation
  const totalOrders = await orders.countDocuments({ email: localUser.email })
  const totalPages = Math.ceil(totalOrders / limit) || 1 // Ensure totalPages is at least 1
  
  // Adjust page if it exceeds totalPages
  if (page > totalPages && totalPages > 0) {
    page = totalPages
  }

  const skip = (page - 1) * limit
  
  // Fetch the paginated list of orders
  const orderList = await orders
    .find({ email: localUser.email })
    .sort({ createdAt: -1 }) // Make the newest show at the top (It was annoying to scroll down)
    .skip(skip)
    .limit(limit)
    .lean()

  const serializedOrders = []
  for (const order of orderList) {
    const serializedItems = []
  
    for (const item of order.items) {
      const inventoryItems = []
  
      for (const inventoryId of item.inventoryIds) {
        const inventoryItem = await getInventoryItemById(inventoryId._id)
        inventoryItem._id = inventoryId._id.toString()
        inventoryItems.push(inventoryItem)
      }
  
      serializedItems.push({
        ...item,
        inventoryItems,
        inventoryIds: null
      })
    }
  
    serializedOrders.push({
      ...order,
      _id: order._id.toString(),
      items: serializedItems
    })
  }

  const user = await users.findOne({ _id: localUser._id }).lean();

  const claims = await robuxClaims.find({ "user.email": localUser.email }).select({ _id: 1, robuxAmount: 1, "user.username": 1, resolved: 1, resolvedAt: 1, createdAt: 1 }).lean();

  const serializedClaims = claims.map((claim) => ({
    ...claim,
    _id: claim._id.toString(),
    createdAt: new Date(claim.createdAt),
    resolvedAt: claim.resolvedAt ? new Date(claim.resolvedAt) : null
  }))

  return {
    localUser,
    referral: user.referralCode ?? null,
    robuxAmount: user?.robux ?? 0,
    orders: serializedOrders,
    claims: serializedClaims,
    pagination: {
      currentPage: page,
      totalPages: totalPages,
      limit: limit,
      totalOrders: totalOrders
    }
  }
}
