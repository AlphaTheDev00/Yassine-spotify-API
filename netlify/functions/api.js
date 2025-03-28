import express from "express";
import mongoose from "mongoose";
import mongoSanitize from "express-mongo-sanitize";
import "dotenv/config";
import logger from "../../middleware/logger.js";
import errorHandler from "../../middleware/errorHandler.js";
import authController from "../../controllers/authController.js";
import songController from "../../controllers/songController.js";
import likedSongsRoutes from "../../routes/likedSongsRoutes.js";
import playlistsRoutes from "../../routes/playlistsRoutes.js";
import cors from "cors";
import serverless from "serverless-http";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

const app = express();

// Security headers
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
  message: "Too many requests from this IP, please try again later.",
});

// Apply rate limiting to all routes
app.use(limiter);

// CORS configuration
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? ["https://your-frontend-domain.com"] // Replace with your actual frontend domain
    : ["*"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(mongoSanitize());
app.use(logger);

app.use("/.netlify/functions/api", authController);
app.use("/.netlify/functions/api", songController);
app.use("/.netlify/functions/api/api/liked-songs", likedSongsRoutes);
app.use("/.netlify/functions/api/api/playlists", playlistsRoutes);

app.get("/.netlify/functions/api/api/test", (req, res) => {
  res.json({ message: "API server is running correctly" });
});

app.use(errorHandler);

const startServers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("🔒 Database connection established");
  } catch (error) {
    console.log(error);
  }
};

startServers();

export const handler = serverless(app);
