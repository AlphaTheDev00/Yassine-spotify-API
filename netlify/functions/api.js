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
const allowedOrigins = [
  "https://musicfy-clone-client.netlify.app",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://localhost:4173",
];

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
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    maxAge: 600,
  })
);
app.use(express.json());
app.use(mongoSanitize());
app.use(logger);

// Routes
app.use("/", authController);
app.use("/", songController);
app.use("/api/liked-songs", likedSongsRoutes);
app.use("/api/playlists", playlistsRoutes);

app.get("/api/test", (req, res) => {
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
