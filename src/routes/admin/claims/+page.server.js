import { robuxClaims, users } from '$server/mongo';
import { roleEnums } from '$server/schemes';
import { redirect } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';

const CLAIMS_PER_PAGE = 12;


/*
robuxClaim Schema
{
  user: {
    id: String,
    username: String,
    displayName: String,
  },
  resolved: { type: Boolean, default: false },
  resolvedAt: { type: Date, default: null },
  robuxAmount: { type: Number, default: 0 },
  game: {
    id: String,
    name: String
  },
  gamepass: {
    id: String,
    displayName: String,
    price: Number
  },
  createdAt: { type: Date, default: Date.now }
}
*/

export const load = async ({ locals, url }) => {
  let page = parseInt(url.searchParams.get('page') || '1', 10);
  if (isNaN(page) || page < 1) {
    page = 1;
  }

  const searchTerm = url.searchParams.get('search') || '';
  const limit = CLAIMS_PER_PAGE;

  const filter = {};
  if (searchTerm) {
    const escapedSearchTerm = searchTerm.replace(
      /[-\/\\^$*+?.()|[\]{}]/g,
      '\\$&'
    );
    filter["user.username"] = { $regex: escapedSearchTerm, $options: 'i' };
  }

  const totalClaims = await robuxClaims.countDocuments(filter);
  const totalPages = Math.ceil(totalClaims / limit) || 1;

  if (page > totalPages && totalPages > 0) {
    page = totalPages;
  }

  const skip = (page - 1) * limit;

  const claimsList = await robuxClaims
    .find(filter)
    .sort({ createdAt: -1 })
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
    searchTerm: searchTerm
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
  }
};
