import { products, fetchItems } from '$server/api';
import { redirect } from '@sveltejs/kit';

function getTop6PopularItems(products) {
  const result = {};

  for (const game in products) {
    const topItems = products[game].products
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 6);

    result[game] = { products: topItems };
  }

  return result;
}

export const load = async ({ url, params, locals }) => {
  const localUser = locals.localUser;

  const claimOrder = url.searchParams.get('claimOrder');

  if (claimOrder && localUser) {
    return redirect(303, `/account`);
  }

  await fetchItems();
  return {
    products: products['blox-fruits'].products.filter((item) =>
      ['Portal', 'Rumble'].includes(item.title)
    ),
    productsCount: Object.fromEntries(
      Object.keys(products).map((game) => [
        game,
        products[game].products.length
      ])
    ),
    games: getTop6PopularItems(products)
  };
};
