import { superValidate, fail, message } from "sveltekit-superforms"
import { valibot } from 'sveltekit-superforms/adapters'
import { registerSchema, loginSchema, forgotPasswordSchema, verifySchema, resetPasswordSchema } from "$lib/schemes"
import { currencies } from "$lib/utils"
import countryToCurrency from "$lib/utils/country-to-currency"
import { currencyRates } from "$server/api"

export const load = async ({ url, cookies, locals }) => {
  const lang = (cookies.get("lang") || "EN")
  const curr = (cookies.get("curr") || (currencies?.[countryToCurrency?.[locals.country]] && countryToCurrency?.[locals.country]) || "USD")

  if (!cookies.get("lang") || !cookies.get("curr")) {
    cookies.set("lang", lang, { path: '/', sameSite: 'Strict', httpOnly: false, maxAge: 9e5, secure: false });
    cookies.set("curr", curr, { path: '/', sameSite: 'Strict', httpOnly: false, maxAge: 9e5, secure: false });
  }

  const temporaryRegisterForm = await superValidate(valibot(registerSchema, { abortPipeEarly: true }))
  const temporaryLoginForm = await superValidate(valibot(loginSchema, { abortPipeEarly: true }))
  const temporaryForgotPasswordForm = await superValidate(valibot(forgotPasswordSchema, { abortPipeEarly: true }))
  const temporaryResetPasswordForm = await superValidate(valibot(resetPasswordSchema, { abortPipeEarly: true }))
  const temporaryVerifyForm = await superValidate(valibot(verifySchema, { abortPipeEarly: true }))

  // temporaryRegisterForm.data.username = 'xTheAlex14'
  // temporaryRegisterForm.data.email = 'xthealex11@gmail.com'
  // temporaryRegisterForm.data.password = 'Gh!Eats7Q3tG&Cp!'

  // temporaryLoginForm.data.identifier = 'xthealex11@gmail.com'
  // temporaryLoginForm.data.password = 'Gh!Eats7Q3tG&Cp!'

  if(url.searchParams.get("resetCode"))
    temporaryResetPasswordForm.data.code = url.searchParams.get("resetCode")

  if (url.searchParams.get("claimOrder")) {
    const email = url.searchParams.get("email")
    temporaryRegisterForm.data.email = email
    temporaryRegisterForm.data.username = email.split("@")[0]
  }

  return {
    lang,
    curr,
    rate: currencyRates[curr],
    forms: {
      register: temporaryRegisterForm,
      login: temporaryLoginForm,
      forgotPassword: temporaryForgotPasswordForm,
      resetPassword: temporaryResetPasswordForm,
      verify: temporaryVerifyForm
    },
    ...(locals.localUser ? { localUser: locals.localUser } : {})
  }
}