import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import serverless from "serverless-http";
import dotenv from "dotenv";
dotenv.config();

// Import Song model
import Song from "../../Models/Song.js";

const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    "https://musicfy-clone.netlify.app",
    "https://musicfy-clone-client.netlify.app",
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

// Health check endpoint
app.get("/.netlify/functions/api/health", (req, res) => {
  console.log("Health check endpoint hit");
  res.json({ 
    status: "healthy",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    mongoConnection: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

// Test endpoint
app.get("/test", (req, res) => {
  console.log("Test endpoint hit");
  res.json({ data: { message: "API is working correctly" } });
});

// Test endpoint with Netlify path
app.get("/.netlify/functions/api/test", (req, res) => {
  console.log("Test endpoint hit with Netlify path");
  res.json({ data: { message: "API is working correctly" } });
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
    res.json({ data: songs });
  } catch (error) {
    console.error("Error fetching songs:", error);
    res.status(500).json({ data: null, message: error.message });
  }
});

// Songs endpoint with Netlify path
app.get("/.netlify/functions/api/songs", async (req, res) => {
  console.log("Songs endpoint hit with Netlify path");
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      console.log("MongoDB not connected, returning fallback data");
      return res.json({ 
        data: [
          {
            _id: "fallback-song-1",
            title: "Fallback Song 1",
            artist: "API Demo",
            duration: 180,
            user_id: {
              username: "demo_user",
              profileImage: "https://via.placeholder.com/150"
            }
          },
          {
            _id: "fallback-song-2",
            title: "Fallback Song 2",
            artist: "API Demo",
            duration: 210,
            user_id: {
              username: "demo_user",
              profileImage: "https://via.placeholder.com/150"
            }
          }
        ],
        message: "Fallback data: MongoDB connection not available"
      });
    }

    // Get all songs from MongoDB
    const songs = await Song.find()
      .populate("user_id", "username profileImage")
      .sort({ createdAt: -1 });

    console.log(`Found ${songs.length} songs`);
    res.json({ data: songs });
  } catch (error) {
    console.error("Error fetching songs:", error.message);
    res.status(500).json({ 
      data: null, 
      message: `Error fetching songs: ${error.message}`,
      env: {
        mongoUri: process.env.MONGODB_URI ? "Set" : "Not set",
        nodeEnv: process.env.NODE_ENV || "Not set"
      }
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
      data: {
        user: {
          username: req.body.username,
          email: req.body.email,
          // Don't send back the password!
        },
      },
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      data: null,
      message: error.message,
    });
  }
});

app.post("/auth/login", async (req, res) => {
  console.log("Login endpoint hit with credentials:", req.body);
  try {
    // Here you'd normally validate credentials against the database
    // For testing purposes, we'll just return a success response with a test token
    res.json({
      data: {
        user: {
          username: req.body.email.split("@")[0],
          email: req.body.email,
        },
        token: "test_token_for_development",
      },
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(401).json({
      data: null,
      message: "Invalid credentials",
    });
  }
});

app.post("/.netlify/functions/api/auth/register", async (req, res) => {
  console.log("Register endpoint hit with data:", req.body);
  try {
    // Here you'd normally create a user in the database
    // For testing purposes, we'll just return a success response
    res.status(201).json({
      data: {
        user: {
          username: req.body.username,
          email: req.body.email,
          // Don't send back the password!
        },
      },
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      data: null,
      message: error.message,
    });
  }
});

app.post("/.netlify/functions/api/auth/login", async (req, res) => {
  console.log("Login endpoint hit with credentials:", req.body);
  try {
    // Here you'd normally validate credentials against the database
    // For testing purposes, we'll just return a success response with a test token
    res.json({
      data: {
        user: {
          username: req.body.email.split("@")[0],
          email: req.body.email,
        },
        token: "test_token_for_development",
      },
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(401).json({
      data: null,
      message: "Invalid credentials",
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
    console.log("Attempting to connect to MongoDB with URI:", 
      process.env.MONGODB_URI ? "URI exists" : "URI is missing");
    
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is not set");
    }
    
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
    console.error("MongoDB connection error:", error.message);
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
              event.headers.origin || "https://musicfy-clone.netlify.app",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Credentials": "true",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: null,
            message: "Database connection failed",
          }),
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
          event.headers.origin || "https://musicfy-clone.netlify.app",
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
          event.headers.origin || "https://musicfy-clone-client.netlify.app",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true",
      },
    };
  } catch (error) {
    console.error("Error handling request:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin":
          event.headers.origin || "https://musicfy-clone-client.netlify.app",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: null,
        message: error.message,
      }),
    };
  }
};

export { handler };
