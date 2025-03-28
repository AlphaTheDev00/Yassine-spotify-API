import express from 'express';
import mongoose from 'mongoose';
import mongoSanitize from 'express-mongo-sanitize';
import dotenv from 'dotenv';
import cors from 'cors';
import serverless from 'serverless-http';

// Load environment variables
dotenv.config();

// Import routes
import authController from '../controllers/authController.js';
import songController from '../controllers/songController.js';
import likedSongsRoutes from '../routes/likedSongsRoutes.js';
import playlistsRoutes from '../routes/playlistsRoutes.js';

// Import middleware
import logger from '../middleware/logger.js';
import errorHandler from '../middleware/errorHandler.js';

// Initialize Express app
const app = express();

// Middleware
app.use(
  cors({
    origin: [
      "https://spotify-clone-yasthedev.netlify.app", // Production client URL
      "http://localhost:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
      "http://localhost:4173", // Vite preview
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);
app.use(express.json());
app.use(mongoSanitize());
app.use(logger);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB Atlas");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
  });

// Routes
app.use("/.netlify/functions/api", authController);
app.use("/.netlify/functions/api", songController);
app.use("/.netlify/functions/api/api/liked-songs", likedSongsRoutes);
app.use("/.netlify/functions/api/api/playlists", playlistsRoutes);

// Test route
app.get("/.netlify/functions/api/api/test", (req, res) => {
  res.json({ message: "API server is running correctly" });
});

// Error handling middleware
app.use(errorHandler);

// Export the serverless function
export const handler = serverless(app);
