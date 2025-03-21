import { json } from '@sveltejs/kit';

export async function POST({ request }) {
  try {
    // Parse the request body
    const { username } = await request.json();

    if (!username) {
      return json({ error: 'Please provide a username.' }, { status: 400 });
    }

    // Make the first API call to search for the username
    const searchResponse = await fetch(
      'https://users.roblox.com/v1/usernames/users',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          usernames: [encodeURI(username)],
          excludeBannedUsers: true
        })
      }
    );

    if (!searchResponse.ok) {
      return json(
        { error: 'Error searching for user.' },
        { status: searchResponse.status }
      );
    }

    const searchData = await searchResponse.json();

    // Check if any user data is returned
    if (!searchData.data || searchData.data.length === 0) {
      return json({ error: 'User not found.' }, { status: 404 });
    }

    const user = searchData.data[0];

    // Make the second API call to fetch the user's thumbnail info
    const thumbResponse = await fetch(
      `https://thumbnails.roblox.com/v1/users/avatar?userIds=${user.id}&size=100x100&format=Png&isCircular=false`
    );

    if (!thumbResponse.ok) {
      return json(
        { error: 'Error fetching thumbnail.' },
        { status: thumbResponse.status }
      );
    }

    const thumbData = await thumbResponse.json();

    // Prepare the result object
    const result = {
      displayName: user.displayName,
      username: username,
      userId: user.id,
      thumbnail:
        thumbData.data && thumbData.data[0] ? thumbData.data[0].imageUrl : ''
    };

    return json(result);
  } catch (error) {
    console.error('Error in Roblox proxy endpoint:', error);
    return json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
