// ============================
//  TEST PROTECTED ROUTE
// ============================

import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected route example
router.get("/profile", verifyToken, (req, res) => {
  res.status(200).json({
    message: "✅ Token verified. Access granted.",
    user: req.user,
  });
});

export default router;
