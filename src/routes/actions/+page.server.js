import { superValidate, message, fail } from "sveltekit-superforms"
import { valibot } from 'sveltekit-superforms/adapters'
import { registerSchema, loginSchema, forgotPasswordSchema, verifySchema, resetPasswordSchema } from "$lib/schemes"
import { users, verifications } from "$server/mongo"
import { statusEnums } from "$server/schemes"
import { bcryptHash, bcryptCompare, setSessionCookie, sendEmail } from "$server/api"
import { cacheUserBySession, usersCache } from "$server/cache"
import { randomBytes } from "crypto"
import { timeOffset } from "$server/utils"
import { confirmAccountEmail, resetPasswordEmail } from "$server/emails"
import { init } from '@paralleldrive/cuid2';

const createCode = init({
  length: 10
});

export const actions = {
  register: async ({ request, cookies }) => {
    const form = await superValidate(request, valibot(registerSchema, { abortPipeEarly: true }))
    if (!form.valid) return fail(400, { form })
    
    const usernameRegex = new RegExp(["^", form.data.username, "$"].join(""), "i")
    
    const userInUse = await users.findOne({
      $or: [ { username: usernameRegex }, { email: form.data.email.toLowerCase() } ]
    }).lean()
    if (userInUse) return message(form, 'Username or Email is already taken.', { status: 500 })
      
    const code = Math.random().toString(36).slice(2, 8).toUpperCase()
    sendEmail(form.data.email, confirmAccountEmail(code), "Verify your account!")

    const session = randomBytes(24).toString('hex')
    
    const createdUser = await users.create({
      username: form.data.username,
      email: form.data.email.toLowerCase(),
      password: await bcryptHash(form.data.password, 10),
      status: {
        code: statusEnums.verifying
      },
      session: {
        id: session,
        date: new Date()
      }
    })

    await verifications.create({
      type: "verify-account",
      author: createdUser._id.toString(),
      code
    })

    cacheUserBySession(session, createdUser._id, {
      username: form.data.username,
      referralCode: createdUser.referralCode,
      status: statusEnums.verifying,
      email: form.data.email
    })

    setSessionCookie(cookies, session)

    return message(form, "Registered successfully.")
  },
  login: async ({ request, cookies }) => {
    const form = await superValidate(request, valibot(loginSchema, { abortPipeEarly: true }))
    if (!form.valid) return fail(400, { form })
    
    const user = await users.findOne(
      { [form.data.identifier.includes("@") ? "email" : "username"]: form.data.identifier },
      { username: 1, password: 1, email: 1, referralCode: 1, "status.code": 1 }
    )
    if (!user) return message(form, "We couldn't find your account, sorry.", { status: 500 })

    const userObject = user.toObject()

    const passswordsMatch = await bcryptCompare(form.data.password, userObject.password)
    if(!passswordsMatch) return message(form, "Your password doesn't match, try again.", { status: 500 })

    if(userObject.status.code == statusEnums.banned) return message(form, "Sorry, your account has been banned.", { status: 500 })

    const session = randomBytes(24).toString('hex')
    let refCode = userObject.referralCode;

    if (!refCode) {
      refCode = createCode();
    }

    await user.updateOne({
      session: {
        id: session,
        date: new Date()
      },
      referralCode: refCode
    })
    
    cacheUserBySession(session, userObject._id, {
      username: userObject.username,
      status: userObject.status.code,
      referralCode: refCode,
      email: userObject.email
    })

    setSessionCookie(cookies, session)
    
    return message(form, "Logged successfully.")
  },
  forgotPassword: async({ request }) => {
    const form = await superValidate(request, valibot(forgotPasswordSchema, { abortPipeEarly: true }))
    if (!form.valid) return fail(400, { form })

    const user = await users.findOne(
      { email: form.data.email },
      { username: 1, password: 1, "status.code": 1, robux: 1, experience: 1, roblox: 1 }
    )
    
    if (!user) return message(form, "We couldn't find your account, sorry.", { status: 500 })
    const userObject = user.toObject()

    const alreadySent = await verifications.findOne({ 
      author: userObject._id.toString(),
      type: "forgot-password"
    })

    if(alreadySent) {
      const elapsedMinutes = Math.floor((Date.now() - new Date(alreadySent._id.getTimestamp())) / 60_000)

      if(elapsedMinutes < 5) return message(form, `Instructions already sent. Wait ${5 - elapsedMinutes} min(s) before resending.`, { status: 500 })
    
      await alreadySent.deleteOne()
    }
    if(userObject.status.code == statusEnums.banned) return message(form, "Sorry, your account has been banned.", { status: 500 })

    const code = randomBytes(12).toString('hex')
    await verifications.create({
      type: "forgot-password",
      author: userObject._id.toString(),
      code
    })

    sendEmail(form.data.email, resetPasswordEmail(code), "Reset your password!")

    return message(form, "Instructions sent successfully.")
  },
  verify: async ({ request, locals }) => {
    const form = await superValidate(request, valibot(verifySchema, { abortPipeEarly: true }))
    if(!locals.localUser) return message(form, "You must be logged in.", { status: 500 })

    if (!form.valid) return fail(400, { form })
    
    const verification = await verifications.findOne({
      author: locals.localUser._id,
      type: "verify-account",
      code: form.data.code
    })

    if (!verification) return message(form, "Invalid code, try again.", { status: 500 })
    
    const user = await users.findById(locals.localUser._id, {
      "status.code": 1
    })
    const userObject = user.toObject()

    if(userObject.status.code == statusEnums.banned) return message(form, "Sorry, your account has been banned.", { status: 500 })
    
    await user.updateOne({
      "status.code": statusEnums.active
    })

    if(usersCache[locals.session])
      usersCache[locals.session].status = statusEnums.active

    verification.deleteOne().exec()
    
    return message(form, "Email verified successfully.")
  },
  resendCode: async ({ request, locals }) => {
    return { error: true, message: "Instructions resent, check your email." }
  },
  resetPassword: async ({ request, locals }) => {
    const form = await superValidate(request, valibot(resetPasswordSchema, { abortPipeEarly: true }))
    if (!form.valid) return fail(400, { form })

    const verification = await verifications.findOne({ code: form.data.code })
    if(!verification) return message(form, 'Code expired or is invalid, try again.', { status: 500 })
  
    const user = await users.findById(verification.author, { _id: 1, "status.code": 1, password: 1 })
    if(!user) return message(form, 'User not found, contact an admin.', { status: 500 })
    const userObject = user.toObject()

    if(await bcryptCompare(form.data.password, userObject.password)) return message(form, "New and old password must be different.", { status: 500 })
  
    await user.updateOne({ password: await bcryptHash(form.data.password, 10) })
    await verification.deleteOne()

    return message(form, "Reset password successfully.")
  }
}