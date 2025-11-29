import { orders, users } from '$server/mongo';
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

  // Filter for orders that have robuxPurchase field (robux purchase orders)
  // Exclude orders hidden from admin panel
  const filter = { 'robuxPurchase.robuxPurchaseId': { $ne: null }, hiddenFromAdmin: { $ne: true } };
  if (searchTerm) {
    const escapedSearchTerm = searchTerm.replace(
      /[-\/\\^$*+?.()|[\]{}]/g,
      '\\$&'
    );
    filter['reciever.username'] = { $regex: escapedSearchTerm, $options: 'i' };
  }

  // Determine sort criteria based on sortParam
  let sortCriteria = {};
  switch (sortParam) {
    case 'oldest':
      sortCriteria = { createdAt: 1 };
      break;
    case 'amount_desc':
      sortCriteria = { 'robuxPurchase.robuxAmount': -1 };
      break;
    case 'amount_asc':
      sortCriteria = { 'robuxPurchase.robuxAmount': 1 };
      break;
    case 'newest':
    default:
      sortCriteria = { createdAt: -1 };
      break;
  }

  const totalClaims = await orders.countDocuments(filter);
  const totalPages = Math.ceil(totalClaims / limit) || 1;

  // Calculate grand total of all robux purchase gamepass prices
  const grandTotalResult = await orders.aggregate([
    { $match: { 'robuxPurchase.robuxPurchaseId': { $ne: null }, status: { $ne: 'completed' }, hiddenFromAdmin: { $ne: true } } },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$robuxPurchase.gamepass.price' }
      }
    }
  ]);
  
  const grandTotal = grandTotalResult.length > 0 ? grandTotalResult[0].totalAmount : 0;

  if (page > totalPages && totalPages > 0) {
    page = totalPages;
  }

  const skip = (page - 1) * limit;

  const claimsList = await orders
    .find(filter)
    .sort(sortCriteria)
    .skip(skip)
    .limit(limit)
    .lean();

  const serializedClaims = claimsList.map((order) => {
    // Deep serialize ObjectIds and Dates
    const serialize = (obj) => {
      if (obj === null || obj === undefined) return obj;
      if (obj instanceof Date) return obj.toISOString();
      if (obj.constructor.name === 'ObjectId') return obj.toString();
      if (Array.isArray(obj)) return obj.map(serialize);
      if (typeof obj === 'object') {
        return Object.entries(obj).reduce((acc, [key, value]) => {
          acc[key] = serialize(value);
          return acc;
        }, {});
      }
      return obj;
    };
    return serialize(order);
  });

  console.log(serializedClaims)

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
      const orderId = formData.get('claimId');

      if (!orderId) {
        return { success: false, message: 'Order ID is missing.' };
      }

      // Attempt to update the order document to 'ready' status
      const result = await orders.updateOne(
        { _id: new ObjectId(orderId), status: 'ready' },
        {
          $set: {
            status: 'completed',
            'robuxPurchase.fulfillmentDate': new Date()
          }
        }
      );

      if (result.modifiedCount === 1) {
        return { success: true, claimId: orderId };
      } else {
        return {
          success: false,
          message: 'Order not found or already fulfilled.'
        };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
  fulfillAllClaims: async ({ locals }) => {
    const session = locals.session;
    if (!session) {
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
      // Update all robux purchase orders that are completed but not yet ready
      const result = await orders.updateMany(
        { 'robuxPurchase.robuxPurchaseId': { $ne: null }, status: 'ready' },
        {
          $set: {
            status: 'completed',
            'robuxPurchase.fulfillmentDate': new Date()
          }
        }
      );

      return { success: true, updatedCount: result.modifiedCount };
    } catch (error) {
      console.error('Error fulfilling all claims:', error);
      return {
        success: false,
        message: 'Failed to fulfill all claims due to a server error.'
      };
    }
  },
  clearFulfilledClaims: async ({ request, locals }) => {
    const session = locals.session;
    if (!session) {
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
      // Hide all robux purchase orders that are already fulfilled (status: 'completed') from admin panel
      // This keeps them in the database so users can still see them
      const result = await orders.collection.updateMany(
        {
          'robuxPurchase.robuxPurchaseId': { $ne: null },
          status: 'completed'
        },
        {
          $set: { hiddenFromAdmin: true }
        }
      );
      return { success: true, hiddenCount: result.modifiedCount };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
};
