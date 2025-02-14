import express from "express";
import mongoose from "mongoose";
import mongoSanitize from "express-mongo-sanitize";
import "dotenv/config";
import logger from "../../middleware/logger.js";
import errorHandler from "../../middleware/errorHandler.js";
import authController from "../../controllers/authController.js";
import songController from "../../controllers/songController.js";
import cors from "cors";
import serverless from 'serverless-http'

const app = express();

app.use(cors());
app.use(express.json());
app.use(mongoSanitize());
app.use(logger);

app.use("/", authController);
app.use("/", songController);

app.use(errorHandler);

const port = 3000

const startServers = async () => {
    try {
        // Database Connection
        await mongoose.connect(process.env.MONGODB_URI)

        console.log('🔒 Database connection established')
    } catch (error) {
        console.log(error)
    }
}

startServers()

export const handler = serverless(app)