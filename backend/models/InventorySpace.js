const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: [true, "Resource item name is required"],
      trim: true
    },
    quantity: {
      type: Number,
      required: [true, "Resource quantity is required"],
      min: [0, "Resource quantity cannot be negative"]
    },
    unit: {
      type: String,
      trim: true,
      default: "units"
    }
  },
  { _id: true }
);

const inventorySpaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Inventory space name is required"],
      trim: true
    },
    latitude: {
      type: Number,
      required: [true, "Latitude is required"]
    },
    longitude: {
      type: Number,
      required: [true, "Longitude is required"]
    },
    locationName: {
      type: String,
      trim: true,
      default: ""
    },
    manager: {
      type: String,
      required: [true, "Manager name is required"],
      trim: true
    },
    phone: {
      type: String,
      trim: true,
      default: ""
    },
    resources: {
      type: [resourceSchema],
      default: []
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

inventorySpaceSchema.virtual("location").get(function location() {
  return this.locationName || `${this.latitude}, ${this.longitude}`;
});

module.exports = mongoose.model("InventorySpace", inventorySpaceSchema);
