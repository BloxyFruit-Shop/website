import { json } from '@sveltejs/kit';
import { orders } from '$server/mongo';

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function POST({ request, locals }) {
  // Check if a user is logged in using locals.localUser
  const localUser = locals.localUser;
  if (!localUser) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch (err) {
    return json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  const { orderId, reciever } = body;
  if (!orderId || !reciever || !reciever.username) {
    return json({ error: 'Missing orderId or reciever information.' }, { status: 400 });
  }

  try {
    // Ensure the order belongs to the local user.
    const order = await orders.findOne({ id: orderId, email: localUser.email });
    if (!order) {
      return json({ error: 'Order not found or not authorized.' }, { status: 404 });
    }

    // Update the reciever field. Note: this field is optional in your schema.
    order.reciever = {
      username: reciever.username,
      displayName: reciever.displayName || "",
      id: reciever.id || "",
      thumbnail: reciever.thumbnail || ""
    };

    await order.save();

    return json({ success: true, order });
  } catch (error) {
    console.error('Error updating order reciever:', error);
    return json({ error: 'An error occurred while updating the order.' }, { status: 500 });
  }
}