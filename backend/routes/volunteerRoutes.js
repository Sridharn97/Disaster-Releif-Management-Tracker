const express = require("express");
const {
  getVolunteers,
  updateMyStatus,
  assignVolunteer
} = require("../controllers/volunteerController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/")
  .get(protect, authorize("admin"), getVolunteers);

router.route("/me/status")
  .patch(protect, authorize("volunteer"), updateMyStatus);

router.route("/:id/assign")
  .patch(protect, authorize("admin"), assignVolunteer);

module.exports = router;
