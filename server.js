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

app.use(cors());
app.use(express.json());
app.use(mongoSanitize());
app.use(logger);

app.use("/", authController);
app.use("/", songController);

app.use(errorHandler);

app.listen(3000, () => {
  console.log("Listening on port 3000");
});

mongoose.connect(process.env.MONGODB_URI);
