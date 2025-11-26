import { products } from '$server/api';

export const load = async ({ parent }) => {
  const data = await parent();
  
  // Fetch Bloxypoints products
  const bloxypointsGame = products['bloxypoints'];
  const bloxypointsProducts = bloxypointsGame?.products || [];

  return {
    bloxypointsProducts
  };
};
