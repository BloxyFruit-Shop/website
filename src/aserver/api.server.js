import '@shopify/shopify-api/adapters/node';
import { shopifyApi, Session } from '@shopify/shopify-api';
import bcrypt from 'bcrypt';
import { SendMailClient } from 'zeptomail';
import {
  ZEPTO_MAIL_TOKEN,
  SHOPIFY_ADMIN_API_KEY,
  SHOPIFY_ADMIN_API_SECRET,
  SHOPIFY_ADMIN_API_TOKEN,
  SHOPIFY_STOREFRONT_TOKEN,
  SHOPIFY_URL,
  CURRENCYAPI_API_KEY
} from '$env/static/private';
import { setIntervalImmediately, modifyProductTags } from '$server/utils';
import { restResources } from '@shopify/shopify-api/rest/admin/2024-07';
import games from '$lib/utils/games';
import { building } from '$app/environment';
import { orders, products as dbProducts, inventory } from '$server/mongo';
import { cacheProductById, updateProductStock } from '$server/cache';
import { globalSettings } from '$server/mongo';

/**
 * Initializes the Shopify API client with required credentials and configurations.
 */
export const shopify = shopifyApi({
  apiKey: SHOPIFY_ADMIN_API_KEY,
  apiSecretKey: SHOPIFY_ADMIN_API_SECRET,
  adminApiAccessToken: SHOPIFY_ADMIN_API_TOKEN,
  privateAppStorefrontAccessToken: SHOPIFY_STOREFRONT_TOKEN,
  scopes: ['read_products', 'write_checkouts', 'read_orders', 'write_orders'],
  hostName: SHOPIFY_URL,
  hostScheme: 'https',
  restResources
});

/**
 * Creates a Shopify session using the admin API token and store URL.
 */
export const shopifySession = new Session({
  accessToken: SHOPIFY_ADMIN_API_TOKEN,
  shop: SHOPIFY_URL
});

// Unused. Unclear if this was temp, or if it never got implemented
const currencyArray = [
  'USD',
  'EUR',
  'JPY',
  'GBP',
  'AUD',
  'CAD',
  'CHF',
  'CNY',
  'SEK',
  'NZD',
  'MXN',
  'SGD',
  'HKD',
  'NOK',
  'KRW',
  'TRY',
  'RUB',
  'INR',
  'BRL',
  'ZAR',
  'SAR',
  'AED',
  'THB',
  'MYR',
  'IDR',
  'PHP',
  'ILS',
  'PLN',
  'ARS',
  'CLP',
  'COP',
  'EGP',
  'PKR',
  'VND',
  'BDT',
  'PEN',
  'NGN',
  'GHS',
  'KES',
  'HUF',
  'RON'
];

export let currencyRates = {};

/**
 * Creates an instance of the ZeptoMail client used for sending emails.
 */
const emailClient = new SendMailClient({
  url: 'api.zeptomail.eu/',
  token: ZEPTO_MAIL_TOKEN
});

/**
 * Sends an email using the ZeptoMail client.
 *
 * @param {string} email - Recipient's email address.
 * @param {string} content - HTML content of the email.
 * @param {string} title - Subject/title of the email.
 *
 * The function constructs an email object with the provided parameters and dispatches it.
 */
export const sendEmail = (email, content, title) => {
  emailClient.sendMail({
    from: {
      address: 'noreply@bloxyfruit.com',
      name: 'noreply'
    },
    to: [
      {
        email_address: {
          address: email
        }
      }
    ],
    subject: title,
    htmlbody: content
  });
};

const cookieOptions = {
  sameSite: 'lax',
  path: '/',
  httpOnly: true,
  maxAge: 60 * 60 * 24 * 7 * 6, // 6 months
  secrets: [
    'Lekd^fPql4VTew#IzI37!6w3mKt#kgQD*DQ0QVZB7y0irh2JzeUV$4zqejHSZw!@OihFGzM6Ns1LpuJ1kxu#fg5uwWnjCuAnDmL'
  ],
  secure: process.env.NODE_ENV === 'production'
};

export const products = games;

