import express from "express";
import mongoose from "mongoose";
import mongoSanitize from "express-mongo-sanitize";
import dotenv from "dotenv";
import cors from "cors";
import serverless from "serverless-http";

// Load environment variables
dotenv.config();

// Import routes
import authController from "../controllers/authController.js";
import songController from "../controllers/songController.js";
import likedSongsRoutes from "../routes/likedSongsRoutes.js";
import playlistsRoutes from "../routes/playlistsRoutes.js";

// Import middleware
import logger from "../middleware/logger.js";
import errorHandler from "../middleware/errorHandler.js";

// Import Song model
import Song from "../Models/Song.js";

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use(logger);

// CORS configuration
app.use(
  cors({
    origin: true, // Allow all origins in development
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["*"], // Allow all headers
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    maxAge: 600,
  })
);

// Add preflight handling
app.options("*", cors());

// MongoDB connection
let isConnected = false;

const connectToMongoDB = async () => {
  if (isConnected) {
    console.log("Using existing MongoDB connection");
    return;
  }

  try {
    console.log("Connecting to MongoDB...");
    console.log("MongoDB URI:", process.env.MONGODB_URI);

    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined");
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

// MongoDB connection middleware
const withMongoDB = (handler) => async (req, res, next) => {
  try {
    await connectToMongoDB();
    return handler(req, res, next);
  } catch (error) {
    console.error("MongoDB connection error in route:", error);
    return res.status(500).json({
      message: "Database connection error",
      error: error.message,
    });
  }
};

// Router middleware with MongoDB connection
const withMongoDBRouter = (router) => {
  return (req, res, next) => {
    withMongoDB(router)(req, res, next);
  };
};

// Public health check endpoint (no authentication required)
app.get("/api/health", async (req, res) => {
  try {
    await connectToMongoDB();
    res.status(200).json({
      status: "ok",
      message: "API is running",
      mongodbStatus: mongoose.connection.readyState,
      env: {
        mongodbUri: process.env.MONGODB_URI ? "Set" : "Not Set",
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "API health check failed",
      error: error.message,
    });
  }
});

// Mount routes with MongoDB connection middleware
app.use("/api/auth", withMongoDBRouter(authController));
app.use("/api/songs", withMongoDBRouter(songController));
app.use("/api", withMongoDB(likedSongsRoutes));
app.use("/api", withMongoDB(playlistsRoutes));

// Error handling middleware
app.use(errorHandler);

// Export the handler
export const handler = serverless(app);
