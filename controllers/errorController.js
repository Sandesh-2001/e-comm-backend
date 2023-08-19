const errorHandler = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.message = error.message || "error";
  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    stackTrace: error.stack,
    error: error,
  });
  next();
};

module.exports = errorHandler;
