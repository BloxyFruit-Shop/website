import { products, shopify, shopifySession } from "$server/api"
import { redirect } from "@sveltejs/kit"
import { SHOPIFY_CHECKOUT_URL } from '$env/static/private';
import { getProductStock } from "$server/cache"

export const load = async ({ url, cookies, params }) => {
  if (!Object.keys(products).includes(params.game))
    return redirect(303, "/store/blox-fruits")

  const game = products?.[params.game]
  
  // Check stock for account-delivery products
  if (game?.products) {
    await Promise.all(game.products.map(async (product) => {
      if (product.deliveryType === 'account') {
        product.inStock = (await getProductStock(product.variantId)) > 0
      }
    }))
  }

  const ref = cookies.get("ref") ?? '';

  return { game, ref }
}

export const actions = {
  buy: async({ request, params }) => {
    const data = await request.formData()

    const cart = JSON.parse(data.get("cart"))
    const refCode = data.get("refCode")?.toString() ?? "";

    const isValidRef = refCode.length === 10;
    const note = isValidRef ? `affiliate-${refCode}` : '';

    const queryString = `
      mutation {
        cartCreate(
          input: {
            lines: [
              ${cart.map(item => `{
                quantity: ${item.amount},
                merchandiseId: "gid://shopify/ProductVariant/${item.variantId}"
              }`).join(',\n')}
            ],
            note: "${note}",
            discountCodes: ["discount10"]
          }
        ) {
          cart {
            id
            discountCodes {
              code
              applicable
            }
            cost {
              subtotalAmount {
                amount
              }
              totalAmount {
                amount
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }
     `

    console.log(shopifySession)
    
    const client = new shopify.clients.Storefront({ session: shopifySession })
    const response = await client.request(queryString)

    console.log(JSON.stringify(response.data,null, 2))

    const link = response?.data?.cartCreate?.cart?.id?.match(/gid:\/\/shopify\/Cart\/(.+)/)?.[1] 

    // May want to update this link when in dev mode.
    return link ? redirect(301,`https://${SHOPIFY_CHECKOUT_URL}/checkouts/cn/${link}&note=refer-123456789`) : { error: true }
  }
}

//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

// buyClient.checkout.create().then((checkout) => {
//   // Do something with the checkout
//   console.log(checkout);
// });

// const checkout = new shopify.Storefront.Checkout({session: session});
// checkout.line_items = [
//   {
//     "variant_id": 39072856,
//     "quantity": 1
//   }
// ];
// const something = await checkout.save({
//   update: true,
// });

// console.log(checkout, something)

// const storefront_access_token = new shopify.rest.StorefrontAccessToken({session: session});
// storefront_access_token.title = "Test";
// const yes = await storefront_access_token.save({
//   update: true,
// });
// console.log(storefront_access_token, yes)