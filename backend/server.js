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

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:8080",
  process.env.CLIENT_URL,
  process.env.CORS_ORIGIN
].filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("CORS not allowed for this origin"));
  },
  credentials: true
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
  console.log(`Allowed CORS origins: ${allowedOrigins.join(", ")}`);
});
