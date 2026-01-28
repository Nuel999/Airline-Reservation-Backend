// ============================
//  BOOKING VALIDATION SCHEMAS
// ============================

import Joi from "joi";

// --------------------------------------
// 🧾 Create Booking Validation
// --------------------------------------
export const createBookingSchema = Joi.object({
  flight_id: Joi.number()
    .integer()
    .required()
    .messages({
      "number.base": "Flight ID must be a valid number",
      "any.required": "Flight ID is required",
    }),

  passenger_name: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .required()
    .messages({
      "string.empty": "Passenger name is required",
      "string.min": "Passenger name must be at least 3 characters",
    }),

  passenger_email: Joi.string()
    .trim()
    .email()
    .required()
    .messages({
      "string.email": "Passenger email must be valid",
      "any.required": "Passenger email is required",
    }),

  // Optional because you auto-generate seat or check availability
  seat_number: Joi.string().trim().optional(),
});

// --------------------------------------
// 🔄 Update Booking Validation
// --------------------------------------
export const updateBookingSchema = Joi.object({
  seat_number: Joi.string().trim().optional(),

  status: Joi.string()
    .valid("confirmed", "cancelled", "pending")
    .optional()
    .messages({
      "any.only": "Status must be one of: confirmed, cancelled, pending",
    }),
}).min(1); // Must include at least one field
