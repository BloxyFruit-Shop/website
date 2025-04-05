import { json } from '@sveltejs/kit';

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

    const gameList = data.data
    if (!gameList || gameList.length === 0) {
      return json({ error: 'No games found for the provided user ID.' }, { status: 404 });
    }

    // Extract the game IDs from the response data and join them into a comma-separated string
    const ids = gameList.map(game => game.id).join(",");

    // Build the thumbnails API URL and fetch the thumbnails for each game
    const thumbnailsApiUrl = `https://thumbnails.roblox.com/v1/games/icons?universeIds=${ids}&returnPolicy=PlaceHolder&size=50x50&format=Png&isCircular=false`
    const thumbnails = await fetch(thumbnailsApiUrl)

    if (!thumbnails.ok) {
      return json({ error: 'Error fetching game thumbnails.' }, { status: thumbnails.status });
    }

    const thumbnailsData = (await thumbnails.json()).data;

    // Construct the final response data with game details and thumbnails
    const games = gameList.map(game => ({
      id: game.id,
      name: game.name,
      thumbnail: thumbnailsData.filter(thumbnail => thumbnail.targetId === game.id)[0]?.imageUrl ?? ""
    }))

    return json(games);
  } catch (error) {
    console.error('Error in Roblox games API endpoint:', error);
    return json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
