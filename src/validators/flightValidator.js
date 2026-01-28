// ============================
//  FLIGHT VALIDATION SCHEMAS
// ============================

import Joi from "joi";

// --------------------------------------
// ✈️ Create Flight Validation
// --------------------------------------
export const createFlightSchema = Joi.object({
  flight_number: Joi.string()
    .trim()
    .min(2)
    .max(10)
    .required()
    .messages({
      "string.empty": "Flight number is required",
      "any.required": "Flight number is required",
    }),

  origin: Joi.string()
    .trim()
    .min(2)
    .required()
    .messages({
      "string.empty": "Origin is required",
      "any.required": "Origin is required",
    }),

  destination: Joi.string()
    .trim()
    .min(2)
    .required()
    .messages({
      "string.empty": "Destination is required",
      "any.required": "Destination is required",
    }),

  departure_time: Joi.date()
    .iso()
    .required()
    .messages({
      "date.format": "Departure time must be a valid ISO date",
      "any.required": "Departure time is required",
    }),

  arrival_time: Joi.date()
    .iso()
    .required()
    .messages({
      "date.format": "Arrival time must be a valid ISO date",
      "any.required": "Arrival time is required",
    }),

  total_seats: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      "any.required": "Total seats is required",
    }),

  // optional but validated if provided
  available_seats: Joi.number().integer().min(0).optional(),

  price: Joi.number()
    .precision(2)
    .min(0)
    .required()
    .messages({
      "any.required": "Price is required",
    }),
});

// --------------------------------------
// ✈️ Update Flight Validation
// --------------------------------------
export const updateFlightSchema = Joi.object({
  flight_number: Joi.string().trim().min(2).max(10).optional(),

  origin: Joi.string().trim().min(2).optional(),

  destination: Joi.string().trim().min(2).optional(),

  departure_time: Joi.date().iso().optional(),

  arrival_time: Joi.date().iso().optional(),

  total_seats: Joi.number().integer().min(1).optional(),

  available_seats: Joi.number().integer().min(0).optional(),

  price: Joi.number().precision(2).min(0).optional(),
}).min(1); // at least one field required
