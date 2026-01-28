import express from "express";
import {
  getAllFlights,
  getFlightById,
  createFlight,
  updateFlight,
  deleteFlight,
  getAdminStats,
} from "../controllers/flightController.js";
import { verifyAdmin } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  createFlightSchema,
  updateFlightSchema,
} from "../validators/flightValidator.js";

const router = express.Router();

// Public routes
router.get("/", getAllFlights);
router.get("/:id", getFlightById);

// Admin-only routes (with validation)
router.post("/", verifyAdmin, validateRequest(createFlightSchema), createFlight);
router.put("/:id", verifyAdmin, validateRequest(updateFlightSchema), updateFlight);
router.delete("/:id", verifyAdmin, deleteFlight);
router.get("/admin/stats", verifyAdmin, getAdminStats);

export default router;