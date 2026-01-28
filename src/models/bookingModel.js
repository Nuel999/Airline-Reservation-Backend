// ============================
//  BOOKING MODEL
// ============================

import { pool } from "../config/db.js";

// ---------------------------------------------
//  Create a booking
// ---------------------------------------------
export const createBookingRecord = async (user_id, flight_id, seat_number) => {
  const query = `
    INSERT INTO bookings (user_id, flight_id, seat_number)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const result = await pool.query(query, [user_id, flight_id, seat_number]);
  return result.rows[0];
};

// ---------------------------------------------
//  Get all bookings
// ---------------------------------------------
export const getAllBookingRecords = async () => {
  const query = `
    SELECT 
      b.id, 
      u.full_name AS passenger_name,
      f.flight_number,
      f.origin,
      f.destination,
      b.seat_number,
      b.created_at
    FROM bookings b
    JOIN users u ON b.user_id = u.id
    JOIN flights f ON b.flight_id = f.id
    ORDER BY b.created_at DESC;
  `;
  const result = await pool.query(query);
  return result.rows;
};

// ---------------------------------------------
//  Get bookings for a specific user
// ---------------------------------------------
export const getUserBookingRecords = async (user_id) => {
  const query = `
    SELECT 
      b.id,
      f.flight_number,
      f.origin,
      f.destination,
      b.seat_number,
      b.created_at
    FROM bookings b
    JOIN flights f ON b.flight_id = f.id
    WHERE b.user_id = $1
    ORDER BY b.created_at DESC;
  `;
  const result = await pool.query(query, [user_id]);
  return result.rows;
};

// ---------------------------------------------
//  Delete (cancel) booking
// ---------------------------------------------
export const deleteBookingRecord = async (booking_id, user_id) => {
  const query = `
    DELETE FROM bookings
    WHERE id = $1 AND user_id = $2
    RETURNING *;
  `;
  const result = await pool.query(query, [booking_id, user_id]);
  return result.rows[0];
};
