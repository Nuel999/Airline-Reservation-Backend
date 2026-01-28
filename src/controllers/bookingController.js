// ============================
//  ADVANCED BOOKING CONTROLLER (Refactored)
// ============================

import { pool } from "../config/db.js";
import crypto from "crypto";
import { successResponse, errorResponse } from "../utils/response.js";

// ---------------------------------------------
//  Create Booking (with Seat Capacity, PNR, and Transaction Safety)
// ---------------------------------------------
export const createBooking = async (req, res) => {
  const client = await pool.connect(); // Get a dedicated client for the transaction
  try {
    const { flight_id, seat_number } = req.body;
    const user_id = req.user.id; // From your auth middleware

    await client.query("BEGIN"); // Start Transaction

    // 1. Lock the flight row to prevent other users from grabbing the last seat
    const flightRes = await client.query(
      "SELECT available_seats FROM flights WHERE id = $1 FOR UPDATE",
      [flight_id]
    );

    if (flightRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return errorResponse(res, 404, "Flight not found");
    }

    const availableSeats = flightRes.rows[0].available_seats;

    // 2. Check if seats are actually available
    if (availableSeats <= 0) {
      await client.query("ROLLBACK");
      return errorResponse(res, 400, "Flight is fully booked");
    }

    // 3. Generate a unique PNR (6 characters)
    const pnr = crypto.randomBytes(3).toString("hex").toUpperCase();

    // 4. Create the booking record
    const bookingQuery = `
      INSERT INTO bookings (user_id, flight_id, seat_number, pnr, status)
      VALUES ($1, $2, $3, $4, 'confirmed')
      RETURNING *;
    `;
    const bookingResult = await client.query(bookingQuery, [user_id, flight_id, seat_number, pnr]);

    // 5. Subtract 1 from available_seats
    await client.query(
      "UPDATE flights SET available_seats = available_seats - 1 WHERE id = $1",
      [flight_id]
    );

    await client.query("COMMIT"); // Save all changes permanently

    return successResponse(res, 201, "✅ Seat booked successfully", {
      booking: bookingResult.rows[0],
    });

  } catch (error) {
    await client.query("ROLLBACK"); // Undo everything if something fails
    console.error("❌ Booking Error:", error.message);
    return errorResponse(res, 500, "Booking failed", error.message);
  } finally {
    client.release(); // Return the client to the pool
  }
};
// ---------------------------------------------
//  Get All Bookings (Admin) with Pagination + Search
// ---------------------------------------------
export const getAllBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `
      SELECT 
        b.id, b.pnr, b.seat_number, b.created_at,
        u.full_name AS passenger_name,
        f.flight_number, f.origin, f.destination
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN flights f ON b.flight_id = f.id
      WHERE 
        u.full_name ILIKE $1 OR
        f.flight_number ILIKE $1 OR
        b.pnr ILIKE $1
      ORDER BY b.created_at DESC
      LIMIT $2 OFFSET $3;
      `,
      [`%${search}%`, limit, offset]
    );

    const totalRes = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN flights f ON b.flight_id = f.id
      WHERE 
        u.full_name ILIKE $1 OR
        f.flight_number ILIKE $1 OR
        b.pnr ILIKE $1;
      `,
      [`%${search}%`]
    );

    const total = parseInt(totalRes.rows[0].total, 10);
    const totalPages = Math.ceil(total / limit);

    return successResponse(res, 200, "📋 All bookings retrieved successfully", {
      currentPage: parseInt(page, 10),
      totalPages,
      totalBookings: total,
      bookings: result.rows,
    });
  } catch (error) {
    console.error("❌ Error fetching bookings:", error.message);
    return errorResponse(res, 500, "Server error while fetching bookings", error.message);
  }
};

// ---------------------------------------------
//  Get User’s Bookings
// ---------------------------------------------
export const getUserBookings = async (req, res) => {
  try {
    const user_id = req.user.id;

    const query = `
      SELECT 
        b.id as booking_id,
        b.pnr,
        b.seat_number,
        b.status,
        b.booking_date,
        f.flight_number,
        f.origin,
        f.destination,
        f.departure_time,
        f.price
      FROM bookings b
      JOIN flights f ON b.flight_id = f.id
      WHERE b.user_id = $1
      ORDER BY b.booking_date DESC;
    `;

    const result = await pool.query(query, [user_id]);

    return successResponse(res, 200, "Your bookings retrieved successfully", {
      count: result.rowCount,
      bookings: result.rows
    });
  } catch (error) {
    return errorResponse(res, 500, "Error retrieving bookings", error.message);
  }
};

// ---------------------------------------------
//  Cancel Booking (User only)
// ---------------------------------------------
export const cancelBooking = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params; // The Booking ID (which is 1 in your case)
    const user_id = req.user.id;

    await client.query("BEGIN");

    // 1. Find the booking and ensure it belongs to the user and is still 'confirmed'
    const bookingRes = await client.query(
      "SELECT flight_id FROM bookings WHERE id = $1 AND user_id = $2 AND status = 'confirmed' FOR UPDATE",
      [id, user_id]
    );

    if (bookingRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return errorResponse(res, 404, "Active booking not found or already cancelled");
    }

    const flightId = bookingRes.rows[0].flight_id;

    // 2. Change status to 'cancelled' (Soft Delete)
    await client.query(
      "UPDATE bookings SET status = 'cancelled' WHERE id = $1",
      [id]
    );

    // 3. IMPORTANT: Restore the seat to the flight inventory
    await client.query(
      "UPDATE flights SET available_seats = available_seats + 1 WHERE id = $1",
      [flightId]
    );

    await client.query("COMMIT");

    return successResponse(res, 200, "❌ Booking cancelled and seat restored");
  } catch (error) {
    await client.query("ROLLBACK");
    return errorResponse(res, 500, "Cancellation failed", error.message);
  } finally {
    client.release();
  }
};