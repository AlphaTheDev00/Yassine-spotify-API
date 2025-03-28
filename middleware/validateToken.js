import jwt from "jsonwebtoken";
import User from "../Models/User.js";
import mongoose from "mongoose";

export default async function validateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new Error("No authorization was present on the request");
    }

    if (!authHeader.startsWith("Bearer ")) {
      throw new Error("Invalid header syntax");
    }

    const token = authHeader.replace("Bearer ", "");
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    
    console.log("Token payload:", JSON.stringify(payload, null, 2));
    
    // Extract user ID from the payload, handling both token structures
    let userId = null;
    if (payload.user && payload.user._id) {
      userId = payload.user._id;
      console.log("Found user ID in payload.user._id:", userId);
    } else if (payload.id) {
      userId = payload.id;
      console.log("Found user ID in payload.id:", userId);
    } else {
      console.log("Could not find user ID in payload:", payload);
      throw new Error("User ID not found in token");
    }

    // Check if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log("Invalid MongoDB ObjectId:", userId);
      throw new Error("Invalid user ID format");
    }

    console.log("Looking up user with ID:", userId);
    
    // Try to find the user by ID first
    let user = await User.findById(userId);
    console.log("User found by ID:", user ? "Yes" : "No");

    if (!user) {
      // If user not found by ID, try to find by username or email
      console.log("User not found by ID, trying username/email lookup");
      
      if (payload.user && (payload.user.username || payload.user.email)) {
        const query = { $or: [] };
        
        if (payload.user.username) {
          query.$or.push({ username: payload.user.username });
        }
        
        if (payload.user.email) {
          query.$or.push({ email: payload.user.email });
        }
        
        console.log("Looking up user with query:", JSON.stringify(query));
        user = await User.findOne(query);
        
        if (user) {
          console.log("User found by username/email:", user._id);
          req.user = user;
          next();
          return;
        } else {
          console.log("User not found by username/email either");
        }
      }
      
      throw new Error("Token valid but user not found");
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: "Invalid token" });
  }
}
