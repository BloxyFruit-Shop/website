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
    // Parse the request body to get the game ID
    const { gameId } = await request.json();
    if (!gameId) {
      return json({ error: 'Please provide a gameId.' }, { status: 400 });
    }

    // Build the Roblox game passes API URL using the provided gameId
    const gamePassesApiUrl = `https://games.roblox.com/v1/games/${encodeURIComponent(gameId)}/game-passes?limit=20&sortOrder=2`;

    // Make the API call to fetch the game passes
    const response = await fetch(gamePassesApiUrl);

    // Handle specific Roblox API errors
    if (response.status === 400) {
        return json({ error: "The universe's root place is invalid or the gameId is incorrect." }, { status: 400 });
    }
    if (response.status === 404) {
        return json({ error: 'The requested universe does not exist.' }, { status: 404 });
    }

    // Handle other non-successful responses
    if (!response.ok) {
      console.error(`Error fetching game passes data for gameId ${gameId}: ${response.status} ${response.statusText}`);
      return json({ error: 'Error fetching game passes data from Roblox.' }, { status: response.status });
    }

    // Parse the response data to get the list of game passes
    const data = await response.json();

    // Extract the gamepass list
    const gamePassList = data.data;

    if (!Array.isArray(data.data)) {
      // This is a failsafe in case they change the structure in the future
      console.error(`Unexpected response structure for gameId ${gameId}: 'data' field missing or not an array.`);
      return json({ error: 'Unexpected response format from Roblox game passes API.' }, { status: 500 });
    }

    // Return the list of game passes
    return json(gamePassList);
  } catch (error) {
    console.error('Error in Roblox game passes API endpoint:', error);
    // Check if the error is due to invalid JSON parsing (e.g., Roblox returned non-JSON error page)
    if (error instanceof SyntaxError) {
        return json({ error: 'Failed to parse response from Roblox API.' }, { status: 502 });
    }
    return json({ error: 'An unexpected error occurred while fetching Roblox game passes.' }, { status: 500 });
  }
}
