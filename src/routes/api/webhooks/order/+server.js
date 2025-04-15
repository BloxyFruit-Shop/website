import { SHOPIFY_WEBHOOK_SIGNATURE } from '$env/static/private';
import { users, globalSettings } from '$server/mongo';
import crypto from 'crypto';

export async function POST({ request }) {
  // Get the expected signature from Shopify header
  const hmac = request.headers.get('X-Shopify-Hmac-Sha256');

  const body = await request.text();

  const hash = crypto
    .createHmac('sha256', SHOPIFY_WEBHOOK_SIGNATURE)
    .update(body, 'utf8')
    .digest('base64');

  // Validate signature
  if (hash !== hmac) return new Response('Unauthorized', { status: 401 });

  const order = JSON.parse(body);

  // Check that the note has an affiliate code attached
  if (!order?.note?.startsWith('affiliate-')) {
    console.log('No affiliate');
    return new Response('No effect', { status: 200 });
  }

  const affiliate = order.note.split('affiliate-')[1];
  const user = await users.findOne({ referralCode: affiliate }).lean();

  // Check if the user exists and is not using his own code
  if (!user) {
    console.log('User not found', affiliate);
    return new Response('Invalid affiliate code', { status: 200 });
  }

  const buyerEmail = order.contact_email;

  if (user.email === buyerEmail) {
    console.log('User used his own code:', affiliate);
    return new Response('No effect', { status: 200 });
  }

  // Get the bought items ids and their quantities
  const total = order.line_items.reduce((acc, item) => {
    const amount = item.quantity ?? 0;
    const price = item.price ?? 0;

    return acc + (amount * price);
  }, 0);

  const settings = await globalSettings.findOne({ _id: 'settings' }).lean();
  if (!settings) {
    console.error('Global settings not found in the database.');
  }

  if (!settings?.euroToRobuxRate) {
    console.error('Euro to Robux rate not found in the database. Setting up the default value.');
    await globalSettings.updateOne({ _id: 'settings' }, { $set: { euroToRobuxRate: 10 } });
    settings.euroToRobuxRate = 10;
  }

  const euroToRobux = settings.euroToRobuxRate ?? 10;

  const robuxAmount = Math.ceil(total * euroToRobux);

  // Update the user's robux balance
  await users.updateOne({ _id: user._id }, { $inc: { robux: robuxAmount } });

  return new Response('Webhook received successfully', { status: 200 });
}
