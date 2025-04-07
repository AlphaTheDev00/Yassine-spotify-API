import express from "express";
import User from "../Models/User.js";
import jwt from "jsonwebtoken";

// Create a router
const router = express.Router();

// Register route
router.post("/register", async (req, res, next) => {
  try {
    console.log("Register request body:", req.body);
    const { email, password, username } = req.body;
    if (!email || !password || !username) {
      return res.status(400).json({
        error: "Email, password, and username are required",
      });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        error: "Email already exists",
      });
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      username,
      isArtist: false,
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        username: user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Return user data and token in the expected format
    res.status(201).json({
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
      },
      token,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
});

// Login route
router.post("/login", async (req, res, next) => {
  try {
    console.log("Login request body:", req.body);
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        username: user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Return user data and token in the expected format
    res.json({
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
      },
      token,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
});

// User profile route - protected route to get user data
router.get("/user/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).send("Internal server error");
  }
});

// Export the router as default export
export default router;
