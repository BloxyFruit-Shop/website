import { json } from '@sveltejs/kit';
import { robuxPurchases } from '$server/mongo';

export async function POST({ request, locals }) {
  try {
    // Get authenticated user
    const localUser = locals.localUser;
    if (!localUser) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      robuxAmount,
      adjustedRobuxAmount,
      user: robloxUser,
      game,
      gamepass
    } = body;

    // Validate robux amount
    if (!robuxAmount || robuxAmount < 300 || robuxAmount > 10000) {
      return json({ error: 'Invalid robux amount' }, { status: 400 });
    }

    // Validate required claim data
    if (!robloxUser || !game || !gamepass) {
      return json({ error: 'Missing required claim data' }, { status: 400 });
    }

    // Create pending robux purchase
    const purchase = {
      user: {
        id: localUser._id,
        username: localUser.username,
        displayName: robloxUser.displayName,
        email: localUser.email
      },
      robuxAmount: robuxAmount,
      adjustedRobuxAmount: adjustedRobuxAmount,
      game: {
        id: game.id,
        name: game.name
      },
      gamepass: {
        id: gamepass.id,
        displayName: gamepass.displayName,
        price: gamepass.price
      },
      status: 'pending',
      paymentId: null, // Will be updated by webhook
      eurAmount: 0, // Will be updated by webhook
      resolved: false,
      createdAt: new Date(),
      resolvedAt: null
    };

    const result = await robuxPurchases.create(purchase);

    return json({
      success: true,
      purchaseId: result._id,
      purchase: {
        ...purchase,
        _id: result._id
      }
    });
  } catch (error) {
    console.error('Error creating robux purchase:', error);
    return json({ error: 'Failed to create purchase' }, { status: 500 });
  }
}
