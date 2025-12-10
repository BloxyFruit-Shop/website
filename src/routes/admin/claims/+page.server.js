import { robuxClaims, users } from '$server/mongo';
import { roleEnums } from '$server/schemes';
import { redirect } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';

const CLAIMS_PER_PAGE = 20;

export const load = async ({ locals, url }) => {
  let page = parseInt(url.searchParams.get('page') || '1', 10);
  if (isNaN(page) || page < 1) {
    page = 1;
  }

  const searchTerm = url.searchParams.get('search') || '';
  const sortParam = url.searchParams.get('sort') || 'newest';
  const limit = CLAIMS_PER_PAGE;

  const filter = {
    source: { $ne: 'robux_purchase' },
    hidden: { $ne: true }
  };
  
  if (searchTerm) {
    const escapedSearchTerm = searchTerm.replace(
      /[-\/\\^$*+?.()|[\]{}]/g,
      '\\$&'
    );
    filter['user.username'] = { $regex: escapedSearchTerm, $options: 'i' };
  }

  // Determine sort criteria based on sortParam
  let sortCriteria = {};
  switch (sortParam) {
    case 'oldest':
      sortCriteria = { createdAt: 1 };
      break;
    case 'amount_desc':
      sortCriteria = { robuxAmount: -1 };
      break;
    case 'amount_asc':
      sortCriteria = { robuxAmount: 1 };
      break;
    case 'newest':
    default:
      sortCriteria = { createdAt: -1 };
      break;
  }

  const totalClaims = await robuxClaims.countDocuments(filter);
  const totalPages = Math.ceil(totalClaims / limit) || 1;

  if (page > totalPages && totalPages > 0) {
    page = totalPages;
  }

  const skip = (page - 1) * limit;

  const claimsList = await robuxClaims
    .find(filter)
    .sort(sortCriteria)
    .skip(skip)
    .limit(limit)
    .lean();

  // Calculate Grand Total of Uncompleted Claims
  const grandTotalResult = await robuxClaims.aggregate([
    {
      $match: {
        source: { $ne: 'robux_purchase' },
        resolved: false
      }
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$gamepass.price' }
      }
    }
  ]);
  
  const grandTotal = grandTotalResult[0]?.totalAmount || 0;

  const serializedClaims = claimsList.map((claim) => ({
    ...claim,
    _id: claim._id.toString(),
    createdAt: new Date(claim.createdAt)
  }));

  return {
    claims: serializedClaims,
    pagination: {
      currentPage: page,
      totalPages: totalPages,
      limit: limit,
      totalClaims: totalClaims
    },
    searchTerm: searchTerm,
    sort: sortParam,
    grandTotal: grandTotal
  };
};

export const actions = {
  fulfillClaim: async ({ request, locals }) => {
    const session = locals.session;
    if (!session) {
      // Not logged in, redirect to home
      throw redirect(302, '/');
    }

    const user = await users.findOne({ 'session.id': session }).lean();
    if (!user || !user.role || user.role < roleEnums.Admin) {
      console.warn(
        `Unauthorized admin access attempt by user: ${user.username}`
      );
      throw redirect(303, '/');
    }

    try {
      const formData = await request.formData();
      const claimId = formData.get('claimId');

      if (!claimId) {
        return { success: false, message: 'Claim ID is missing.' };
      }

      // Attempt to update the claim document if it's not already resolved
      const result = await robuxClaims.updateOne(
        { _id: new ObjectId(claimId), resolved: false },
        { $set: { resolved: true, resolvedAt: new Date() } }
      );

      if (result.modifiedCount === 1) {
        return { success: true, claimId };
      } else {
        return {
          success: false,
          message: 'Claim not found or already fulfilled.'
        };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
  fulfillAllClaims: async ({ locals }) => {
    const session = locals.session;
    if (!session) {
      // Not logged in, redirect to home
      throw redirect(302, '/');
    }

    const user = await users.findOne({ 'session.id': session }).lean();
    if (!user || !user.role || user.role < roleEnums.Admin) {
      console.warn(
        `Unauthorized admin action attempt by user: ${
          user?.username || 'Unknown'
        }`
      );
      throw redirect(303, '/');
    }

    try {
      // Update all claims that are not yet resolved
      const result = await robuxClaims.updateMany(
        { resolved: false },
        { $set: { resolved: true, resolvedAt: new Date() } }
      );

      return { success: true, updatedCount: result.modifiedCount };
    } catch (error) {
      console.error('Error fulfilling all claims:', error);
      return fail(500, {
        success: false,
        message: 'Failed to fulfill all claims due to a server error.'
      });
    }
  },
  clearFulfilledClaims: async ({ request, locals }) => {
    const session = locals.session;
    if (!session) {
      // Not logged in, redirect to home
      throw redirect(302, '/');
    }

    const user = await users.findOne({ 'session.id': session }).lean();
    if (!user || !user.role || user.role < roleEnums.Admin) {
      console.warn(
        `Unauthorized admin access attempt by user: ${user.username}`
      );
      throw redirect(303, '/');
    }

    try {
      // Hide all claims that are already fulfilled instead of deleting them
      const result = await robuxClaims.updateMany(
        { resolved: true, hidden: { $ne: true } },
        { $set: { hidden: true } }
      );
      return { success: true, hiddenCount: result.modifiedCount };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
  autoFulfill: async ({ request, locals, fetch }) => {
    const session = locals.session;
    if (!session) {
      throw redirect(302, '/');
    }

    const user = await users.findOne({ 'session.id': session }).lean();
    if (!user || !user.role || user.role < roleEnums.Admin) {
      console.warn(
        `Unauthorized admin action attempt by user: ${user?.username || 'Unknown'}`
      );
      throw redirect(303, '/');
    }

    const formData = await request.formData();
    const claimId = formData.get('claimId');

    if (!claimId) {
      return { success: false, message: 'Claim ID is missing.' };
    }

    try {
      const claim = await robuxClaims.findOne({ _id: new ObjectId(claimId) }).lean();
      if (!claim) {
        return { success: false, message: 'Claim not found.' };
      }
      if (claim.resolved) {
        return { success: false, message: 'Claim already resolved.' };
      }

      // Prepare data for API
      // Assuming game.id is the placeId.
      const placeId = parseInt(claim.game.id);
      if (isNaN(placeId)) {
         return { success: false, message: 'Invalid Place ID in claim data.' };
      }

      const apiResponse = await fetch('/api/integrations/rbxcrate/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: claim._id.toString(),
          robloxUsername: claim.user.username,
          robuxAmount: claim.gamepass.price,
          placeId: placeId
        })
      });

      const result = await apiResponse.json();

      if (result.success) {
        await robuxClaims.updateOne(
          { _id: new ObjectId(claimId) },
          { 
            $set: { 
              resolved: true, 
              resolvedAt: new Date(),
              autoFulfilled: true,
              externalOrderId: result.data?.orderId
            } 
          }
        );
        return { success: true, message: 'Auto-fulfillment initiated successfully.' };
      } else {
        return { success: false, message: result.message || 'Auto-fulfillment failed.' };
      }
    } catch (error) {
      console.error('Auto-fulfill error:', error);
      return { success: false, message: 'Internal server error during auto-fulfillment.' };
    }
  }
};
