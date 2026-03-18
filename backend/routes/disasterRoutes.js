const express = require("express");
const {
  getDisasters,
  getDisasterById,
  createDisaster,
  updateDisaster,
  deleteDisaster
} = require("../controllers/disasterController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/")
  .get(getDisasters)
  .post(createDisaster);

router.route("/:id")
  .get(getDisasterById)
  .put(protect, authorize("admin"), updateDisaster)
  .delete(protect, authorize("admin"), deleteDisaster);

module.exports = router;
