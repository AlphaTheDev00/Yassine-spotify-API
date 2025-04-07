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
      return res.status(400).send("Email, password, and username are required");
    }

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).send("Email already exists");
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

    // Return user data and token
    res.status(201).json({
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).send("Internal server error");
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    console.log("Login request body:", req.body);
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.log("Missing email or password");
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    console.log("User found:", user ? "Yes" : "No");

    if (!user) {
      console.log("User not found");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    console.log("Checking password...");
    const isPasswordValid = await user.comparePassword(password);
    console.log("Password valid:", isPasswordValid);

    if (!isPasswordValid) {
      console.log("Invalid password");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    console.log("Generating token...");
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        username: user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    console.log("Login successful");
    // Return user data and token
    res.status(200).json({
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send("Internal server error");
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
