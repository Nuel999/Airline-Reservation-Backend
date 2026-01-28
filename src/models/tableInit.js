// ============================
//  DATABASE TABLE INITIALIZATION
// ============================

import { pool } from "../config/db.js";

// ---------------------------------------------
// Create "users" table
// ---------------------------------------------
export const createUserTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      full_name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'passenger',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(query);
  console.log("✅ Users table ready");
};

// ---------------------------------------------
// Create "flights" table
// ---------------------------------------------
export const createFlightTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS flights (
      id SERIAL PRIMARY KEY,
      flight_number VARCHAR(50) UNIQUE NOT NULL,
      origin VARCHAR(100) NOT NULL,
      destination VARCHAR(100) NOT NULL,
      departure_time TIMESTAMP NOT NULL,
      arrival_time TIMESTAMP NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(query);
  console.log("✅ Flights table ready");
};

// ---------------------------------------------
// Create "bookings" table
// ---------------------------------------------
export const createBookingTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      flight_id INT REFERENCES flights(id) ON DELETE CASCADE,
      booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status VARCHAR(50) DEFAULT 'confirmed'
    );
  `;
  await pool.query(query);
  console.log("✅ Bookings table ready");
};
