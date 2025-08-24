import { products } from '$server/api';
import { redirect } from '@sveltejs/kit';

function getTop6PopularItems(productsObj) {
  const result = {};

  for (const game in productsObj) {
    const raw = productsObj[game]?.products || [];
    const list = raw.filter(Boolean);
    const invalid =
      raw.length - list.length + list.filter((p) => !p?.title).length;
    if (invalid > 0)
      console.warn(
        `[landing] ${game}: ${invalid} invalid product entries found in getTop6PopularItems`
      );

    const topItems = list
      .filter((p) => typeof p === 'object' && p?.title)
      .sort((a, b) => (b?.popularity ?? 0) - (a?.popularity ?? 0))
      .slice(0, 6);

    result[game] = { products: topItems };
  }

  return result;
}

export const load = async ({ url, locals }) => {
  const localUser = locals.localUser;

  const claimOrder = url.searchParams.get('claimOrder');

  if (claimOrder && localUser) {
    return redirect(303, `/account`);
  }

  // Diagnose the current in-memory products state for the landing page
  const bfRaw = products?.['blox-fruits']?.products ?? [];
  const bfValid = bfRaw.filter(Boolean);
  const bfInvalid =
    bfRaw.length - bfValid.length + bfValid.filter((p) => !p?.title).length;
  console.log(
    `[landing] BF products length=${bfRaw.length} invalid=${bfInvalid}`
  );
  if (bfInvalid > 0) {
    const samples = bfRaw.filter((p) => !p || !p.title).slice(0, 3);
    console.log('[landing] BF invalid samples:', samples);
  }

  // Pick robust featured items: prefer a stable category, fall back to top popularity
  let featured = bfValid
    .filter((p) => p?.category === 'Permanent Fruit' && p?.title)
    .sort((a, b) => (b?.popularity ?? 0) - (a?.popularity ?? 0))
    .slice(0, 2);

  if (featured.length < 2) {
    featured = bfValid
      .filter((p) => p?.title)
      .sort((a, b) => (b?.popularity ?? 0) - (a?.popularity ?? 0))
      .slice(0, 2);
  }

  console.log(
    '[landing] featured titles:',
    featured.map((p) => p.title)
  );

  const productsCount = Object.fromEntries(
    Object.keys(products).map((game) => {
      const arrRaw = products?.[game]?.products || [];
      const arr = arrRaw.filter(Boolean).filter((p) => !!p?.title);
      const invalid = arrRaw.length - arr.length;
      if (invalid > 0)
        console.warn(
          `[landing] ${game}: productsCount ignoring ${invalid} invalid entries (raw=${arrRaw.length}, valid=${arr.length})`
        );
      return [game, arr.length];
    })
  );

  const games = getTop6PopularItems(products);

  return { products: featured, productsCount, games };
};
