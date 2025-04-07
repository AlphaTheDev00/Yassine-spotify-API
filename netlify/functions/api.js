import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import serverless from "serverless-http";
import dotenv from "dotenv";
dotenv.config();

// Import models
import Song from "../../Models/Song.js";
import User from "../../Models/User.js";

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
            album: "Fallback Album",
            duration: 180,
            coverImage: "https://via.placeholder.com/300",
            audioUrl: "https://example.com/song1.mp3",
            user_id: {
              _id: "demo-user-1",
              username: "demo_user",
              profileImage: "https://via.placeholder.com/150"
            },
            createdAt: new Date().toISOString()
          },
          {
            _id: "fallback-song-2",
            title: "Fallback Song 2",
            artist: "API Demo",
            album: "Fallback Album",
            duration: 210,
            coverImage: "https://via.placeholder.com/300",
            audioUrl: "https://example.com/song2.mp3",
            user_id: {
              _id: "demo-user-1",
              username: "demo_user",
              profileImage: "https://via.placeholder.com/150"
            },
            createdAt: new Date().toISOString()
          }
        ]
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
    // Return fallback data even in case of error
    return res.json({ 
      data: [
        {
          _id: "error-fallback-song-1",
          title: "Error Fallback Song 1",
          artist: "API Error Recovery",
          album: "Error Recovery",
          duration: 180,
          coverImage: "https://via.placeholder.com/300",
          audioUrl: "https://example.com/song1.mp3",
          user_id: {
            _id: "demo-user-1",
            username: "demo_user",
            profileImage: "https://via.placeholder.com/150"
          },
          createdAt: new Date().toISOString()
        },
        {
          _id: "error-fallback-song-2",
          title: "Error Fallback Song 2",
          artist: "API Error Recovery",
          album: "Error Recovery",
          duration: 210,
          coverImage: "https://via.placeholder.com/300",
          audioUrl: "https://example.com/song2.mp3",
          user_id: {
            _id: "demo-user-1",
            username: "demo_user",
            profileImage: "https://via.placeholder.com/150"
          },
          createdAt: new Date().toISOString()
        }
      ]
    });
  }
});

