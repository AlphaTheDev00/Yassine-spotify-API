import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../Models/User.js";
import Song from "../Models/Song.js";
import Playlist from "../Models/Playlist.js";

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Song.deleteMany({});
    await Playlist.deleteMany({});
    console.log("Cleared existing data");

    // Create test users
    const users = await User.create([
      {
        username: "testuser1",
        email: "test1@example.com",
        password: "password123", // Password will be hashed by the User model's pre-save middleware
        isArtist: true,
      },
      {
        username: "testuser2",
        email: "test2@example.com",
        password: "password123", // Password will be hashed by the User model's pre-save middleware
        isArtist: true,
      },
      {
        username: "listener1",
        email: "listener1@example.com",
        password: "password123", // Password will be hashed by the User model's pre-save middleware
        isArtist: false,
      },
    ]);
    console.log("Created test users");

    // Create test songs
    const songs = await Song.create([
      {
        title: "Summer Vibes",
        duration: 225, // 3:45 in seconds
        audio_url: "https://example.com/songs/summer-vibes.mp3",
        cover_Image: "https://example.com/covers/summer-vibes.jpg",
        user_id: users[0]._id,
      },
      {
        title: "Midnight Dreams",
        duration: 260, // 4:20 in seconds
        audio_url: "https://example.com/songs/midnight-dreams.mp3",
        cover_Image: "https://example.com/covers/midnight-dreams.jpg",
        user_id: users[0]._id,
      },
      {
        title: "Ocean Waves",
        duration: 195, // 3:15 in seconds
        audio_url: "https://example.com/songs/ocean-waves.mp3",
        cover_Image: "https://example.com/covers/ocean-waves.jpg",
        user_id: users[1]._id,
      },
    ]);
    console.log("Created test songs");

    // Create test playlists
    const playlists = await Playlist.create([
      {
        name: "Chill Vibes",
        songs: [songs[0]._id, songs[2]._id],
        user_id: users[2]._id,
      },
      {
        name: "Workout Mix",
        songs: [songs[1]._id, songs[0]._id],
        user_id: users[2]._id,
      },
    ]);
    console.log("Created test playlists");

    // Update users with playlists and liked songs
    await User.findByIdAndUpdate(users[2]._id, {
      $push: {
        playlists: { $each: playlists.map((p) => p._id) },
        likedSongs: { $each: [songs[0]._id, songs[1]._id] },
      },
    });

    console.log("Database seeded successfully!");
    return { success: true, message: "Database seeded successfully!" };
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
};

// Export the handler for Netlify Functions
export const handler = async (event, context) => {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ message: "Method not allowed" }),
      };
    }

    const result = await seedDatabase();
    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
