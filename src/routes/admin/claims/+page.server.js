import { robuxClaims, users } from '$server/mongo';
import { roleEnums } from '$server/schemes';
import { redirect } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';

const CLAIMS_PER_PAGE = 12;

export const load = async ({ locals, url }) => {
  let page = parseInt(url.searchParams.get('page') || '1', 10);
  if (isNaN(page) || page < 1) {
    page = 1;
  }

  const searchTerm = url.searchParams.get('search') || '';
  const sortParam = url.searchParams.get('sort') || 'newest';
  const limit = CLAIMS_PER_PAGE;

  const filter = {};
  if (searchTerm) {
    const escapedSearchTerm = searchTerm.replace(
      /[-\/\\^$*+?.()|[\]{}]/g,
      '\\$&'
    );
    filter["user.username"] = { $regex: escapedSearchTerm, $options: 'i' };
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
    sort: sortParam
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
      // Delete all claims that are already fulfilled
      const result = await robuxClaims.deleteMany({ resolved: true });
      return { success: true, deletedCount: result.deletedCount };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
};