/**
 * Sets a session cookie in the user's browser.
 *
 * @param {object} cookies - Cookie manager that provides the set() method.
 * @param {string} session - The session data to be stored.
 *
 * This function uses the predefined cookie options to securely store the session.
 */
export const setSessionCookie = (cookies, session) =>
  cookies.set('session', session, cookieOptions);

/**
 * Deletes the session cookie from the user's browser.
 *
 * @param {object} cookies - Cookie manager that provides the delete() method.
 *
 * It removes the session cookie using the predefined cookie options.
 */
export const deleteSessionCookie = (cookies) =>
  cookies.delete('session', cookieOptions);

/**
 * Compares a plaintext value with a hashed value using bcrypt.
 *
 * @param {...any} args - Arguments for bcrypt.compare function.
 * @returns {Promise<boolean>} - Resolves to true if the values match, otherwise false.
 */
export const bcryptCompare = (...args) => {
  return bcrypt.compare(...args);
};

/**
 * Generates a bcrypt hash for a given plaintext value.
 *
 * @param {...any} args - Arguments for bcrypt.hash function.
 * @returns {Promise<string>} - Resolves to the generated hash string.
 */
export const bcryptHash = (...args) => {
  return bcrypt.hash(...args);
};

let globalConfig = null;

/**
 * Loads or initializes global configuration settings from the database.
 *
 * This async function attempts to find a document with _id 'settings' in the globalSettings collection.
 * If not found, it creates a new document with an initial updatedAt timestamp.
 * In both cases, the global configuration is stored in the local variable and a log is written.
 *
 * @returns {Promise<void>}
 */
const loadGlobalSettings = async () => {
  try {
    globalConfig = await globalSettings.findOneAndUpdate(
      { _id: 'settings' },
      { $setOnInsert: { updatedAt: new Date() } },
      { upsert: true, new: true }
    );
    console.log('Global settings loaded');
  } catch (err) {
    console.error('Error loading global settings:', err);
  }
};

const inventoryItems = {
  'Angel V4 CDK GOD': [
    // Angel V4 CDK GOD
  ],
  'Cyborg V4 CDK GOD': [
    // Cyborg V4 CDK GOD
  ],
  'Human V4 CDK GOD': [
    // Human V4 CDK GOD
  ],
  'Mink V4 CDK GOD': [
    // Mink V4 CDK GOD
  ],
  'Shark V4 CDK GOD': [
    // SHARK V4 CDK GOD
  ],
  'Ghoul V4 CDK GOD': [
    // Ghoul V4 CDK GOD
  ],
  'OP Leopard': [
    // OP Leopard
  ],
  'Sanguine Art': [
    // Sanguine Art
  ],
  'OP Kitsune': [
    // OP Kitsune
  ],
  Cheap: [
    // Cheap accounts
  ]
};

/**
 * Adds inventory items from the predefined inventoryItems object to the database.
 *
 * Iterates over each product title and its associated accounts in inventoryItems.
 * For each product:
 *   - Searches for the product in the database.
 *   - Logs the product if it exists.
 *   - Prepares bulk write operations for each account (splitting account details).
 *   - Performs the bulk insertion into the inventory collection if there are items.
 * Logs success or error messages accordingly.
 *
 * @returns {Promise<void>}
 */
async function addInventoryItemsToDatabase() {
  console.log('Adding inventory items to database...');
  try {
    for (const [title, accounts] of Object.entries(inventoryItems)) {
      const product = await dbProducts.findOne({ title });
      if (!product) continue;

      console.log(product);
      console.log(
        `Adding ${accounts.length} accounts for product ${product.title}`
      );

      const bulkOps = accounts.map((account) => ({
        insertOne: {
          document: {
            productId: product.productId,
            type: 'account',
            data: {
              username: account.split(':')[0],
              password: account.split(':')[1]
            },
            status: 'available',
            claimedBy: null,
            claimedAt: null
          }
        }
      }));

      // Execute bulk operation if there are any items to add
      if (bulkOps.length > 0) {
        const result = await inventory.bulkWrite(bulkOps);
        // Optionally log result.insertedCount if needed:
        // console.log(`Added ${result.insertedCount} accounts for product ${product.title}`)
      }
    }
    console.log('Finished adding inventory items');
  } catch (err) {
    console.error('Error adding inventory items:', err);
  }
}

