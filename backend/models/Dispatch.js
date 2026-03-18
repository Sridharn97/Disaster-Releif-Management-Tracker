const mongoose = require("mongoose");

const dispatchResourceSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: [true, "Dispatched item name is required"],
      trim: true
    },
    quantity: {
      type: Number,
      required: [true, "Dispatched item quantity is required"],
      min: [1, "Dispatched item quantity must be at least 1"]
    }
  },
  { _id: false }
);

const dispatchSchema = new mongoose.Schema(
  {
    fromInventorySpace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventorySpace",
      required: [true, "Source inventory space is required"]
    },
    toType: {
      type: String,
      enum: ["reliefCenter", "disasterZone"],
      required: [true, "Destination type is required"]
    },
    toId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Destination id is required"]
    },
    toName: {
      type: String,
      trim: true,
      default: ""
    },
    resources: {
      type: [dispatchResourceSchema],
      validate: {
        validator(value) {
          return Array.isArray(value) && value.length > 0;
        },
        message: "At least one resource is required for dispatch"
      }
    },
    dispatchedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    status: {
      type: String,
      enum: ["in-transit", "delivered"],
      default: "in-transit"
    }
  },
  {
    timestamps: { createdAt: "dispatchedAt", updatedAt: true }
  }
);

module.exports = mongoose.model("Dispatch", dispatchSchema);
