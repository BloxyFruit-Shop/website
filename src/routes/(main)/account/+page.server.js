import { orders } from "$server/mongo"
import { getInventoryItemById } from "$server/cache"
import { redirect } from "@sveltejs/kit"

export const load = async ({ locals }) => {
  const localUser = locals.localUser
  if (!localUser) return redirect(303, "/")

  const orderList = await orders.find({ email: localUser.email }).limit(20).lean()

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

  return {
    localUser,
    orders: serializedOrders
  }
}