import { redirect } from '@sveltejs/kit';
import { users } from '$server/mongo';
import { roleEnums } from '$server/schemes';

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ locals, url }) {
  const session = locals.session;
  if (!session) {
    // Not logged in, redirect to home
    throw redirect(302, '/');
  }

  const user = await users.findOne({ 'session.id': session }).lean();
  if (!user || !user.role || user.role < roleEnums.Admin) {
    console.warn(`Unauthorized admin access attempt.`);
    throw redirect(303, '/');
  }
}
