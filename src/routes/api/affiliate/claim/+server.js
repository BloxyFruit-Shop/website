import { json } from '@sveltejs/kit';
import { users, robuxClaims } from '$server/mongo';
import { DISCORD_AFFILIATE_CLAIM_WEBHOOK } from '$env/static/private';

/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function POST({ request, locals }) {
  const localUser = locals.localUser;

  if (!localUser) {
    return json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
  }

  try {
    const dbUser = await users.findOne({ _id: localUser._id }).lean();

    if (!dbUser) {
      // This case should be rare if the session is valid
      console.error(
        `User with ID ${localUser._id} found in session but not in database.`
      );
      return json({ error: 'User not found in database.' }, { status: 404 });
    }

    const {
      robuxAmount,
      user: requestUser,
      game,
      gamepass
    } = await request.json();

    if (robuxAmount === undefined || robuxAmount === null) {
      return json(
        { error: 'Missing required field: robuxAmount.' },
        { status: 400 }
      );
    }
    if (!requestUser || !game || !gamepass) {
      return json(
        {
          error:
            'Missing required user, game, or gamepass details in the request body.'
        },
        { status: 400 }
      );
    }
    if (typeof robuxAmount !== 'number' || robuxAmount <= 0) {
      return json(
        { error: 'Invalid robuxAmount. Must be a positive number.' },
        { status: 400 }
      );
    }

    // Verify the user robux balance
    if (dbUser.robux === undefined || dbUser.robux < robuxAmount) {
      console.log(dbUser);
      console.warn(
        `User ${dbUser.username} (ID: ${dbUser._id}) attempted claim with insufficient funds. Needed: ${robuxAmount}, Has: ${dbUser.robux}`
      );
      return json({ error: 'Insufficient Robux balance.' }, { status: 400 });
    }

    await users.updateOne({
      _id: dbUser._id
    }, {
      $inc: {
        robux: -robuxAmount
      }
    });

    await robuxClaims.create({
      user: {
        id: dbUser._id,
        username: requestUser.username,
        displayName: requestUser.displayName,
        email: localUser.email,
      },
      robuxAmount: robuxAmount,
      game: {
        id: game.id,
        name: game.name
      },
      gamepass: {
        id: gamepass.id,
        displayName: gamepass.displayName,
        price: gamepass.price
      }
    })

    await fetch(DISCORD_AFFILIATE_CLAIM_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        embeds: [
          {
            title: '✅ | Cobro procesado',
            description: `## Solicitud entrante | ${robuxAmount} Robux`,
            color: 5822829,
            author: {
              name: 'Bloxyfruit - Claim Notifier',
              icon_url: 'https://bloxyfruit.com/favicon.png'
            },
            thumbnail: {
              url: requestUser.thumbnail
            },
            fields: [
              {
                name: '👤| Usuario',
                value: `**Name:** ${requestUser.displayName}\n**Username:** [@${requestUser.username}](https://www.roblox.com/users/${requestUser.userId}/profile)\n**User ID:** ${requestUser.userId}`,
                inline: true
              },
              {
                name: '💰| Monto',
                value: `${robuxAmount} Robux`,
                inline: true
              },
              {
                name: '🎟️| Gamepass Utilizado',
                value: `**Name:** ${gamepass.displayName}\n**Price:** ${gamepass.price} Robux\n**ID:** ${gamepass.id}\nhttps://www.roblox.com/game-pass/${gamepass.id}`,
                inline: false
              },
              {
                name: '🎮 Juego Asociado',
                value: `**Name:** ${game.name}\nhttps://www.roblox.com/games/${game.id}`,
                inline: true
              }
            ],
            footer: {
              text: 'BloxyFruit - Most Trusted In-Game Store'
            },
            timestamp: new Date()
          }
        ]
      })
    });

    return json({
      success: true,
      message: 'Claim verification successful. Proceeding with claim.'
    });
  } catch (error) {
    console.error('Error in claim API endpoint:', error);

    // Handle JSON parsing errors specifically
    if (error instanceof SyntaxError) {
      return json(
        { error: 'Invalid request body format. Failed to parse JSON.' },
        { status: 400 }
      );
    }

    // Handle generic server errors
    return json(
      { error: 'An unexpected error occurred during the claim process.' },
      { status: 500 }
    );
  }
}
