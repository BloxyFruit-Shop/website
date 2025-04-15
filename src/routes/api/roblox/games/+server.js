import { json } from '@sveltejs/kit';
import { getRobloxGameThumbnail, cacheRobloxGameThumbnail } from '$server/cache';

/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function POST({ request, locals }) {
  const localUser = locals.localUser;
  if (!localUser) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Parse the request body to get the user ID
    const { userId } = await request.json();
    if (!userId) {
      return json({ error: 'Please provide a userId.' }, { status: 400 });
    }

    // Build the Roblox games API URL using the provided userId
    const gamesApiUrl = `https://games.roblox.com/v2/users/${encodeURIComponent(userId)}/games?accessFilter=2&limit=10&sortOrder=Asc`;

    // Make the API call to fetch the user's games
    const response = await fetch(gamesApiUrl);
    if (!response.ok) {
      return json({ error: 'Error fetching games data.' }, { status: response.status });
    }
    
    // Parse the response data to get the list of games
    const data = await response.json();

    const gameList = data.data;
    if (!gameList || gameList.length === 0) {
      // Return empty list instead of 404 if user simply has no public games
      return json([]);
    }

    // Process thumbnails: Check cache and identify missing ones
    const idsToFetch = [];
    const cachedThumbnails = new Map(); // Temporary map to hold fetched/cached URLs

    for (const game of gameList) {
      const universeId = game.id;
      const cachedUrl = getRobloxGameThumbnail(universeId);
      if (cachedUrl) {
        cachedThumbnails.set(universeId, cachedUrl);
      } else {
        idsToFetch.push(universeId);
      }
    }

    // Fetch missing thumbnails if any
    if (idsToFetch.length > 0) {
      const idsString = idsToFetch.join(",");
      const thumbnailsApiUrl = `https://thumbnails.roblox.com/v1/games/icons?universeIds=${idsString}&returnPolicy=PlaceHolder&size=50x50&format=Png&isCircular=false`;
      
      try {
        const thumbnailsResponse = await fetch(thumbnailsApiUrl);
        if (thumbnailsResponse.ok) {
          const thumbnailsData = (await thumbnailsResponse.json()).data;
          thumbnailsData.forEach(thumbnail => {
            if (thumbnail.imageUrl) {
              // Cache the newly fetched thumbnail
              cacheRobloxGameThumbnail(thumbnail.targetId, thumbnail.imageUrl);
              cachedThumbnails.set(thumbnail.targetId, thumbnail.imageUrl);
            } else {
              cachedThumbnails.set(thumbnail.targetId, "");
            }
          });
        } else {
          console.warn(`Failed to fetch some game thumbnails: ${thumbnailsResponse.status}`);
          // Mark IDs we tried to fetch but failed as empty string
          idsToFetch.forEach(id => {
            if (!cachedThumbnails.has(id)) {
              cachedThumbnails.set(id, "");
            }
          });
        }
      } catch (thumbError) {
        console.error('Error fetching Roblox game thumbnails:', thumbError);
        // Mark IDs we tried to fetch but failed as empty string
        idsToFetch.forEach(id => {
          if (!cachedThumbnails.has(id)) {
            cachedThumbnails.set(id, "");
          }
        });
      }
    }

    // Construct the final response data with game details and thumbnails
    const games = gameList.map(game => ({
      id: game.id,
      name: game.name,
      thumbnail: cachedThumbnails.get(game.id) ?? ""
    }));

    return json(games);
  } catch (error) {
    console.error('Error in Roblox games API endpoint:', error);
    return json({ error: 'An unexpected error occurred while fetching Roblox games.' }, { status: 500 });
  }
}