// Single song endpoint with Netlify path
app.get("/.netlify/functions/api/songs/:id", async (req, res) => {
  console.log("Single song endpoint hit with ID:", req.params.id);
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      console.log("MongoDB not connected, returning fallback song data");
      
      // Check if the ID starts with "fallback" or "error-fallback"
      const isFallbackSong = req.params.id.includes("fallback");
      
      // Return appropriate fallback data
      return res.json({ 
        data: {
          _id: req.params.id,
          title: isFallbackSong ? "Fallback Song Details" : "Song Not Found",
          artist: isFallbackSong ? "API Demo" : "Unknown Artist",
          album: "Fallback Album",
          duration: 180,
          coverImage: "https://via.placeholder.com/300",
          audioUrl: "https://example.com/song.mp3",
          lyrics: "This is a fallback song with sample lyrics.\nLine 2 of lyrics.\nLine 3 of lyrics.",
          user_id: {
            _id: "demo-user-1",
            username: "demo_user",
            profileImage: "https://via.placeholder.com/150"
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      });
    }

    // Get the song from MongoDB
    const song = await Song.findById(req.params.id)
      .populate("user_id", "username profileImage");

    if (!song) {
      console.log("Song not found with ID:", req.params.id);
      return res.status(404).json({ 
        data: {
          _id: req.params.id,
          title: "Song Not Found",
          artist: "Unknown Artist",
          album: "Unknown Album",
          duration: 0,
          coverImage: "https://via.placeholder.com/300?text=Not+Found",
          audioUrl: "",
          lyrics: "This song could not be found in the database.",
          user_id: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      });
    }

    console.log("Found song:", song.title);
    res.json({ data: song });
  } catch (error) {
    console.error("Error fetching song:", error.message);
    // Return fallback data even in case of error
    return res.json({ 
      data: {
        _id: req.params.id,
        title: "Error Fallback Song",
        artist: "API Error Recovery",
        album: "Error Recovery",
        duration: 180,
        coverImage: "https://via.placeholder.com/300?text=Error",
        audioUrl: "https://example.com/song.mp3",
        lyrics: "This is a fallback song due to an error.\nThe API encountered an issue but recovered.",
        user_id: {
          _id: "demo-user-1",
          username: "demo_user",
          profileImage: "https://via.placeholder.com/150"
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });
  }
});

// Seed data endpoint with Netlify path
app.get("/.netlify/functions/api/seed", async (req, res) => {
  console.log("Seed endpoint hit");
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      console.log("MongoDB not connected, cannot seed data");
      return res.status(500).json({ 
        success: false,
        message: "MongoDB not connected, cannot seed data"
      });
    }

    // Define sample songs
    const sampleSongs = [
      {
        title: "Bohemian Rhapsody",
        artist: "Queen",
        album: "A Night at the Opera",
        duration: 354,
        coverImage: "https://upload.wikimedia.org/wikipedia/en/4/4d/Queen_A_Night_At_The_Opera.png",
        audioUrl: "https://example.com/bohemian-rhapsody.mp3",
        lyrics: "Is this the real life? Is this just fantasy?\nCaught in a landslide, no escape from reality\nOpen your eyes, look up to the skies and see\nI'm just a poor boy, I need no sympathy",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "Billie Jean",
        artist: "Michael Jackson",
        album: "Thriller",
        duration: 294,
        coverImage: "https://upload.wikimedia.org/wikipedia/en/5/55/Michael_Jackson_-_Thriller.png",
        audioUrl: "https://example.com/billie-jean.mp3",
        lyrics: "She was more like a beauty queen from a movie scene\nI said don't mind, but what do you mean, I am the one\nWho will dance on the floor in the round",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "Hotel California",
        artist: "Eagles",
        album: "Hotel California",
        duration: 390,
        coverImage: "https://upload.wikimedia.org/wikipedia/en/4/49/Hotelcalifornia.jpg",
        audioUrl: "https://example.com/hotel-california.mp3",
        lyrics: "On a dark desert highway, cool wind in my hair\nWarm smell of colitas, rising up through the air\nUp ahead in the distance, I saw a shimmering light",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "Imagine",
        artist: "John Lennon",
        album: "Imagine",
        duration: 183,
        coverImage: "https://upload.wikimedia.org/wikipedia/en/6/69/ImagineCover.jpg",
        audioUrl: "https://example.com/imagine.mp3",
        lyrics: "Imagine there's no heaven\nIt's easy if you try\nNo hell below us\nAbove us only sky\nImagine all the people\nLiving for today",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "Sweet Child O' Mine",
        artist: "Guns N' Roses",
        album: "Appetite for Destruction",
        duration: 356,
        coverImage: "https://upload.wikimedia.org/wikipedia/en/6/60/GunsnRosesAppetiteforDestructionalbumcover.jpg",
        audioUrl: "https://example.com/sweet-child-o-mine.mp3",
        lyrics: "She's got a smile that it seems to me\nReminds me of childhood memories\nWhere everything was as fresh as the bright blue sky",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Check if there are already songs in the database
    const existingSongs = await Song.find();
    if (existingSongs.length > 0) {
      console.log(`Database already has ${existingSongs.length} songs, skipping seed`);
      return res.json({ 
        success: true,
        message: `Database already has ${existingSongs.length} songs, skipping seed`,
        existingSongs: existingSongs.map(song => ({
          _id: song._id,
          title: song.title,
          artist: song.artist
        }))
      });
    }

    // Create a demo user for the songs
    const demoUser = {
      username: "demo_user",
      email: "demo@example.com",
      password: "password123", // In a real app, this would be hashed
      profileImage: "https://via.placeholder.com/150",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Check if User model is available
    let user;
    if (mongoose.models.User) {
      // Check if demo user already exists
      user = await mongoose.models.User.findOne({ email: demoUser.email });
      if (!user) {
        // Create demo user
        user = await mongoose.models.User.create(demoUser);
        console.log("Created demo user:", user.username);
      } else {
        console.log("Using existing demo user:", user.username);
      }
    } else {
      console.log("User model not available, using fallback user ID");
      user = { _id: "demo-user-id" };
    }

    // Add user_id to each song
    const songsWithUser = sampleSongs.map(song => ({
      ...song,
      user_id: user._id
    }));

    // Insert songs into the database
    const insertedSongs = await Song.insertMany(songsWithUser);
    console.log(`Successfully seeded ${insertedSongs.length} songs`);

    res.json({ 
      success: true,
      message: `Successfully seeded ${insertedSongs.length} songs`,
      songs: insertedSongs.map(song => ({
        _id: song._id,
        title: song.title,
        artist: song.artist
      }))
    });
  } catch (error) {
    console.error("Error seeding data:", error.message);
    res.status(500).json({ 
      success: false,
      message: `Error seeding data: ${error.message}`
    });
  }
});

// Get songs by user ID endpoint with Netlify path
app.get("/.netlify/functions/api/songs/user/:userId", async (req, res) => {
  console.log("Get songs by user ID endpoint hit with userId:", req.params.userId);
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      console.log("MongoDB not connected, returning fallback data");
      return res.json({ 
        data: [
          {
            _id: "user-fallback-song-1",
            title: "User's Song 1",
            artist: "Demo Artist",
            album: "User's Album",
            duration: 180,
            coverImage: "https://via.placeholder.com/300",
            audioUrl: "https://example.com/song1.mp3",
            user_id: {
              _id: req.params.userId,
              username: "demo_user",
              profileImage: "https://via.placeholder.com/150"
            },
            createdAt: new Date().toISOString()
          },
          {
            _id: "user-fallback-song-2",
            title: "User's Song 2",
            artist: "Demo Artist",
            album: "User's Album",
            duration: 210,
            coverImage: "https://via.placeholder.com/300",
            audioUrl: "https://example.com/song2.mp3",
            user_id: {
              _id: req.params.userId,
              username: "demo_user",
              profileImage: "https://via.placeholder.com/150"
            },
            createdAt: new Date().toISOString()
          }
        ]
      });
    }

    // Get songs by user ID from MongoDB
    let songs;
    
    // Handle both ObjectId and string user IDs
    try {
      // Try to find songs with user_id as ObjectId
      if (mongoose.Types.ObjectId.isValid(req.params.userId)) {
        songs = await Song.find({ user_id: req.params.userId })
          .populate("user_id", "username profileImage")
          .sort({ createdAt: -1 });
      } else {
        songs = [];
      }
      
      // If no songs found and userId looks like a demo ID, provide fallback
      if (songs.length === 0 && req.params.userId.includes("demo")) {
        console.log("No songs found for user, returning fallback data");
        return res.json({ 
          data: [
            {
              _id: "user-fallback-song-1",
              title: "User's Demo Song 1",
              artist: "Demo Artist",
              album: "Demo Album",
              duration: 180,
              coverImage: "https://via.placeholder.com/300",
              audioUrl: "https://example.com/song1.mp3",
              user_id: {
                _id: req.params.userId,
                username: "demo_user",
                profileImage: "https://via.placeholder.com/150"
              },
              createdAt: new Date().toISOString()
            },
            {
              _id: "user-fallback-song-2",
              title: "User's Demo Song 2",
              artist: "Demo Artist",
              album: "Demo Album",
              duration: 210,
              coverImage: "https://via.placeholder.com/300",
              audioUrl: "https://example.com/song2.mp3",
              user_id: {
                _id: req.params.userId,
                username: "demo_user",
                profileImage: "https://via.placeholder.com/150"
              },
              createdAt: new Date().toISOString()
            }
          ]
        });
      }
    } catch (error) {
      console.error("Error finding songs by user ID:", error.message);
      // Return empty array on error
      songs = [];
    }

    console.log(`Found ${songs.length} songs for user ${req.params.userId}`);
    res.json({ data: songs });
  } catch (error) {
    console.error("Error fetching songs by user ID:", error.message);
    // Return fallback data even in case of error
    return res.json({ 
      data: [
        {
          _id: "error-user-fallback-song-1",
          title: "Error Recovery Song 1",
          artist: "Error Recovery",
          album: "Error Recovery",
          duration: 180,
          coverImage: "https://via.placeholder.com/300?text=Error",
          audioUrl: "https://example.com/song1.mp3",
          user_id: {
            _id: req.params.userId,
            username: "error_recovery",
            profileImage: "https://via.placeholder.com/150"
          },
          createdAt: new Date().toISOString()
        },
        {
          _id: "error-user-fallback-song-2",
          title: "Error Recovery Song 2",
          artist: "Error Recovery",
          album: "Error Recovery",
          duration: 210,
          coverImage: "https://via.placeholder.com/300?text=Error",
          audioUrl: "https://example.com/song2.mp3",
          user_id: {
            _id: req.params.userId,
            username: "error_recovery",
            profileImage: "https://via.placeholder.com/150"
          },
          createdAt: new Date().toISOString()
        }
      ]
    });
  }
});

// Auth endpoints
app.post("/auth/register", async (req, res) => {
  console.log("Register endpoint hit with data:", req.body);
  try {
    // Here you'd normally create a user in the database
    // For testing purposes, we'll just return a success response with a token
    res.status(201).json({
      token: "test_token_for_development",
      data: {
        user: {
          username: req.body.username,
          email: req.body.email,
          // Don't send back the password!
        }
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
    // For testing purposes, we'll just return a success response with a token
    res.status(201).json({
      token: "test_token_for_development",
      data: {
        user: {
          username: req.body.username,
          email: req.body.email,
          // Don't send back the password!
        }
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
