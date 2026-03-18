const User = require("../models/User");
const ReliefCenter = require("../models/ReliefCenter");
const Disaster = require("../models/Disaster");
const asyncHandler = require("../utils/asyncHandler");

const getVolunteers = asyncHandler(async (req, res) => {
  const volunteers = await User.find({ role: "volunteer" })
    .sort({ createdAt: -1 })
    .select("-password");

  res.status(200).json({
    success: true,
    count: volunteers.length,
    data: volunteers
  });
});

const updateMyStatus = asyncHandler(async (req, res) => {
  const { status, assignedType, assignmentId } = req.body;

  if (!["available", "unavailable", "unassigned"].includes(status)) {
    const error = new Error("status must be available, unavailable, or unassigned");
    error.statusCode = 400;
    throw error;
  }

  const volunteer = await User.findOne({ _id: req.user._id, role: "volunteer" });

  if (!volunteer) {
    const error = new Error("Volunteer not found");
    error.statusCode = 404;
    throw error;
  }

  if (status === "unassigned") {
    if (assignedType !== undefined && assignedType !== "none") {
      const error = new Error("assignedType must be none when completing an assignment");
      error.statusCode = 400;
      throw error;
    }

    if (assignmentId !== undefined && assignmentId !== null) {
      const error = new Error("assignmentId must be null when completing an assignment");
      error.statusCode = 400;
      throw error;
    }

    volunteer.assignedLocation = null;
    volunteer.assignedType = "none";
    volunteer.assignedLocationName = "";
    volunteer.status = "unassigned";
    volunteer.availability = "available";
    await volunteer.save();

    res.status(200).json({
      success: true,
      message: "Assignment completed successfully",
      data: volunteer.toJSON()
    });
    return;
  }

  if (volunteer.status === "assigned") {
    const error = new Error("Assigned volunteers cannot change availability");
    error.statusCode = 409;
    throw error;
  }

  volunteer.status = status;
  volunteer.availability = status;
  await volunteer.save();

  res.status(200).json({
    success: true,
    message: "Volunteer availability updated successfully",
    data: volunteer.toJSON()
  });
});

const assignVolunteer = asyncHandler(async (req, res) => {
  const { assignedLocation, assignedType } = req.body;

  if (!assignedLocation || !assignedType) {
    const error = new Error("assignedLocation and assignedType are required");
    error.statusCode = 400;
    throw error;
  }

  if (!["reliefCenter", "disasterZone"].includes(assignedType)) {
    const error = new Error("assignedType must be reliefCenter or disasterZone");
    error.statusCode = 400;
    throw error;
  }

  let target;

  if (assignedType === "reliefCenter") {
    target = await ReliefCenter.findById(assignedLocation);
  } else {
    target = await Disaster.findById(assignedLocation);
  }

  if (!target) {
    const error = new Error("Assigned location not found");
    error.statusCode = 404;
    throw error;
  }

  const volunteer = await User.findOneAndUpdate(
    { _id: req.params.id, role: "volunteer" },
    {
      assignedLocation,
      assignedType,
      assignedLocationName: target.locationName || target.location || target.name || target.type,
      status: "assigned",
      availability: "available"
    },
    {
      new: true,
      runValidators: true
    }
  ).select("-password");

  if (!volunteer) {
    const error = new Error("Volunteer not found");
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json({
    success: true,
    message: "Volunteer assigned successfully",
    data: volunteer
  });
});

module.exports = {
  getVolunteers,
  updateMyStatus,
  assignVolunteer
};
