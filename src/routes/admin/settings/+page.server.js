import { globalSettings, users } from '$server/mongo'; // Added users import
import { roleEnums } from '$server/schemes';
import { fail, redirect } from '@sveltejs/kit'; // Added fail import
import { ObjectId } from 'mongodb';

export const load = async ({ locals, url }) => {
  let settings = await globalSettings.findOne({ _id: "settings" }).lean();

  if (!settings) {
    console.log("Settings document not found in the database. Providing default values.");
    settings = {
      _id: "settings",
      euroToRobuxRate: 10,
    };
  }

  // Ensure _id is a string for SvelteKit data passing if it came from DB
  if (settings._id && typeof settings._id !== 'string') {
      settings._id = settings._id.toString();
  }

  return {
    settings: settings,
  };
};

export const actions = {
  updateSettings: async ({ request, locals }) => {
    // Auth check
    const session = locals.session;
    if (!session) {
      throw redirect(302, '/');
    }
    const user = await users.findOne({ 'session.id': session }).lean();
    if (!user || !user.role || user.role < roleEnums.Admin) {
      console.warn(
        `Unauthorized settings update attempt by user: ${user?.username || 'Unknown'}`
      );
      // Use fail for action unauthorized access
      return fail(403, { success: false, message: 'You do not have permission to perform this action.' });
    }

    const formData = await request.formData();
    const euroToRobuxRateStr = formData.get('euroToRobuxRate')?.toString();

    let euroToRobuxRate;
    const errors = {};

    if (!euroToRobuxRateStr) {
      errors.euroToRobuxRate = 'Euro to Robux rate is required.';
    } else {
      try {
        euroToRobuxRate = parseInt(euroToRobuxRateStr, 10);
        if (isNaN(euroToRobuxRate) || euroToRobuxRate <= 0) {
          throw new Error('Invalid rate');
        }
      } catch (error) {
        errors.euroToRobuxRate = 'Rate must be a positive whole number.';
      }
    }

    if (Object.keys(errors).length > 0) {
      return fail(400, {
        success: false,
        message: 'Please correct the errors below.',
        errors,
        formData: { euroToRobuxRate: euroToRobuxRateStr }
      });
    }

    try {
      const result = await globalSettings.updateOne(
        { _id: "settings" },
        { $set: { euroToRobuxRate: euroToRobuxRate } },
        { upsert: true }
      );

      if (result.upsertedCount > 0 || result.modifiedCount > 0 || result.matchedCount > 0) {
         // If matchedCount > 0 but modifiedCount = 0, it means the value was already the same. Still success.
        return { success: true };
      } else {
         console.error("Failed to update or upsert settings, result:", result);
         return fail(500, { success: false, message: 'Failed to save settings due to an unexpected database issue.' });
      }

    } catch (error) {
      console.error('Error updating global settings:', error);
      return fail(500, {
        success: false,
        message: 'Failed to save settings due to a server error.',
        formData: { euroToRobuxRate: euroToRobuxRateStr } // Return data on server error too
      });
    }
  }
};
