const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const generateToken = require("../utils/generateToken");

const signup = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  if (!name || !email || !password) {
    const error = new Error("Name, email, and password are required");
    error.statusCode = 400;
    throw error;
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });

  if (existingUser) {
    const error = new Error("User with this email already exists");
    error.statusCode = 409;
    throw error;
  }

  const selectedRole = role || "volunteer";

  if (!["admin", "volunteer"].includes(selectedRole)) {
    const error = new Error("Please select a valid role");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: selectedRole,
    availability: "available",
    assignedType: "none",
    address: {
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: ""
    }
  });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    token: generateToken(user._id),
    user
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    const error = new Error("Email and password are required");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user || !(await user.matchPassword(password))) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  res.status(200).json({
    success: true,
    message: "Login successful",
    token: generateToken(user._id),
    user
  });
});

const getProfile = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const {
    name,
    phone,
    age,
    gender,
    maritalStatus,
    address,
    idType,
    idNumber,
    idDocumentUrl,
    emergencyContactName,
    emergencyContactPhone,
    emergencyRelation,
    skills,
    experienceLevel
  } = req.body;

  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (age !== undefined) user.age = age === "" || age === null ? null : Number(age);
  if (gender !== undefined) user.gender = gender;
  if (maritalStatus !== undefined) user.maritalStatus = maritalStatus;
  if (idType !== undefined) user.idType = idType;
  if (idNumber !== undefined) user.idNumber = idNumber;
  if (idDocumentUrl !== undefined) user.idDocumentUrl = idDocumentUrl;
  if (emergencyContactName !== undefined) user.emergencyContactName = emergencyContactName;
  if (emergencyContactPhone !== undefined) user.emergencyContactPhone = emergencyContactPhone;
  if (emergencyRelation !== undefined) user.emergencyRelation = emergencyRelation;
  if (experienceLevel !== undefined) user.experienceLevel = experienceLevel;
  if (skills !== undefined) {
    user.skills = Array.isArray(skills)
      ? skills.map((skill) => String(skill).trim()).filter(Boolean)
      : [];
  }

  if (address) {
    user.address = {
      addressLine1: address.addressLine1 ?? user.address?.addressLine1 ?? "",
      addressLine2: address.addressLine2 ?? user.address?.addressLine2 ?? "",
      city: address.city ?? user.address?.city ?? "",
      state: address.state ?? user.address?.state ?? "",
      postalCode: address.postalCode ?? user.address?.postalCode ?? "",
      country: address.country ?? user.address?.country ?? ""
    };
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: user.toJSON()
  });
});

module.exports = {
  signup,
  login,
  getProfile,
  updateProfile
};
