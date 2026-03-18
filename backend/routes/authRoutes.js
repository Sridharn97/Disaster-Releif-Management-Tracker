const express = require("express");
const {
  signup,
  login,
  getProfile,
  updateProfile
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/profile", protect, getProfile);
router.patch("/profile", protect, updateProfile);

module.exports = router;
