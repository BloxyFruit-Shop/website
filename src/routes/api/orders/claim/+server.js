import { json } from '@sveltejs/kit'
import { orders, inventory } from '$server/mongo'

export async function POST({ request, locals }) {
  const localUser = locals.localUser

  const { orderId, itemId } = await request.json()
  
  try {
    const order = await orders.findOne({ 
      id: orderId,
    })

    console.log(order)
    
    if (!order) {
      return json({ success: false, error: 'Order not found' })
    }

    const orderItem = order.items.find(item => item.productId === itemId)

    console.log(orderItem, order.items, itemId)

    if (!orderItem || orderItem.deliveryType !== 'account' || orderItem.status !== 'pending') {
      return json({ success: false, error: 'Item cannot be claimed' })
    }

    // Get and update inventory item
    const inventoryItem = await inventory.findOneAndUpdate(
      {
        productId: orderItem.productId,
        type: 'account',
        status: 'available'
      },
      {
        $set: {
          status: 'claimed',
          claimedBy: localUser._id,
          claimedAt: new Date()
        }
      },
      { new: true }
    )

    if (!inventoryItem) {
      return json({ success: false, error: 'Item not available' })
    }

    // Update order item status
    await orders.updateOne(
      { 'items.productId': itemId },
      { 
        $set: { 
          'items.$.status': 'claimed'
        }
      }
    )

    return json({
      success: true,
      account: {
        username: inventoryItem.data.username,
        password: inventoryItem.data.password
      }
    })
  } catch (error) {
    console.error('Error claiming item:', error)
    return json({ success: false, error: 'Failed to claim item' })
  }
}