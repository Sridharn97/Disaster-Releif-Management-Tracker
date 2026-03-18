const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"]
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"]
    },
    role: {
      type: String,
      enum: ["admin", "volunteer"],
      default: "volunteer"
    },
    phone: {
      type: String,
      trim: true,
      default: ""
    },
    age: {
      type: Number,
      min: 0,
      default: null
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", "Prefer not to say", ""],
      default: ""
    },
    maritalStatus: {
      type: String,
      enum: ["Single", "Married", "Divorced", "Widowed", "Prefer not to say", ""],
      default: ""
    },
    address: {
      addressLine1: {
        type: String,
        trim: true,
        default: ""
      },
      addressLine2: {
        type: String,
        trim: true,
        default: ""
      },
      city: {
        type: String,
        trim: true,
        default: ""
      },
      state: {
        type: String,
        trim: true,
        default: ""
      },
      postalCode: {
        type: String,
        trim: true,
        default: ""
      },
      country: {
        type: String,
        trim: true,
        default: ""
      }
    },
    idType: {
      type: String,
      enum: ["Aadhar", "Passport", "Driving License", ""],
      default: ""
    },
    idNumber: {
      type: String,
      trim: true,
      default: ""
    },
    idDocumentUrl: {
      type: String,
      trim: true,
      default: ""
    },
    emergencyContactName: {
      type: String,
      trim: true,
      default: ""
    },
    emergencyContactPhone: {
      type: String,
      trim: true,
      default: ""
    },
    emergencyRelation: {
      type: String,
      trim: true,
      default: ""
    },
    skills: {
      type: [String],
      default: []
    },
    experienceLevel: {
      type: String,
      enum: ["Beginner", "Intermediate", "Experienced", ""],
      default: ""
    },
    availability: {
      type: String,
      enum: ["available", "unavailable"],
      default: "available"
    },
    assignedLocation: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    assignedType: {
      type: String,
      enum: ["reliefCenter", "disasterZone", "none", null],
      default: "none"
    },
    assignedLocationName: {
      type: String,
      trim: true,
      default: ""
    },
    status: {
      type: String,
      enum: ["available", "unavailable", "assigned", "unassigned"],
      default: "available"
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

userSchema.pre("save", async function savePassword(next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function matchPassword(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toJSON = function toJSON() {
  const userObject = this.toObject();
  userObject.assignmentId = userObject.assignedLocation || null;
  userObject.address = userObject.address || {
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: ""
  };
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model("User", userSchema);
