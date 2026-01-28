✈️ SkyFlow: Airline Reservation System
SkyFlow is a high-performance, transactional backend system built to manage flight schedules, real-time seat inventory, and passenger bookings. It features a professional-grade database architecture that prevents overbooking and provides deep business analytics.

🔗 Live Links
Backend API: https://skyflow-api.onrender.com (Replace with your link)

API Documentation: [Postman Collection Link] (Replace with your link)

🛠 Tech Stack
Backend
Node.js & Express.js (Server Framework)

PostgreSQL (Relational Database)

JWT Authentication (Secure Access)

Joi Validation (Schema Protection)

Crypto (Unique PNR Generation)

Render (Deployment)

Database Tools
pgAdmin 4 (Database Management)

SQL Transactions (Atomic Booking Logic)

📦 Backend Features
✅ User Auth: Secure Registration & Login with hashed passwords and JWT.

✈️ Flight Search: Advanced filtering by origin, destination, and date with Pagination.

🔒 Transactional Bookings: Prevents overbooking using row-level locking (FOR UPDATE).

🆔 PNR Generation: Automatic 6-character unique identifier for every ticket.

📉 Inventory Logic: Real-time subtraction and restoration of available_seats.

❌ Soft Cancellation: Bookings are marked "cancelled" instead of deleted to maintain audit trails.

📊 Admin Stats: Aggregate SQL queries for Total Revenue and Popular Routes.

🛡️ DB Safety: Database-level constraints to prevent negative seat counts.


📁 Project Structure
├── src/
│   ├── config/             # Database configuration (db.js)
│   ├── controllers/        # Business logic (Auth, Booking, Flight)
│   ├── middleware/         # Auth verification & Protected routes
│   ├── models/             # SQL Table schemas & tableInit.js
│   ├── routes/             # API Route definitions
│   ├── utils/              # Helper functions (JWT, unified responses)
│   ├── validators/         # Joi request validation schemas
│   └── app.js              # Express app configuration
├── .env                    # Environment variables (DB credentials, JWT secret)
├── .gitignore              # Files excluded from Git
├── eslint.config.js        # Linting rules
├── package.json            # Dependencies & scripts
├── README.md               # Project documentation
└── server.js               # Entry point - starts the server

📌 Technical Notes
Concurrency: Uses Pessimistic Locking to handle multiple users booking the same seat at once.

Data Integrity: Uses CASCADE and FOREIGN KEY constraints to link Users, Flights, and Bookings.

Search Optimization: Uses ILIKE for case-insensitive route searching.

👨‍💻 Author
Built by [Your Name] Dedicated to building scalable, reliable backend infrastructures.

Feel free to fork, clone, and contribute!