/**
 * Fetches orders from Shopify using the GraphQL API, processes them, and stores them in the local database.
 *
 * The function performs the following steps:
 *   1. Constructs a GraphQL query to fetch up to 250 orders starting from a given cursor.
 *   2. Iterates over the fetched orders, skipping any with high risk.
 *   3. Checks whether each order already exists in the local database.
 *   4. Processes order items by looking up product details and constructing order entries.
 *   5. Saves new orders in the database.
 *   6. For items with a deliveryType of 'account', reserves available inventory items and updates the order.
 *   7. Updates the global configuration with the latest cursor and persists it to the database.
 *
 * @returns {Promise<void>}
 */
const fetchOrders = async () => {
  console.log('Fetching orders...');
  try {
    let lastCursor = globalConfig?.lastOrdersCursor || null;
    let hasNextPage;

    while (true) {
      const queryString = `
        query GetAllOrders($after: String) {
          orders(first: 250, after: $after) {
            edges {
              node {
                id
                name
                email
                createdAt
                riskLevel
                totalPriceSet {
                  shopMoney {
                    amount
                    currencyCode
                  }
                }
                lineItems(first: 250) {
                  edges {
                    node {
                      title
                      quantity
                      originalUnitPriceSet {
                        shopMoney {
                          amount
                          currencyCode
                        }
                      }
                      variant {
                        id
                        image {
                          src
                        }
                        product {
                          tags
                        }
                      }
                    }
                  }
                }
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      `;

      const client = new shopify.clients.Graphql({ session: shopifySession });
      const response = await client.request(queryString, {
        variables: { after: lastCursor }
      });

      const orderEdges = response?.data?.orders?.edges || [];

      for (const order of orderEdges) {
        const orderData = order.node;
        if (!orderData) continue;
        if (orderData.riskLevel === 'HIGH') continue;

        const orderId = orderData.id.replace('gid://shopify/Order/', '');

        const existingOrder = await orders.findOne({ id: orderId });
        console.log(`Order ${orderId} found`);
        if (existingOrder) continue;

        const orderItems = await Promise.all(
          orderData.lineItems.edges.map(async (edge) => {
            const item = edge.node;
            const variantId = item.variant.id.replace(
              'gid://shopify/ProductVariant/',
              ''
            );

            const product = await dbProducts.findOne({ productId: variantId });

            if (!product) {
              console.error(`Product not found for variant ID: ${variantId}`);
              return null;
            }

            // Construct the order item using product and item details
            return {
              category: product.category,
              game: product.game,
              productId: variantId,
              title: item.title,
              image: item.variant.image?.src || product.image,
              price: Number(item.originalUnitPriceSet.shopMoney.amount),
              quantity: item.quantity,
              deliveryType: product.deliveryType || 'manual'
            };
          })
        );

        const validOrderItems = orderItems.filter((item) => item !== null);

        const newOrder = await orders.create({
          id: orderId,
          email: orderData.email,
          totalAmount: Number(orderData.totalPriceSet.shopMoney.amount),
          items: validOrderItems,
          status: validOrderItems.find((item) => item.deliveryType === 'manual')
            ? 'pending'
            : 'completed',
          game: validOrderItems[0].game,
          createdAt: new Date(orderData.createdAt),
          updatedAt: new Date(orderData.createdAt)
        });

        // For account delivery types, attempt to reserve inventory items
        for (const item of validOrderItems) {
          if (item.deliveryType !== 'account') continue;

          try {
            const inventoryItems = [];
            // Reserve inventory items based on the quantity ordered
            for (let i = 0; i < item.quantity; i++) {
              const availableItem = await inventory.findOneAndUpdate(
                {
                  productId: item.productId,
                  status: 'available'
                },
                {
                  $set: {
                    status: 'claimed',
                    claimedBy: orderData.email
                  }
                },
                { new: true }
              );

              if (!availableItem) break;
              inventoryItems.push(availableItem._id);
            }

            await updateProductStock(item.productId);

            console.log(
              `Reserved ${inventoryItems.length} inventory items for order ${orderId}, product ${item.productId}`
            );

            if (inventoryItems.length > 0) {
              await orders.updateOne(
                {
                  id: orderId,
                  'items.productId': item.productId
                },
                {
                  $set: {
                    'items.$.inventoryIds': inventoryItems,
                    'items.$.status': 'ready'
                  }
                }
              );
            }
          } catch (err) {
            console.error(
              `Error reserving inventory for order ${orderId}, product ${item.productId}:`,
              err
            );
          }
        }

        console.log(`Added new order: ${orderData.name}`);
      }

      console.log(`${orderEdges.length} orders fetched`);

      if (orderEdges.length === 0) break;

      lastCursor = response?.data?.orders?.pageInfo?.endCursor;
      hasNextPage = response?.data?.orders?.pageInfo?.hasNextPage;

      globalConfig.lastOrdersCursor = lastCursor;
      await globalSettings.updateOne(
        { _id: 'settings' },
        {
          $set: {
            lastOrdersCursor: lastCursor,
            updatedAt: new Date()
          }
        }
      );

      if (!hasNextPage) break;
    }
  } catch (err) {
    console.error('Error fetching orders:', err);
  }
};

