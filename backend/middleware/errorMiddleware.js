const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || res.statusCode;

  if (!statusCode || statusCode < 400) {
    statusCode = 500;
  }

  if (err.name === "CastError") {
    statusCode = 400;
    err.message = "Invalid resource id";
  }

  if (err.name === "ValidationError") {
    statusCode = 400;
    err.message = Object.values(err.errors)
      .map((value) => value.message)
      .join(", ");
  }

  if (err.code === 11000) {
    statusCode = 409;
    err.message = "Resource already exists";
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || "Server error",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack
  });
};

const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

module.exports = { errorHandler, notFound };
