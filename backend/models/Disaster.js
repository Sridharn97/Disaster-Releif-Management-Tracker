const mongoose = require("mongoose");

const disasterSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, "Disaster type is required"],
      trim: true
    },
    locationName: {
      type: String,
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
    severity: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      required: [true, "Severity is required"]
    },
    description: {
      type: String,
      trim: true,
      default: ""
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    status: {
      type: String,
      enum: ["active", "resolved"],
      default: "active"
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

disasterSchema.virtual("location").get(function location() {
  return this.locationName || `${this.latitude}, ${this.longitude}`;
});

module.exports = mongoose.model("Disaster", disasterSchema);
