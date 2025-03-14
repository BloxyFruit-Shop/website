import { closeConnection } from "$server/mongo"
import { getUserBySession } from "$server/cache"
import { deleteSessionCookie } from "$server/api"

export const handle = async ({ event, resolve }) => {
  event.locals.ip = event.request.headers.get("cf-connecting-ip") || event.request.headers.get("x-forwarded-for") || "0.0.0.0"
  event.locals.country = event.request.headers.get("cf-ipcountry") || "RO"

  const session = event.cookies.get("session")
  if (session) {
    const user = await getUserBySession(session)
    if (!user)
      deleteSessionCookie(event.cookies)
    else
      event.locals.localUser = user, event.locals.session = session 
  }

  return await resolve(event)
}

const closeApp = async () => {
  closeConnection()

  setTimeout(() => {
    process.exit(0)
  }, 5000)
}
  
process.on("SIGINT", closeApp)
process.on("SIGTERM", closeApp)