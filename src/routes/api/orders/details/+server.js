import { json } from '@sveltejs/kit'
import { orders, inventory } from '$server/mongo'

export async function GET({ url, locals }) {
  const orderId = url.searchParams.get('id')
  
  try {
    const order = await orders.findOne({ 
      id: orderId,
      userId: locals.localUser.id 
    }).lean()

    if (!order) {
      return json({ success: false, error: 'Order not found' })
    }

    const inventoryItems = await inventory.find({
      _id: { 
        $in: order.items
          .filter(item => item.inventoryItemId)
          .map(item => item.inventoryItemId)
      }
    }).lean()

    const enrichedItems = order.items.map(item => {
      const inventoryItem = inventoryItems.find(inv => 
        inv._id.toString() === item.inventoryItemId?.toString()
      )

      return {
        ...item,
        _id: item._id.toString(),
        delivery: inventoryItem ? {
          type: item.deliveryType,
          data: item.deliveryType === 'account' ? {
            username: inventoryItem.data.username,
            password: inventoryItem.data.password,
            claimed: inventoryItem.status === 'claimed',
            claimedAt: inventoryItem.claimedAt
          } : {}
        } : null
      }
    })

    return json({
      success: true,
      order: {
        ...order,
        _id: order._id.toString(),
        items: enrichedItems
      }
    })
  } catch (error) {
    console.error('Error fetching order details:', error)
    return json({ success: false, error: 'Failed to fetch order details' })
  }
}