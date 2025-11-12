import { globalSettings, users } from '$server/mongo'; // Added users import
import { roleEnums } from '$server/schemes';
import { fail, redirect } from '@sveltejs/kit'; // Added fail import
import { ObjectId } from 'mongodb';

export const load = async ({ locals, url }) => {
  let settings = await globalSettings.findOne({ _id: 'settings' }).lean();

  if (!settings) {
    console.log(
      'Settings document not found in the database. Providing default values.'
    );
    settings = {
      _id: 'settings',
      euroToRobuxRate: 10,
      usdToRobuxRate: 0.00829,
      maxRobuxPerPurchase: 10000,
      minRobuxPerPurchase: 300,
      purchaseLimitHours: 6
    };
  }

  // Ensure _id is a string for SvelteKit data passing if it came from DB
  if (settings._id && typeof settings._id !== 'string') {
    settings._id = settings._id.toString();
  }

  return {
    settings: settings
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
        `Unauthorized settings update attempt by user: ${
          user?.username || 'Unknown'
        }`
      );
      // Use fail for action unauthorized access
      return fail(403, {
        success: false,
        message: 'You do not have permission to perform this action.'
      });
    }

    const formData = await request.formData();
    const euroToRobuxRateStr = formData.get('euroToRobuxRate')?.toString();
    const usdToRobuxRateStr = formData.get('usdToRobuxRate')?.toString();
    const maxRobuxStr = formData.get('maxRobuxPerPurchase')?.toString();
    const minRobuxStr = formData.get('minRobuxPerPurchase')?.toString();
    const purchaseLimitHoursStr = formData
      .get('purchaseLimitHours')
      ?.toString();
    const squareWebhookPaymentsKey = formData
      .get('squareWebhookSignaturesPayments')
      ?.toString();
    const squareWebhookDisputesKey = formData
      .get('squareWebhookSignaturesDisputes')
      ?.toString();
    const discordWebhookUrl = formData
      .get('discordDisputeWebhookUrl')
      ?.toString();

    let euroToRobuxRate, usdToRobuxRate, maxRobux, minRobux, purchaseLimitHours;
    const errors = {};

    // Validate Euro to Robux Rate
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

    // Validate USD to Robux Rate
    if (!usdToRobuxRateStr) {
      errors.usdToRobuxRate = 'USD to Robux rate is required.';
    } else {
      try {
        usdToRobuxRate = parseFloat(usdToRobuxRateStr);
        if (isNaN(usdToRobuxRate) || usdToRobuxRate <= 0) {
          throw new Error('Invalid rate');
        }
      } catch (error) {
        errors.usdToRobuxRate = 'Rate must be a positive number.';
      }
    }

    // Validate Max Robux
    if (!maxRobuxStr) {
      errors.maxRobuxPerPurchase = 'Maximum Robux per purchase is required.';
    } else {
      try {
        maxRobux = parseInt(maxRobuxStr, 10);
        if (isNaN(maxRobux) || maxRobux <= 0) {
          throw new Error('Invalid amount');
        }
      } catch (error) {
        errors.maxRobuxPerPurchase = 'Must be a positive whole number.';
      }
    }

    // Validate Min Robux
    if (!minRobuxStr) {
      errors.minRobuxPerPurchase = 'Minimum Robux per purchase is required.';
    } else {
      try {
        minRobux = parseInt(minRobuxStr, 10);
        if (isNaN(minRobux) || minRobux <= 0) {
          throw new Error('Invalid amount');
        }
      } catch (error) {
        errors.minRobuxPerPurchase = 'Must be a positive whole number.';
      }
    }

    // Validate Purchase Limit Hours
    if (!purchaseLimitHoursStr) {
      errors.purchaseLimitHours = 'Purchase limit hours is required.';
    } else {
      try {
        purchaseLimitHours = parseInt(purchaseLimitHoursStr, 10);
        if (isNaN(purchaseLimitHours) || purchaseLimitHours < 0) {
          throw new Error('Invalid hours');
        }
      } catch (error) {
        errors.purchaseLimitHours = 'Must be a positive whole number.';
      }
    }

    // Check min < max
    if (minRobux && maxRobux && minRobux >= maxRobux) {
      errors.minRobuxPerPurchase = 'Minimum must be less than maximum.';
    }

    if (Object.keys(errors).length > 0) {
      return fail(400, {
        success: false,
        message: 'Please correct the errors below.',
        errors,
        formData: {
          euroToRobuxRate: euroToRobuxRateStr,
          usdToRobuxRate: usdToRobuxRateStr,
          maxRobuxPerPurchase: maxRobuxStr,
          minRobuxPerPurchase: minRobuxStr,
          purchaseLimitHours: purchaseLimitHoursStr
        }
      });
    }

    try {
      const updateData = {
        euroToRobuxRate: euroToRobuxRate,
        usdToRobuxRate: usdToRobuxRate,
        maxRobuxPerPurchase: maxRobux,
        minRobuxPerPurchase: minRobux,
        purchaseLimitHours: purchaseLimitHours
      };

      // Only update webhook keys if provided
      if (squareWebhookPaymentsKey || squareWebhookDisputesKey) {
        updateData.squareWebhookSignatures = {};
        if (squareWebhookPaymentsKey) {
          updateData.squareWebhookSignatures.payments =
            squareWebhookPaymentsKey;
        }
        if (squareWebhookDisputesKey) {
          updateData.squareWebhookSignatures.disputes =
            squareWebhookDisputesKey;
        }
      }
      if (discordWebhookUrl) {
        updateData.discordDisputeWebhookUrl = discordWebhookUrl;
      }

      const result = await globalSettings.updateOne(
        { _id: 'settings' },
        { $set: updateData },
        { upsert: true }
      );

      if (
        result.upsertedCount > 0 ||
        result.modifiedCount > 0 ||
        result.matchedCount > 0
      ) {
        return { success: true };
      } else {
        console.error('Failed to update or upsert settings, result:', result);
        return fail(500, {
          success: false,
          message:
            'Failed to save settings due to an unexpected database issue.'
        });
      }
    } catch (error) {
      console.error('Error updating global settings:', error);
      return fail(500, {
        success: false,
        message: 'Failed to save settings due to a server error.',
        formData: {
          euroToRobuxRate: euroToRobuxRateStr,
          usdToRobuxRate: usdToRobuxRateStr,
          maxRobuxPerPurchase: maxRobuxStr,
          minRobuxPerPurchase: minRobuxStr,
          purchaseLimitHours: purchaseLimitHoursStr
        }
      });
    }
  }
};
