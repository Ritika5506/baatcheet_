const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

// Initialize Express app
const app = express();

// ================== MIDDLEWARE ==================
app.use(cors());
app.use(express.json());

// ================== DATABASE ==================
// connectDB()
//   .then(() => {
//     console.log("✅ MongoDB connected");
//   })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
  });

// ================== ROUTES ==================
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));

// Root route (important for Vercel test)
app.get("/", (req, res) => {
  res.send("Backend is running successfully 🚀");
});

// ================== EXPORT APP ==================
// ❌ DO NOT use app.listen()
// Vercel will handle the server
module.exports = app;
