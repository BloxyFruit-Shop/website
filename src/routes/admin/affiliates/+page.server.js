import { users } from '$server/mongo';
import { roleEnums } from '$server/schemes';
import { redirect } from '@sveltejs/kit';

const USERS_PER_PAGE = 12;

export const load = async ({ locals, url }) => {
  let page = parseInt(url.searchParams.get('page') || '1', 10);
  if (isNaN(page) || page < 1) {
    page = 1;
  }

  const searchTerm = url.searchParams.get('search') || '';
  const limit = USERS_PER_PAGE;

  const filter = {};
  if (searchTerm) {
    const escapedSearchTerm = searchTerm.replace(
      /[-\/\\^$*+?.()|[\]{}]/g,
      '\\$&'
    );
    filter.username = { $regex: escapedSearchTerm, $options: 'i' };
  }

  const totalUsers = await users.countDocuments(filter);
  const totalPages = Math.ceil(totalUsers / limit) || 1;

  if (page > totalPages && totalPages > 0) {
    page = totalPages;
  }

  const skip = (page - 1) * limit;

  const userList = await users
    .find(filter)
    .select({ username: 1, robux: 1, _id: 1 })
    .sort({ username: 1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const serializedUsers = userList.map((user) => ({
    ...user,
    _id: user._id.toString(),
    robux: user.robux ?? 0
  }));

  return {
    affiliates: serializedUsers,
    pagination: {
      currentPage: page,
      totalPages: totalPages,
      limit: limit,
      totalUsers: totalUsers
    },
    searchTerm: searchTerm
  };
};

export const actions = {
  updateRobux: async ({ request, locals }) => {
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

    const formData = await request.formData();
    const userId = formData.get('userId')?.toString();
    const newRobuxAmountStr = formData.get('newRobuxAmount')?.toString();

    if (!userId || !newRobuxAmountStr) {
      return fail(400, {
        success: false,
        message: 'Missing user ID or Robux amount.'
      });
    }

    let newRobuxAmount;
    try {
      newRobuxAmount = parseInt(newRobuxAmountStr, 10);
      if (isNaN(newRobuxAmount) || newRobuxAmount < 0) {
        throw new Error('Invalid amount');
      }
    } catch (error) {
      return fail(400, {
        success: false,
        userId,
        message: 'Invalid Robux amount. Must be a non-negative number.'
      });
    }

    try {
      const result = await users.updateOne(
        { _id: userId },
        { $set: { robux: newRobuxAmount } }
      );

      if (result.matchedCount === 0) {
        return fail(404, {
          success: false,
          userId,
          message: 'User not found.'
        });
      }
      if (result.modifiedCount === 0 && result.matchedCount === 1) {
        // If the value submitted is the same as the one in DB, it's technically success
        return {
          success: true,
          userId,
          updatedAmount: newRobuxAmount,
          message: 'Robux amount unchanged.'
        };
      }

      return { success: true, userId, updatedAmount: newRobuxAmount };
    } catch (error) {
      console.error('Error updating Robux:', error);
      return fail(500, {
        success: false,
        userId,
        message: 'Failed to update Robux due to a server error.'
      });
    }
  }
};
