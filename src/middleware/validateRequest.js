// ============================
//  VALIDATE REQUEST MIDDLEWARE
// ============================

import Joi from "joi";

export const validateRequest = (schema) => (req, res, next) => {
  const options = {
    abortEarly: false, // Show all validation errors
    allowUnknown: false, // Do NOT allow unknown fields
    stripUnknown: true, // Remove unknown fields
  };

  const { value, error } = schema.validate(req.body, options);

  if (error) {
    const messages = error.details.map((detail) => detail.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: messages,
    });
  }

  req.body = value; // sanitized body
  next();
};
