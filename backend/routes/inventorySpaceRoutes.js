const express = require("express");
const {
  getInventorySpaces,
  createInventorySpace,
  updateInventorySpace,
  deleteInventorySpace
} = require("../controllers/inventorySpaceController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/")
  .get(protect, getInventorySpaces)
  .post(protect, authorize("admin"), createInventorySpace);

router.route("/:id")
  .put(protect, authorize("admin"), updateInventorySpace)
  .delete(protect, authorize("admin"), deleteInventorySpace);

module.exports = router;
