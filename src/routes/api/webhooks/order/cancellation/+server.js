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

  console.log(order);

  return new Response('Webhook received successfully', { status: 200 });
}
