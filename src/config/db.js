import pkg from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// 1. Manually point to the .env file (helps if the terminal is in the wrong folder)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const { Pool } = pkg;

// 🔍 SECURITY CHECK: Log what the app sees (Don't worry, it won't show your password)
console.log("Checking environment variables...");
if (!process.env.DATABASE_URL) {
  console.error("❌ ERROR: DATABASE_URL is missing from process.env!");
} else {
  console.log("✅ DATABASE_URL found. Length:", process.env.DATABASE_URL.length);
}

const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, 
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

pool
  .connect()
  .then(() => console.log("✅ Connected to PostgreSQL successfully"))
  .catch((err) => {
    console.error("❌ Database connection failed!");
    console.error("Error Message:", err.message);
  });

export { pool };