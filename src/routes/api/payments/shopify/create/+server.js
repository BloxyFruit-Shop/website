import { shopifySession, shopify } from '$server/api';
import { SHOPIFY_URL } from '$env/static/private';
import { redirect } from '@sveltejs/kit';

export async function POST({ request, locals }) {
  const { variantId } = await request.json();
  const user = locals.localUser;

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const queryString = `
    mutation {
      cartCreate(
        input: {
          lines: [
            {
              quantity: 1,
              merchandiseId: "gid://shopify/ProductVariant/${variantId}"
            }
          ],
          attributes: [
            {
              key: "userId",
              value: "${user._id.toString()}"
            },
            {
              key: "deliveryType",
              value: "bloxypoints"
            }
          ]
        }
      ) {
        cart {
          id
          checkoutUrl
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  try {
    const client = new shopify.clients.Storefront({ session: shopifySession });
    const response = await client.request(queryString);
    
    const data = response?.data?.cartCreate;
    
    if (data?.userErrors?.length > 0) {
      console.error('Shopify Cart Create Error:', data.userErrors);
      return new Response(JSON.stringify({ error: 'Failed to create checkout' }), { status: 500 });
    }

    const checkoutUrl = data?.cart?.checkoutUrl;

    if (!checkoutUrl) {
      return new Response(JSON.stringify({ error: 'No checkout URL returned' }), { status: 500 });
    }

    return new Response(JSON.stringify({ webUrl: checkoutUrl }), { status: 200 });

  } catch (err) {
    console.error('Error creating Shopify checkout:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
