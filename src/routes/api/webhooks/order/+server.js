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

  if (!order?.note?.startsWith('affiliate-')) {
    console.log('No affiliate');
    return new Response('No effect', { status: 200 });
  }

  const bought = order.line_items.reduce((acc, item) => {
    const id = String(item.variant_id);
    const amount = item.quantity;

    acc[id] = amount;
    return acc;
  }, {});

  const productIds = Object.keys(bought);
  if (!productIds.length) {
    console.log('No productIds');
    return new Response('No effect', { status: 200 });
  }

  const affiliate = order.note.split('affiliate-')[1];
  const user = await users.findOne({ referralCode: affiliate }).lean();

  if (!user) {
    console.log('User not found', affiliate);
    return new Response('Invalid affiliate code', { status: 200 });
  }

  const items = await products
    .find({ productId: { $in: productIds } })
    .lean();
  const robuxAmount = items.reduce((acc, item) => {
    const amount = bought[item.productId] ?? 0;
    return acc + (item?.robux * amount ?? 0);
  }, 0);

  await users.updateOne(
    { _id: user._id },
    { $inc: { robux: robuxAmount } }
  );

  return new Response('Webhook received successfully', { status: 200 });
}
