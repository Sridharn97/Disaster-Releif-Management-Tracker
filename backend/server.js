const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const disasterRoutes = require("./routes/disasterRoutes");
const centerRoutes = require("./routes/centerRoutes");
const inventorySpaceRoutes = require("./routes/inventorySpaceRoutes");
const volunteerRoutes = require("./routes/volunteerRoutes");
const dispatchRoutes = require("./routes/dispatchRoutes");

const { errorHandler, notFound } = require("./middleware/errorMiddleware");

dotenv.config();
connectDB();

const app = express();

const normalizeOrigin = (value) => {
  if (!value) return "";
  return value.trim().replace(/\/+$/, "");
};

const envOrigins = [process.env.CLIENT_URL, process.env.CORS_ORIGIN]
  .filter(Boolean)
  .flatMap((value) => value.split(","))
  .map(normalizeOrigin)
  .filter(Boolean);

const allowedOrigins = new Set(
  [
    "http://localhost:5173",
    "http://localhost:8080",
    "http://localhost:3000",
    ...envOrigins,
  ].map(normalizeOrigin)
);

const vercelDefaultRegex = /^https:\/\/disaster-releif-management-tracker(-[a-z0-9-]+)?\.vercel\.app$/i;
const vercelOriginRegex = process.env.CORS_ORIGIN_REGEX
  ? new RegExp(process.env.CORS_ORIGIN_REGEX, "i")
  : vercelDefaultRegex;

const corsOptions = {
  origin(origin, callback) {
    const normalized = normalizeOrigin(origin);

    if (!normalized) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.has(normalized) || vercelOriginRegex.test(normalized)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS not allowed for origin: ${normalized}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Disaster Relief Resource Tracker API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/disasters", disasterRoutes);
app.use("/api/centers", centerRoutes);
app.use("/api/inventory-spaces", inventorySpaceRoutes);
app.use("/api/volunteers", volunteerRoutes);
app.use("/api/dispatch", dispatchRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Allowed CORS origins: ${Array.from(allowedOrigins).join(", ")}`);
  console.log(`Allowed Vercel origins: ${vercelOriginRegex}`);
});
