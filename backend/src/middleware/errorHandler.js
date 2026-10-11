/**
 * Global error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Error:', err);

  const statusCode = err.statusCode || (err.code === '42501' ? 403 : 500);
  const message =
    err.message ||
    err.error_description ||
    (typeof err === 'string' ? err : 'Internal Server Error');

  res.status(statusCode).json({
    success: false,
    message,
    ...(err.hint && { hint: err.hint }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * 404 Route Not Found middleware
 */
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found on endpoint: ${req.originalUrl}`,
  });
};
