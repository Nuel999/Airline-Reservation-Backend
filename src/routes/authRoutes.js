// ============================
//  AUTH ROUTES
// ============================

import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { registerSchema, loginSchema } from "../validators/authValidator.js";

const router = express.Router();

router.post("/register", validateRequest(registerSchema), registerUser);
router.post("/login", validateRequest(loginSchema), loginUser);

export default router;
