import { redirect } from '@sveltejs/kit'
import { deleteSessionCookie } from '$server/api'

export const GET = ({ cookies, locals }) => {
  deleteSessionCookie(cookies)
  delete locals.localUser
  delete locals.session

  return redirect(303, "/")
}