/**
 * Fetches product items from Shopify for each game collection and updates the local database.
 *
 * This function performs the following actions for each game in the products object:
 *   1. Initializes pagination (cursor) and an empty array for total products.
 *   2. Constructs and executes a GraphQL query to fetch a batch (up to 250) of products.
 *   3. Calculates a price conversion rate using the fetched currency rates.
 *   4. Processes each product by modifying its tags, formatting its price, and extracting key details.
 *   5. Updates or inserts the product into the database and caches the product data.
 *   6. Continues paginating until all products for that game are fetched.
 *
 * @returns {Promise<void>}
 */
export const fetchItems = async () => {
  console.log('Fetching items...');

  for (const game of Object.keys(products)) {
    let lastCursor;
    const totalProducts = [];

    try {
      let gameIteration = 0;
      while (true) {
        const queryString = `
          query {
            collectionByHandle(handle: "${game.toLowerCase()}") {
              id
              products(first: 250, sortKey: BEST_SELLING${
                lastCursor ? `, after: "${lastCursor}"` : ''
              }) {
                edges {
                  node {
                    id
                    title
                    tags
                    descriptionHtml
                    variants(first: 1) {
                      edges {
                        node {
                          sku
                          id
                        }
                      }
                    }
                    priceRangeV2 {
                      minVariantPrice {
                        amount
                        currencyCode
                      }
                    }
                    compareAtPriceRange {
                      minVariantCompareAtPrice {
                        amount
                        currencyCode
                      }
                    }
                    image: images(first: 1) {
                      edges {
                        node {
                          id
                          src
                        }
                      }
                    }
                  }
                }
                pageInfo {
                  hasNextPage
                  endCursor
                }
              }
            }
          }
        `;

        const client = new shopify.clients.Graphql({ session: shopifySession });
        const response = await client.request(queryString);
        const productsEdges =
          response?.data?.collectionByHandle?.products?.edges;

        const rate =
          1 /
          currencyRates[
            productsEdges?.[0]?.node?.priceRangeV2?.minVariantPrice
              ?.currencyCode ?? 'EUR'
          ];

        for (const edge of productsEdges) {
          const product = edge.node;
          const variantId = product.variants.edges[0].node.id.replace(
            'gid://shopify/ProductVariant/',
            ''
          );

          const newProduct = modifyProductTags({
            variantId,
            game,
            title: product.title,
            image: product.image.edges[0].node.src || null,
            price: Number(
              (product.priceRangeV2.minVariantPrice.amount * rate).toFixed(4)
            ),
            comparePrice: product.compareAtPriceRange
              ? Number(
                  (
                    product.compareAtPriceRange.minVariantCompareAtPrice
                      .amount * rate
                  ).toFixed(4)
                )
              : null,
            popularity: gameIteration * 250 + productsEdges.indexOf(edge),
            description: product.descriptionHtml,
            tags: product.tags,
            updatedAt: new Date()
          });

          newProduct.deliveryType = newProduct.deliveryType || 'manual';
          newProduct.inStock = newProduct.inStock == 'false' ? false : true;

          try {
            await dbProducts.findOneAndUpdate(
              { productId: variantId },
              {
                $set: newProduct,
                $setOnInsert: {
                  createdAt: new Date(),
                  accounts: [],
                  manualNotes: ''
                }
              },
              {
                upsert: true,
                new: true
              }
            );

            cacheProductById(variantId, newProduct);

            totalProducts.push(newProduct);
          } catch (err) {
            console.error(`Error updating product ${variantId}:`, err);
          }
        }

        if (
          !response?.data?.collectionByHandle?.products?.pageInfo
            ?.hasNextPage ||
          productsEdges.length === 0
        )
          break;
        lastCursor =
          response?.data?.collectionByHandle?.products?.pageInfo?.endCursor;

        gameIteration += 1;
      }

      products[game].products = totalProducts;
    } catch (err) {
      console.error(`Error fetching products for ${game}:`, err);
    }
  }

  console.log('Finished fetching items');
};

