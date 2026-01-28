// PostgreSQL connection configuration
// ---------------------------------------------

import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

// ---------------------------------------------
// Create connection pool

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Verify connection
// ---------------------------------------------
pool
  .connect()
  .then(() => console.log("✅ Connected to PostgreSQL successfully"))
  .catch((err) => console.error("❌ Database connection failed:", err.message));

// Export pool for use in models
export { pool };
