import express from "express";
import mongoose from "mongoose";
import mongoSanitize from "express-mongo-sanitize";
import "dotenv/config";
import logger from "./middleware/logger.js";
import errorHandler from "./middleware/errorHandler.js";
import authController from "./controllers/authController.js";
import songController from "./controllers/songController.js";
import cors from "cors";

const app = express();

// Configure CORS
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? [
          "https://musicfy-clone-client.netlify.app",
          "https://67ec4cffad65018cea18c756--musicfy-clone-client.netlify.app",
        ]
      : ["http://localhost:3000", "http://localhost:5173"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(mongoSanitize());
app.use(logger);

// Mount controllers with proper paths
app.use("/auth", authController);
app.use("/api/songs", songController);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Access the API at http://localhost:${PORT}`);
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (err) => {
      console.error("UNHANDLED REJECTION! 💥 Shutting down...");
      console.error(err.name, err.message);
      server.close(() => {
        process.exit(1);
      });
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
  });
