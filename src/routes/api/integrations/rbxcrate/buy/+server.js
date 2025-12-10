import { RBXCRATE_MERCHANT_KEY } from '$env/static/private';
import { users } from '$server/mongo';
import { roleEnums } from '$server/schemes';
import { json } from '@sveltejs/kit';
import noblox from 'noblox.js';

export const POST = async ({ request, locals }) => {
  const session = locals.session;
  if (!session) {
    return json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  
  const user = await users.findOne({ 'session.id': session }).lean();
  if (!user || !user.role || user.role < roleEnums.Admin) {
    return json({ success: false, message: 'Forbidden' }, { status: 403 });
  }
  
  const { robloxUsername, robuxAmount, placeId, orderId } = await request.json();
  
  if (!RBXCRATE_MERCHANT_KEY) {
    console.error('RBXCRATE_MERCHANT_KEY is not set');
    return json({ success: false, message: 'Server configuration error' }, { status: 500 });
  }

  
  const universeInfo = await noblox.getUniverseInfo([placeId]);
  
  const payload = {
    orderId: orderId, // ID único interno
    robloxUsername: robloxUsername,
    robuxAmount: parseInt(robuxAmount),
    placeId: universeInfo[0].rootPlaceId,
    isPreOrder: true,
    checkOwnership: false
  };
  
  try {
    const response = await fetch('https://rbxcrate.com/api/orders/gamepass', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': RBXCRATE_MERCHANT_KEY
      },
      body: JSON.stringify(payload)
    });

    console.log("Payload:", payload);
  
    const data = await response.json();
  
    // Log de Inspección requested by user
    console.log('RBXCRATE Response:', JSON.stringify(data, null, 2));
  
    if (response.ok && data.success) {
      return json(data);
    } else {
      return json({
        success: false,
        message: data.message || 'Failed to purchase gamepass',
        details: data
      }, { status: response.status });
    }
  } catch (error) {
    console.error('RBXCRATE API Error:', error);
    return json({ success: false, message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
};