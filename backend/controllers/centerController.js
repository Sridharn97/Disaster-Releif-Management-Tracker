const ReliefCenter = require("../models/ReliefCenter");
const asyncHandler = require("../utils/asyncHandler");

const getCenters = asyncHandler(async (req, res) => {
  const centers = await ReliefCenter.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: centers.length,
    data: centers
  });
});

const createCenter = asyncHandler(async (req, res) => {
  console.log("Incoming body:", req.body);
  const { name, latitude, longitude, contactPerson, phone, locationName } = req.body;

  if (!name || latitude === undefined || longitude === undefined || !contactPerson) {
    const error = new Error(
      "Name, latitude, longitude, and contact person are required"
    );
    error.statusCode = 400;
    throw error;
  }

  const center = await ReliefCenter.create({
    name,
    latitude,
    longitude,
    contactPerson,
    phone,
    locationName
  });

  res.status(201).json({
    success: true,
    message: "Relief center created successfully",
    data: center
  });
});

const updateCenter = asyncHandler(async (req, res) => {
  const { name, latitude, longitude, contactPerson, phone, locationName } = req.body;
  const updatePayload = {
    name,
    latitude,
    longitude,
    contactPerson,
    phone,
    locationName
  };

  Object.keys(updatePayload).forEach((key) => {
    if (updatePayload[key] === undefined) {
      delete updatePayload[key];
    }
  });

  const center = await ReliefCenter.findByIdAndUpdate(req.params.id, updatePayload, {
    new: true,
    runValidators: true
  });

  if (!center) {
    const error = new Error("Relief center not found");
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json({
    success: true,
    message: "Relief center updated successfully",
    data: center
  });
});

module.exports = {
  getCenters,
  createCenter,
  updateCenter
};
