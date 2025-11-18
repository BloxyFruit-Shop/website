import { globalSettings } from '$server/mongo';
import { redirect } from '@sveltejs/kit';

export const load = async () => {
  return redirect(303, '/');
  try {
    const settings = await globalSettings.findOne({ _id: 'settings' }).lean();

    if (settings) {
      return {
        usdToRobuxRate: settings.usdToRobuxRate || 0.00829,
        purchaseLimitHours: settings.purchaseLimitHours || 6,
        squareAppId: import.meta.env.VITE_SQUARE_APP_ID,
        squareLocationId: import.meta.env.VITE_SQUARE_LOCATION_ID
      };
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }

  return {
    usdToRobuxRate: 0.00829,
    purchaseLimitHours: 6,
    squareAppId: import.meta.env.VITE_SQUARE_APP_ID,
    squareLocationId: import.meta.env.VITE_SQUARE_LOCATION_ID
  };
};
