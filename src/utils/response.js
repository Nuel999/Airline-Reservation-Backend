// ============================
//  RESPONSE HANDLER UTILITY
// ============================

// ✅ Success Response
export const successResponse = (res, statusCode = 200, message = "Success", data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...data,
  });
};

// ❌ Error Response
export const errorResponse = (res, statusCode = 500, message = "Server error", details = null) => {
  const response = {
    success: false,
    message,
  };

  // Optional: attach details (useful in development)
  if (process.env.NODE_ENV !== "production" && details) {
    response.details = details;
  }

  return res.status(statusCode).json(response);
};
