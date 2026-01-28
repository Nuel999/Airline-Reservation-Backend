import express from "express";
import {
  createBooking,
  getAllBookings,
  getUserBookings,
  cancelBooking,
} from "../controllers/bookingController.js";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  createBookingSchema,
  updateBookingSchema,
} from "../validators/bookingValidator.js";

const router = express.Router();

// =============================================
// USER ROUTES (Authenticated passengers)
// =============================================

// Create a booking
router.post(
  "/",
  verifyToken,
  validateRequest(createBookingSchema),
  createBooking
);

// Get all bookings for a logged-in user
router.get("/my-bookings", verifyToken, getUserBookings);

// Cancel (delete) a booking
router.patch("/:id/cancel", verifyToken, cancelBooking);

// ===========================================
// ADMIN ROUTES
// =============================================

// View all bookings in the system
router.get("/", verifyAdmin, getAllBookings);

export default router;
