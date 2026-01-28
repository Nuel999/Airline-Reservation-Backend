import Joi from "joi";

// ===============================
//  REGISTER VALIDATION
// ===============================
export const registerSchema = Joi.object({
  full_name: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .required()
    .messages({
      "string.empty": "Full name is required",
      "string.min": "Full name must be at least 3 characters",
      "any.required": "Full name is required",
    }),

  email: Joi.string()
    .trim()
    .email()
    .required()
    .messages({
      "string.email": "Email must be valid",
      "any.required": "Email is required",
    }),

  password: Joi.string()
    .trim()
    .min(6)
    .required()
    .messages({
      "string.min": "Password must be at least 6 characters",
      "any.required": "Password is required",
    }),

  role: Joi.string()
    .valid("passenger", "admin")
    .default("passenger"),

  adminKey: Joi.string().optional(),
});

// ===============================
//  LOGIN VALIDATION
// ===============================
export const loginSchema = Joi.object({
  email: Joi.string().trim().email().required().messages({
    "string.email": "Email must be valid",
    "any.required": "Email is required",
  }),

  password: Joi.string().trim().required().messages({
    "any.required": "Password is required",
  }),
});
