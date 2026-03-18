const InventorySpace = require("../models/InventorySpace");
const asyncHandler = require("../utils/asyncHandler");

const getInventorySpaces = asyncHandler(async (req, res) => {
  const inventorySpaces = await InventorySpace.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: inventorySpaces.length,
    data: inventorySpaces
  });
});

const createInventorySpace = asyncHandler(async (req, res) => {
  const { name, latitude, longitude, locationName, manager, phone, resources } = req.body;
  const parsedLatitude = Number(latitude);
  const parsedLongitude = Number(longitude);

  if (!name || !manager || !Number.isFinite(parsedLatitude) || !Number.isFinite(parsedLongitude)) {
    const error = new Error("Name, manager, valid latitude, and valid longitude are required");
    error.statusCode = 400;
    throw error;
  }

  const inventorySpace = await InventorySpace.create({
    name,
    latitude: parsedLatitude,
    longitude: parsedLongitude,
    locationName,
    manager,
    phone,
    resources: Array.isArray(resources) ? resources : []
  });

  res.status(201).json({
    success: true,
    message: "Inventory space created successfully",
    data: inventorySpace
  });
});

const updateInventorySpace = asyncHandler(async (req, res) => {
  const updatePayload = { ...req.body };

  if (updatePayload.latitude !== undefined) {
    updatePayload.latitude = Number(updatePayload.latitude);
  }

  if (updatePayload.longitude !== undefined) {
    updatePayload.longitude = Number(updatePayload.longitude);
  }

  if (
    (updatePayload.latitude !== undefined && !Number.isFinite(updatePayload.latitude)) ||
    (updatePayload.longitude !== undefined && !Number.isFinite(updatePayload.longitude))
  ) {
    const error = new Error("Latitude and longitude must be valid numbers");
    error.statusCode = 400;
    throw error;
  }

  const inventorySpace = await InventorySpace.findByIdAndUpdate(
    req.params.id,
    updatePayload,
    {
      new: true,
      runValidators: true
    }
  );

  if (!inventorySpace) {
    const error = new Error("Inventory space not found");
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json({
    success: true,
    message: "Inventory space updated successfully",
    data: inventorySpace
  });
});

const deleteInventorySpace = asyncHandler(async (req, res) => {
  const inventorySpace = await InventorySpace.findById(req.params.id);

  if (!inventorySpace) {
    const error = new Error("Inventory space not found");
    error.statusCode = 404;
    throw error;
  }

  await inventorySpace.deleteOne();

  res.status(200).json({
    success: true,
    message: "Inventory space deleted successfully"
  });
});

module.exports = {
  getInventorySpaces,
  createInventorySpace,
  updateInventorySpace,
  deleteInventorySpace
};
