export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
