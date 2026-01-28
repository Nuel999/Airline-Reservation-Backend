// Handles all database operations for the User entity.

import { pool } from "../config/db.js";

// ---------------------------------------------
// Create a new user
// ---------------------------------------------
export const createUser = async (
  full_name,
  email,
  hashedPassword,
  role = "passenger"
) => {
  const query = `
    INSERT INTO users (full_name, email, password, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, full_name, email, role, created_at
  `;
  const values = [full_name, email, hashedPassword, role];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// ---------------------------------------------
// Find user by email
// ---------------------------------------------
export const findUserByEmail = async (email) => {
  const query = `SELECT * FROM users WHERE email = $1`;
  const result = await pool.query(query, [email]);
  return result.rows[0];
};