/**
 * Main initialization function executed immediately.
 *
 * This self-invoking async function performs the following:
 *   1. Checks if the environment is in build mode and exits if true.
 *   2. Calls addInventoryItemsToDatabase() to seed inventory items.
 *   3. Loads global configuration settings via loadGlobalSettings().
 *   4. Optionally cleans up game-related configuration (commented out).
 *   5. Sets up periodic tasks for fetching items and orders using a helper that triggers the functions immediately and then at set intervals.
 *
 * @returns {Promise<void>}
 */
(async function () {
  if (building) return;

  await addInventoryItemsToDatabase();
  // Load global settings first
  await loadGlobalSettings();

  // Delete rarities games (optional cleanup, currently commented out)
  for (const game in games) {
    // delete games[game].rarities
    // delete games[game].order
  }

  let fetchItemsInterval;

  // Set up a periodic fetch for product items every 30 seconds using setIntervalImmediately
  // Optionally, currency conversion rates could be updated via an API call here (commented out)
  currencyRates = {
    AED: 3.9802858985,
    ARS: 1073.1976558456,
    AUD: 1.6523468214,
    BDT: 130.0608834583,
    BRL: 6.3596444966,
    CAD: 1.512126495,
    CHF: 0.9430345116,
    CLP: 1043.9097054498,
    CNY: 7.7180752657,
    COP: 4807.5054357281,
    EGP: 53.0355527776,
    EUR: 1,
    GBP: 0.8384731658,
    GHS: 17.6172829779,
    HKD: 8.4281027636,
    HUF: 408.3037648786,
    IDR: 17018.777838015,
    ILS: 4.0705706607,
    INR: 91.0919259103,
    JPY: 165.8511852346,
    KES: 140.1118032533,
    KRW: 1492.4938697397,
    MXN: 21.9885844663,
    MYR: 4.7451013996,
    NGN: 1789.4899916835,
    NOK: 11.9923747446,
    NZD: 1.8172423508,
    PEN: 4.0839373601,
    PHP: 63.3609583246,
    PKR: 300.9227978367,
    PLN: 4.3629587753,
    RON: 4.9734290963,
    RUB: 106.4947072495,
    SAR: 4.0607241765,
    SEK: 11.6452415133,
    SGD: 1.4360640605,
    THB: 36.7995760142,
    TRY: 37.1832685677,
    USD: 1.0832004953,
    VND: 27393.0624194142,
    ZAR: 19.0987875061
  };

  if (!fetchItemsInterval)
    fetchItemsInterval = setIntervalImmediately(fetchItems, 30 * 1000);
  //   })
  // }, 8 * 60 * 60 * 1000)

  // Set up a periodic fetch for orders every 10 seconds using setIntervalImmediately
  setIntervalImmediately(fetchOrders, 10 * 1000);
})();
