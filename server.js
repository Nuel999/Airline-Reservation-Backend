// ============================
//  SERVER ENTRY POINT
// ============================

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { pool } from "./src/config/db.js";
import {
  createUserTable,
  createFlightTable,
  createBookingTable,
} from "./src/models/tableInit.js";
import authRoutes from "./src/routes/authRoutes.js";
import testRoutes from "./src/routes/testRoutes.js";
import flightRoutes from "./src/routes/flightRoutes.js";
import bookingRoutes from "./src/routes/bookingRoutes.js";
import { errorHandler } from "./src/middleware/errorHandler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ----------------------------
//  Middleware
// ----------------------------
app.use(cors());
app.use(express.json());

// Security & Logging Middleware
if (process.env.ENABLE_LOGGING === "true") {
  app.use(morgan("dev"));
}
app.use(helmet()); // Adds secure HTTP headers
app.use(morgan("combined")); // Logs all incoming requests

// ----------------------------
//  Routes
// ----------------------------
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/flights", flightRoutes);
app.use("/api/bookings", bookingRoutes);

// ----------------------------
//  Health + Default Routes
// ----------------------------
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({ status: "ok", message: "Database connected" });
  } catch {
    res
      .status(500)
      .json({ status: "error", message: "Database not reachable" });
  }
});

app.get("/", (req, res) => {
  res.send("✈️ Airline Reservation Backend is Running...");
});

// ----------------------------
//  Error Handler (Global)
// ----------------------------
app.use(errorHandler);

// ----------------------------
//  Start Server
// ----------------------------
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);

  try {
    await pool.connect();
    console.log("✅ Connected to PostgreSQL successfully");

    await createUserTable();
    await createFlightTable();
    await createBookingTable();
    console.log("✅ All database tables are ready");
  } catch (error) {
    console.error("❌ Error initializing the database:", error.message);
  }
});

// ----------------------------
//  Graceful Shutdown
// ----------------------------
process.on("SIGINT", async () => {
  console.log("\n🧹 Closing database connection...");
  await pool.end();
  console.log("✅ PostgreSQL connection closed. Server shutting down.");
  process.exit(0);
});
