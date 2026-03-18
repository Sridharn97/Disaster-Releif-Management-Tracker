const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const error = new Error("Not authorized, token missing");
    error.statusCode = 401;
    throw error;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId).select("-password");

    if (!req.user) {
      const error = new Error("Not authorized, user not found");
      error.statusCode = 401;
      throw error;
    }

    next();
  } catch (error) {
    error.statusCode = 401;
    error.message = "Not authorized, invalid token";
    next(error);
  }
});

const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    const error = new Error("Access denied");
    error.statusCode = 403;
    return next(error);
  }

  next();
};

module.exports = { protect, authorize };
