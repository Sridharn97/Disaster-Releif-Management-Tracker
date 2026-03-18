const Dispatch = require("../models/Dispatch");
const InventorySpace = require("../models/InventorySpace");
const ReliefCenter = require("../models/ReliefCenter");
const Disaster = require("../models/Disaster");
const asyncHandler = require("../utils/asyncHandler");

const getDispatches = asyncHandler(async (req, res) => {
  const dispatches = await Dispatch.find()
    .populate("fromInventorySpace", "name locationName latitude longitude")
    .populate("dispatchedBy", "name email role")
    .sort({ dispatchedAt: -1 });

  res.status(200).json({
    success: true,
    count: dispatches.length,
    data: dispatches
  });
});

const createDispatch = asyncHandler(async (req, res) => {
  const { fromInventorySpace, toType, toId, resources } = req.body;

  if (!fromInventorySpace || !toType || !toId || !Array.isArray(resources) || resources.length === 0) {
    const error = new Error("fromInventorySpace, toType, toId, and resources are required");
    error.statusCode = 400;
    throw error;
  }

  if (!["reliefCenter", "disasterZone"].includes(toType)) {
    const error = new Error("toType must be reliefCenter or disasterZone");
    error.statusCode = 400;
    throw error;
  }

  const inventorySpace = await InventorySpace.findById(fromInventorySpace);

  if (!inventorySpace) {
    const error = new Error("Inventory space not found");
    error.statusCode = 404;
    throw error;
  }

  const destination = toType === "reliefCenter"
    ? await ReliefCenter.findById(toId)
    : await Disaster.findById(toId);

  if (!destination) {
    const error = new Error("Dispatch destination not found");
    error.statusCode = 404;
    throw error;
  }

  for (const resource of resources) {
    const parsedQuantity = Number(resource.quantity);
    const storedResource = inventorySpace.resources.find(
      (entry) => entry.itemName === resource.itemName
    );

    if (!storedResource || !Number.isFinite(parsedQuantity) || storedResource.quantity < parsedQuantity) {
      const error = new Error(`Insufficient stock for ${resource.itemName}`);
      error.statusCode = 400;
      throw error;
    }
  }

  for (const resource of resources) {
    const parsedQuantity = Number(resource.quantity);
    const storedResource = inventorySpace.resources.find(
      (entry) => entry.itemName === resource.itemName
    );

    storedResource.quantity -= parsedQuantity;
  }

  await inventorySpace.save();

  const dispatch = await Dispatch.create({
    fromInventorySpace,
    toType,
    toId,
    toName: destination.name || destination.locationName || destination.location || destination.type,
    resources: resources.map((resource) => ({
      itemName: resource.itemName,
      quantity: Number(resource.quantity)
    })),
    dispatchedBy: req.user?._id || null,
    status: "in-transit"
  });

  res.status(201).json({
    success: true,
    message: "Dispatch created successfully",
    data: await Dispatch.findById(dispatch._id)
      .populate("fromInventorySpace", "name locationName latitude longitude")
      .populate("dispatchedBy", "name email role")
  });
});

const updateDispatch = asyncHandler(async (req, res) => {
  const dispatch = await Dispatch.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  )
    .populate("fromInventorySpace", "name locationName latitude longitude")
    .populate("dispatchedBy", "name email role");

  if (!dispatch) {
    const error = new Error("Dispatch not found");
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json({
    success: true,
    message: "Dispatch updated successfully",
    data: dispatch
  });
});

module.exports = {
  getDispatches,
  createDispatch,
  updateDispatch
};
