const express = require("express");
const {
  createDispatch,
  getDispatches,
  updateDispatch
} = require("../controllers/dispatchController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/")
  .get(protect, getDispatches)
  .post(protect, authorize("admin"), createDispatch);

router.route("/:id")
  .patch(protect, authorize("admin"), updateDispatch);

module.exports = router;
