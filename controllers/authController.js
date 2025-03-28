import express from "express";
import User from "../Models/User.js";
import jwt from "jsonwebtoken";

// Create a router
const router = express.Router();

// Register route
router.post("/api/auth/register", async (req, res, next) => {
  try {
    const { email, password, username, isArtist, confirmPassword } = req.body;
    if (!email || !password || !username) {
      return res.status(400).json({ 
        message: "Email, password, and username are required",
        errors: {
          email: !email ? "Email is required" : null,
          password: !password ? "Password is required" : null,
          username: !username ? "Username is required" : null
        }
      });
    }

    // Check if password and confirmPassword match
    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ 
        message: "Passwords do not match",
        errors: {
          confirmPassword: "Passwords do not match"
        }
      });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ 
        message: "Email already exists",
        errors: {
          email: "Email already exists"
        }
      });
    }

    // Check existing username
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(409).json({ 
        message: "Username already exists",
        errors: {
          username: "Username already exists"
        }
      });
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      username,
      isArtist: isArtist !== undefined ? isArtist : false,
    });

    // Create user object without password
    const userWithoutPassword = {
      _id: user._id,
      email: user.email,
      username: user.username,
      isArtist: user.isArtist,
      createdAt: user.createdAt
    };

    // Generate JWT token with user data in a 'user' field
    const token = jwt.sign(
      {
        user: userWithoutPassword
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Return user data and token
    res.status(201).json({
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: "Internal server error",
      errors: {
        error: "Internal server error"
      }
    });
  }
});

// Login route
router.post("/api/auth/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // Validate input
    if (!identifier || !password) {
      return res
        .status(400)
        .json({ 
          message: "Email/Username and password are required",
          errors: {
            identifier: !identifier ? "Email/Username is required" : null,
            password: !password ? "Password is required" : null
          }
        });
    }

    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }]
    });
    
    if (!user) {
      return res.status(401).json({ 
        message: "Invalid credentials",
        errors: {
          identifier: "Invalid credentials"
        }
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: "Invalid credentials",
        errors: {
          password: "Invalid credentials"
        }
      });
    }

    // Create user object without password
    const userWithoutPassword = {
      _id: user._id,
      email: user.email,
      username: user.username,
      isArtist: user.isArtist,
      createdAt: user.createdAt
    };

    // Generate JWT token with user data in a 'user' field
    const token = jwt.sign(
      {
        user: userWithoutPassword
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Return user data and token
    res.status(200).json({
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: "Internal server error",
      errors: {
        error: "Internal server error"
      }
    });
  }
});

// User profile route - protected route to get user data
router.get("/api/auth/user/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ 
        message: "User not found",
        errors: {
          id: "User not found"
        }
      });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: "Internal server error",
      errors: {
        error: "Internal server error"
      }
    });
  }
});

// Export the router as default export
export default router;
