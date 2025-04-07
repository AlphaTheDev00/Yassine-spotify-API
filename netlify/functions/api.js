const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const serverless = require("serverless-http");
require("dotenv").config();

// Import Song model
const Song = require("../../Models/Song");

const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    "https://musicfy-clone-client.netlify.app",
    "https://musicfy-clone.netlify.app",
    "http://localhost:5173",
    "http://localhost:3000",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`Request received: ${req.method} ${req.path}`);
  console.log("Request headers:", req.headers);
  next();
});

// Test endpoint
app.get("/test", (req, res) => {
  console.log("Test endpoint hit");
  res.json({ message: "API is working correctly" });
});

// Songs endpoint
app.get("/songs", async (req, res) => {
  console.log("Songs endpoint hit");
  try {
    // Get all songs from MongoDB
    const songs = await Song.find()
      .populate("user_id", "username profileImage")
      .sort({ createdAt: -1 });

    console.log(`Found ${songs.length} songs`);
    res.json({
      message: "Songs retrieved successfully",
      songs: songs,
    });
  } catch (error) {
    console.error("Error fetching songs:", error);
    res.status(500).json({
      error: "Failed to fetch songs",
      details: error.message,
    });
  }
});

// Auth endpoints
app.post("/auth/register", async (req, res) => {
  console.log("Register endpoint hit with data:", req.body);
  try {
    // Here you'd normally create a user in the database
    // For testing purposes, we'll just return a success response
    res.status(201).json({
      message: "User registered successfully",
      user: {
        username: req.body.username,
        email: req.body.email,
        // Don't send back the password!
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      error: "Failed to register user",
      details: error.message,
    });
  }
});

app.post("/auth/login", async (req, res) => {
  console.log("Login endpoint hit with credentials:", req.body);
  try {
    // Here you'd normally validate credentials against the database
    // For testing purposes, we'll just return a success response with a test token
    res.json({
      message: "Login successful",
      user: {
        username: req.body.email.split("@")[0],
        email: req.body.email,
      },
      token: "test_token_for_development",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(401).json({
      error: "Invalid credentials",
      details: error.message,
    });
  }
});

// MongoDB connection with retry logic
let cachedDb = null;
let isConnecting = false;

const connectDB = async () => {
  if (cachedDb) {
    console.log("Using cached MongoDB connection");
    return cachedDb;
  }

  if (isConnecting) {
    console.log("MongoDB connection in progress, waiting...");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return connectDB();
  }

  isConnecting = true;
  try {
    const db = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("MongoDB connected successfully");
    cachedDb = db;
    isConnecting = false;
    return db;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    isConnecting = false;
    throw error;
  }
};

// Serverless handler
const handler = async (event, context) => {
  console.log("Handler called with event:", {
    path: event.path,
    method: event.httpMethod,
    headers: event.headers,
  });

  // Prevent function from waiting for MongoDB connection to close
  context.callbackWaitsForEmptyEventLoop = false;

  // Connect to MongoDB with retry
  let retries = 3;
  while (retries > 0) {
    try {
      await connectDB();
      break;
    } catch (error) {
      retries--;
      if (retries === 0) {
        console.error("Failed to connect to MongoDB after retries:", error);
        return {
          statusCode: 500,
          headers: {
            "Access-Control-Allow-Origin":
              "https://musicfy-clone-client.netlify.app",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Credentials": "true",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ error: "Database connection failed" }),
        };
      }
      console.log(`Retrying MongoDB connection... (${retries} attempts left)`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // Handle preflight requests
  if (event.httpMethod === "OPTIONS") {
    console.log("Handling OPTIONS request");
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin":
          "https://musicfy-clone-client.netlify.app",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Max-Age": "86400",
      },
    };
  }

  try {
    const serverlessHandler = serverless(app);
    const result = await serverlessHandler(event, context);
    console.log("Handler result:", result);

    return {
      ...result,
      headers: {
        ...result.headers,
        "Access-Control-Allow-Origin":
          "https://musicfy-clone-client.netlify.app",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true",
      },
    };
  } catch (error) {
    console.error("Handler error:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin":
          "https://musicfy-clone-client.netlify.app",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ error: error.message }),
    };
  }
};

module.exports = { handler };
