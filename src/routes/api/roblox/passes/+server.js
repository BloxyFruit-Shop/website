import { json } from '@sveltejs/kit';
import noblox from 'noblox.js';

/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function POST({ request, locals }) {
  const localUser = locals.localUser;
  if (!localUser) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Parse the request body to get the gamepass ID
    const { gamepassId } = await request.json();
    if (!gamepassId) {
      return json({ error: 'Please provide a gamepassId.' }, { status: 400 });
    }

    // Validate that gamepassId is a number
    if (isNaN(gamepassId) || gamepassId <= 0) {
      return json({ error: 'Invalid gamepass ID. Please provide a valid numeric ID.' }, { status: 400 });
    }

    // Fetch gamepass product info using noblox
    let gamepassInfo;
    try {
      gamepassInfo = await noblox.getGamePassProductInfo(gamepassId);
    } catch (nobloxError) {
      console.error(`Error fetching gamepass info for ID ${gamepassId}:`, nobloxError);
      
      // Provide specific error messages based on the error
      if (nobloxError.message && nobloxError.message.includes('404')) {
        return json({ error: 'Gamepass not found. Please check the gamepass ID and try again.' }, { status: 404 });
      }
      
      return json({ error: 'Failed to fetch gamepass information. Please verify the gamepass ID is correct.' }, { status: 400 });
    }

    // Validate the response structure
    if (!gamepassInfo || typeof gamepassInfo !== 'object') {
      console.error(`Unexpected response structure for gamepass ID ${gamepassId}`);
      return json({ error: 'Unexpected response format from gamepass API.' }, { status: 500 });
    }

    // Verify it's actually a gamepass
    if (gamepassInfo.ProductType !== 'Game Pass') {
      return json({ error: 'The provided ID is not a valid gamepass. Please check the ID and try again.' }, { status: 400 });
    }

    // Verify the gamepass is for sale
    if (!gamepassInfo.IsForSale) {
      return json({ error: 'This gamepass is not currently for sale.' }, { status: 400 });
    }

    // Return the gamepass info with relevant fields
    return json({
      id: gamepassInfo.TargetId,
      name: gamepassInfo.Name,
      price: gamepassInfo.PriceInRobux,
      description: gamepassInfo.Description,
      creator: gamepassInfo.Creator?.Name || 'Unknown',
      isForSale: gamepassInfo.IsForSale,
      productId: gamepassInfo.ProductId
    });
  } catch (error) {
    console.error('Error in Roblox gamepass API endpoint:', error);
    
    // Check if the error is due to invalid JSON parsing
    if (error instanceof SyntaxError) {
      return json({ error: 'Invalid request format.' }, { status: 400 });
    }
    
    return json({ error: 'An unexpected error occurred while fetching gamepass information.' }, { status: 500 });
  }
}
