const Disaster = require("../models/Disaster");
const asyncHandler = require("../utils/asyncHandler");

const getDisasters = asyncHandler(async (req, res) => {
  const disasters = await Disaster.find()
    .populate("reportedBy", "name email role")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: disasters.length,
    data: disasters
  });
});

const getDisasterById = asyncHandler(async (req, res) => {
  const disaster = await Disaster.findById(req.params.id)
    .populate("reportedBy", "name email role");

  if (!disaster) {
    const error = new Error("Disaster not found");
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json({
    success: true,
    data: disaster
  });
});

const createDisaster = asyncHandler(async (req, res) => {
  const { type, latitude, longitude, severity, description, locationName } = req.body;
  const parsedLatitude = Number(latitude);
  const parsedLongitude = Number(longitude);

  if (
    !type ||
    !Number.isFinite(parsedLatitude) ||
    !Number.isFinite(parsedLongitude) ||
    !severity
  ) {
    const error = new Error(
      "Type, valid latitude, valid longitude, and severity are required"
    );
    error.statusCode = 400;
    throw error;
  }

  const disaster = await Disaster.create({
    type,
    latitude: parsedLatitude,
    longitude: parsedLongitude,
    severity,
    description,
    locationName,
    reportedBy: req.user?._id || null,
    status: "active"
  });

  res.status(201).json({
    success: true,
    message: "Disaster created successfully",
    data: await disaster.populate("reportedBy", "name email role")
  });
});

const updateDisaster = asyncHandler(async (req, res) => {
  const updatePayload = { ...req.body };

  if (updatePayload.latitude !== undefined) {
    const parsedLatitude = Number(updatePayload.latitude);

    if (!Number.isFinite(parsedLatitude)) {
      const error = new Error("Valid latitude is required");
      error.statusCode = 400;
      throw error;
    }

    updatePayload.latitude = parsedLatitude;
  }

  if (updatePayload.longitude !== undefined) {
    const parsedLongitude = Number(updatePayload.longitude);

    if (!Number.isFinite(parsedLongitude)) {
      const error = new Error("Valid longitude is required");
      error.statusCode = 400;
      throw error;
    }

    updatePayload.longitude = parsedLongitude;
  }

  const disaster = await Disaster.findByIdAndUpdate(req.params.id, updatePayload, {
    new: true,
    runValidators: true
  }).populate("reportedBy", "name email role");

  if (!disaster) {
    const error = new Error("Disaster not found");
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json({
    success: true,
    message: "Disaster updated successfully",
    data: disaster
  });
});

const deleteDisaster = asyncHandler(async (req, res) => {
  const disaster = await Disaster.findById(req.params.id);

  if (!disaster) {
    const error = new Error("Disaster not found");
    error.statusCode = 404;
    throw error;
  }

  await disaster.deleteOne();

  res.status(200).json({
    success: true,
    message: "Disaster deleted successfully"
  });
});

module.exports = {
  getDisasters,
  getDisasterById,
  createDisaster,
  updateDisaster,
  deleteDisaster
};
