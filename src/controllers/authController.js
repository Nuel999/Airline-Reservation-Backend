// ============================
//  AUTH CONTROLLER (Refactored)
// ============================

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { findUserByEmail, createUser } from "../models/userModel.js";
import { successResponse, errorResponse } from "../utils/response.js";

// ---------------------------------------------
// REGISTER USER
// ---------------------------------------------
export const registerUser = async (req, res, next) => {
  try {
    const { full_name, email, password, role, adminKey } = req.body;

    // Basic validation
    if (!full_name || !email || !password) {
      return errorResponse(
        res,
        400,
        "Full name, email, and password are required"
      );
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) return errorResponse(res, 400, "User already exists");

    // Secure role assignment
    let userRole = "passenger"; // default

    if (adminKey && adminKey === process.env.ADMIN_KEY) {
      userRole = "admin";
    } else if (role?.toLowerCase() === "admin") {
      return errorResponse(res, 403, "Unauthorized role assignment attempt");
    } else if (role) {
      userRole = role.toLowerCase();
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in DB
    const newUser = await createUser(
      full_name,
      email,
      hashedPassword,
      userRole
    );

    return successResponse(res, 201, `${userRole} registered successfully`, {
      id: newUser.id,
      full_name: newUser.full_name,
      email: newUser.email,
      role: newUser.role,
    });
  } catch (error) {
    next(error); // Pass to global error handler
  }
};

// ---------------------------------------------
// LOGIN USER
// ---------------------------------------------
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return errorResponse(res, 400, "Email and password required");
    }

    // Find user
    const user = await findUserByEmail(email);
    if (!user) return errorResponse(res, 404, "User not found");

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return errorResponse(res, 401, "Invalid credentials");

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return successResponse(res, 200, "Login successful", {
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};
