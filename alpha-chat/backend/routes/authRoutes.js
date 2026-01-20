const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// TEST ENDPOINT
router.get("/test", (req, res) => {
  res.json({ message: "✅ Backend is working!" });
});

// SIGNUP
router.post("/signup", async (req, res) => {
  const { name, email, mobile, password } = req.body;
  try {
    // Check if email or mobile already exists
    const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
    if (existingUser) return res.status(400).json({ message: "Email or mobile already in use" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, email, mobile, password: hashedPassword });
    await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.status(201).json({ success: true, user: newUser, token });
  } catch (error) {
    res.status(500).json({ message: "Error creating user" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { emailOrMobile, password } = req.body;
  try {
    const user = await User.findOne({ $or: [{ email: emailOrMobile }, { mobile: emailOrMobile }] });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({ success: true, user, token });
  } catch (error) {
    res.status(500).json({ message: "Login error" });
  }
});

// SOCIAL AUTH - Google, Facebook, LinkedIn
router.post("/social-auth", async (req, res) => {
  console.log("📱 Social Auth Request Received");
  console.log("Body:", req.body);
  const { email, name, provider, providerId, password } = req.body;
  
  try {
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    console.log("🔍 Looking for user with email:", email);
    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      console.log("👤 New user, creating...");
      // Create new user for social auth
      const hashedPassword = await bcrypt.hash(password, 10);
      user = new User({
        name: name || email.split("@")[0],
        email,
        password: hashedPassword,
        provider,
        providerId
      });
      await user.save();
      console.log("✅ User created:", user._id);
      console.log("✅ Password set with bcrypt hashing");
    } else {
      // User already exists
      console.log("⚠️  User already exists with this email");
      return res.status(400).json({ message: "Email is already registered. Please login or use a different email." });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    console.log("🎫 Token generated, sending response");
    res.json({ success: true, user, token });
  } catch (error) {
    console.error("❌ Social auth error:", error);
    if (error.code === 11000) {
      // Duplicate key error
      res.status(400).json({ message: "Email or mobile already in use" });
    } else {
      res.status(500).json({ message: "Social authentication error", error: error.message });
    }
  }
});

module.exports = router;
