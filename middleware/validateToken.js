import jwt from "jsonwebtoken";
import User from "../Models/User.js";
import mongoose from "mongoose";

export default async function validateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "No authorization header present",
        timestamp: new Date().toISOString(),
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Invalid authorization header format",
        timestamp: new Date().toISOString(),
      });
    }

    const token = authHeader.replace("Bearer ", "");
    console.log("Verifying token...");

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token payload:", JSON.stringify(payload, null, 2));

    // Extract user ID from the payload
    const userId = payload.id;
    console.log("Extracted user ID:", userId);

    if (!userId) {
      return res.status(401).json({
        message: "User ID not found in token",
        timestamp: new Date().toISOString(),
      });
    }

    // Check if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        message: "Invalid user ID format",
        timestamp: new Date().toISOString(),
      });
    }

    console.log("Looking up user with ID:", userId);
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({
        message: "User not found",
        timestamp: new Date().toISOString(),
      });
    }

    console.log("User found:", {
      id: user._id,
      username: user.username,
      email: user.email,
    });

    // Attach the user object to the request
    req.user = user;
    next();
  } catch (error) {
    console.error("Token validation error:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Invalid token",
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token has expired",
        timestamp: new Date().toISOString(),
      });
    }

    next(error);
  }
}
