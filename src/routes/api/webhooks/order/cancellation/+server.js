import { SHOPIFY_WEBHOOK_SIGNATURE } from '$env/static/private';
import { processDispute } from '$server/disputes.server.js'; // Assuming alias works, or relative path
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

  const payload = JSON.parse(body);
  
  try {
    await processDispute(payload.id, payload.cancel_reason);
    return new Response('Webhook processed successfully', { status: 200 });

  } catch (error) {
    console.error('Error processing cancellation webhook:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
