import { SHOPIFY_WEBHOOK_SIGNATURE } from '$env/static/private';
import { products, users } from '$server/mongo';
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

  // 1 euro = 10 robux
  const robuxAmount = Math.ceil(total * 10);

  // Update the user's robux balance
  await users.updateOne({ _id: user._id }, { $inc: { robux: robuxAmount } });

  return new Response('Webhook received successfully', { status: 200 });
}
