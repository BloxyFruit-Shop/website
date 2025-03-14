import { object, string, number, pipe, boolean, check, maxLength, maxSize, minLength, email, forward, instance, mimeType, array, partialCheck, optional } from 'valibot'

const usernameSchema = pipe(
  string(),
  minLength(3, "Minimum 3 characters"),
  maxLength(24, "Maximum 24 characters"),
  check(
    (value) => /^\S*$/.test(value ?? ""), 
    "Spaces are not allowed"
  ),
  check(
    (value) => /^[A-Za-z0-9]+$/.test(value ?? ""), 
    "Username must contain only alphanumerical characters."
  )
)

const passwordSchema = pipe(
  string(),
  minLength(8, "Minimum 8 characters"),
  maxLength(32, "Maximum 32 characters"),
  check(
    (value) => /\d+/.test(value ?? ""), 
    "Password must contain atleast a number"
  )
)

const emailSchema = pipe(
  string(),
  maxLength(255, "Maximum 255 characters"),
  email('Valid email required')
)

const captchaSchema = pipe(
  string(),
  minLength(1, "Captcha required")
)

export const registerSchema = object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  // captcha: captchaSchema
})

export const loginSchema = object({
  identifier: pipe(
    string(),
    minLength(3, "Minimum 3 characters"),
    maxLength(255, "Maximum 255 characters"),
  ),
  password: passwordSchema,
  // captcha: captchaSchema
})

export const forgotPasswordSchema = object({
  email: emailSchema,
  // captcha: captchaSchema
})

export const verifySchema = object({
  code: pipe(
    string(),
    minLength(6, "Minimum 6 characters"),
    maxLength(6, "Maximum 6 characters")
  )
})

// export const resetPasswordSchema = object({
//   password: passwordSchema,

//   // captcha: captchaSchema
// })

export const resetPasswordSchema = pipe(
  object({
    code: pipe(string(), minLength(6, " ")),
    password: passwordSchema,
    confirmPassword: passwordSchema,
    // captcha: captchaSchema
  }),
  forward(
    check(
      (input) => input.password === input.confirmPassword,
      "Passwords don't match"
    ),
    ['confirmPassword']
  )
)