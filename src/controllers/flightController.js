// ============================
//  FLIGHT CONTROLLER (Enterprise Refactor)
// ============================

import { pool } from "../config/db.js";
import { successResponse, errorResponse } from "../utils/response.js";

// ---------------------------------------------
//  Get all flights (Public) — with Pagination & Search
// ---------------------------------------------
export const getAllFlights = async (req, res) => {
  try {
    // 1. Get Pagination and Filter params
    let { origin, destination, date, page = 1, limit = 10 } = req.query;

    // Convert to numbers to avoid errors
    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;

    let query = "SELECT * FROM flights WHERE 1=1";
    let countQuery = "SELECT COUNT(*) FROM flights WHERE 1=1"; // To get total for frontend
    const values = [];
    let paramCount = 1;

    // Filter Logic (Same as before)
    if (origin) {
      const filter = ` AND origin ILIKE $${paramCount++}`;
      query += filter;
      countQuery += filter;
      values.push(`%${origin}%`);
    }

    if (destination) {
      const filter = ` AND destination ILIKE $${paramCount++}`;
      query += filter;
      countQuery += filter;
      values.push(`%${destination}%`);
    }

    // 2. Add Pagination to the main query
    query += ` ORDER BY departure_time ASC LIMIT $${paramCount++ } OFFSET $${paramCount++}`;
    const queryValues = [...values, limit, offset];

    // 3. Execute both queries (Data and Total Count)
    const [dataRes, countRes] = await Promise.all([
      pool.query(query, queryValues),
      pool.query(countQuery, values)
    ]);

    const totalRecords = parseInt(countRes.rows[0].count);
    const totalPages = Math.ceil(totalRecords / limit);

    // 4. Return Metadata (Essential for the frontend developer)
    return successResponse(res, 200, "✈️ Flights retrieved successfully", {
      pagination: {
        totalRecords,
        totalPages,
        currentPage: page,
        limit
      },
      flights: dataRes.rows
    });
  } catch (error) {
    return errorResponse(res, 500, "Error searching flights", error.message);
  }
};

// ---------------------------------------------
//  Get single flight by ID (Public)
// ---------------------------------------------
export const getFlightById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM flights WHERE id = $1", [
      id,
    ]);

    if (result.rowCount === 0)
      return errorResponse(res, 404, "Flight not found");

    return successResponse(res, 200, "✈️ Flight retrieved successfully", {
      flight: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error fetching flight:", error.message);
    return errorResponse(
      res,
      500,
      "Server error while fetching flight",
      error.message
    );
  }
};

// ---------------------------------------------
//  Create a new flight (Admin only)
// ---------------------------------------------
export const createFlight = async (req, res) => {
  try {
    const {
      flight_number,
      origin,
      destination,
      departure_time,
      arrival_time,
      price,
      total_seats,
    } = req.body;

    // 1. Validation Logic
    if (
      !flight_number ||
      !origin ||
      !destination ||
      !departure_time ||
      !arrival_time ||
      !price ||
      !total_seats
    ) {
      return errorResponse(res, 400, "All fields are required");
    }

    // 2. Check for Duplicate Flight Number
    const existing = await pool.query(
      "SELECT id FROM flights WHERE flight_number = $1",
      [flight_number]
    );

    if (existing.rowCount > 0) {
      return errorResponse(res, 409, "Flight number already exists");
    }

    // 3. Insert Logic (Initializing available_seats = total_seats)
    const query = `
      INSERT INTO flights 
        (flight_number, origin, destination, departure_time, arrival_time, price, total_seats, available_seats)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;

    // Note: We pass total_seats twice — once for the capacity and once for the starting availability
    const result = await pool.query(query, [
      flight_number,
      origin,
      destination,
      departure_time,
      arrival_time,
      price,
      total_seats,
      total_seats,
    ]);

    // 4. Match your exact successResponse format
    return successResponse(res, 201, "✅ Flight created successfully", {
      flight: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error creating flight:", error.message);

    // 5. Match your exact errorResponse format
    return errorResponse(
      res,
      500,
      "Server error while creating flight",
      error.message
    );
  }
};

// ---------------------------------------------
//  Update a flight (Admin only)
// ---------------------------------------------
export const updateFlight = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      flight_number,
      origin,
      destination,
      departure_time,
      arrival_time,
      price,
      total_seats,
    } = req.body;

    const existing = await pool.query("SELECT id FROM flights WHERE id = $1", [
      id,
    ]);
    if (existing.rowCount === 0)
      return errorResponse(res, 404, "Flight not found");

    const result = await pool.query(
      `
      UPDATE flights
      SET flight_number = $1,
          origin = $2,
          destination = $3,
          departure_time = $4,
          arrival_time = $5,
          price = $6,
          total_seats = $7
      WHERE id = $8
      RETURNING *;
      `,
      [
        flight_number,
        origin,
        destination,
        departure_time,
        arrival_time,
        price,
        total_seats,
        id,
      ]
    );

    return successResponse(res, 200, "✈️ Flight updated successfully", {
      flight: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error updating flight:", error.message);
    return errorResponse(
      res,
      500,
      "Server error while updating flight",
      error.message
    );
  }
};

// ---------------------------------------------
//  Delete a flight (Admin only)
// ---------------------------------------------
export const deleteFlight = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM flights WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0)
      return errorResponse(res, 404, "Flight not found");

    return successResponse(res, 200, "🗑️ Flight deleted successfully");
  } catch (error) {
    console.error("❌ Error deleting flight:", error.message);
    return errorResponse(
      res,
      500,
      "Server error while deleting flight",
      error.message
    );
  }
};

export const getAdminStats = async (req, res) => {
  try {
    // 1. Total Revenue from confirmed bookings
    // Formula: $Total Revenue = \sum (Confirmed Bookings \times Price)$
    const revenueQuery = `
      SELECT SUM(f.price) as total_revenue 
      FROM bookings b
      JOIN flights f ON b.flight_id = f.id
      WHERE b.status = 'confirmed'
    `;

    // 2. Booking Status Breakdown (Confirmed vs Cancelled)
    const statusQuery = `
      SELECT status, COUNT(*) as count 
      FROM bookings 
      GROUP BY status
    `;

    // 3. Top 3 Most Popular Flights
    const popularFlightsQuery = `
      SELECT f.flight_number, f.origin, f.destination, COUNT(b.id) as ticket_count
      FROM bookings b
      JOIN flights f ON b.flight_id = f.id
      WHERE b.status = 'confirmed'
      GROUP BY f.id
      ORDER BY ticket_count DESC
      LIMIT 3
    `;

    const [revenueRes, statusRes, popularRes] = await Promise.all([
      pool.query(revenueQuery),
      pool.query(statusQuery),
      pool.query(popularFlightsQuery)
    ]);

    return successResponse(res, 200, "📊 Admin statistics retrieved", {
      revenue: parseFloat(revenueRes.rows[0].total_revenue || 0),
      bookingStats: statusRes.rows,
      topFlights: popularRes.rows
    });
  } catch (error) {
    return errorResponse(res, 500, "Error generating admin stats", error.message);
  }
};