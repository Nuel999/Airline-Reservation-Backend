// ============================
//  FLIGHT MODEL
// ============================

import { pool } from "../config/db.js";

// ---------------------------------------------
//  Create a new flight
// ---------------------------------------------
export const createFlight = async ({
  flight_number,
  origin,
  destination,
  departure_time,
  arrival_time,
  total_seats,
}) => {
  const query = `
    INSERT INTO flights (
      flight_number, origin, destination,
      departure_time, arrival_time, total_seats
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;
  const values = [
    flight_number,
    origin,
    destination,
    departure_time,
    arrival_time,
    total_seats,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

// ---------------------------------------------
//  Get all flights
// ---------------------------------------------
export const getAllFlights = async () => {
  const query = `SELECT * FROM flights ORDER BY departure_time ASC;`;
  const result = await pool.query(query);
  return result.rows;
};

// ---------------------------------------------
//  Get flight by ID
// ---------------------------------------------
export const getFlightById = async (id) => {
  const query = `SELECT * FROM flights WHERE id = $1;`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// ---------------------------------------------
//  Delete flight
// ---------------------------------------------
export const deleteFlight = async (id) => {
  const query = `DELETE FROM flights WHERE id = $1 RETURNING *;`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};
