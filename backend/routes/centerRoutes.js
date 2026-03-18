const express = require("express");
const {
  getCenters,
  createCenter,
  updateCenter
} = require("../controllers/centerController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/")
  .get(getCenters)
  .post(protect, authorize("admin"), createCenter);

router.route("/:id")
  .put(protect, authorize("admin"), updateCenter);

module.exports = router;
