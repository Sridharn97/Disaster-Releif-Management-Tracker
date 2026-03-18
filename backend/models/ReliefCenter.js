const mongoose = require("mongoose");

const reliefCenterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Center name is required"],
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
    contactPerson: {
      type: String,
      required: [true, "Contact person is required"],
      trim: true
    },
    phone: {
      type: String,
      trim: true,
      default: ""
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

reliefCenterSchema.virtual("location").get(function location() {
  return this.locationName || `${this.latitude}, ${this.longitude}`;
});

module.exports = mongoose.model("ReliefCenter", reliefCenterSchema);
