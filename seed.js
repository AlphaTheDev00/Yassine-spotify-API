import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

// Import models
import Song from "./Models/Song.js";
import User from "./Models/User.js";

const sampleSongs = [
  {
    title: "Summer Vibes",
    audio_url: "https://example.com/summer-vibes.mp3",
    cover_Image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&h=500&fit=crop",
    duration: 180,
    genre: "Pop",
    releaseDate: new Date("2024-01-15"),
  },
  {
    title: "Midnight Dreams",
    audio_url: "https://example.com/midnight-dreams.mp3",
    cover_Image:
      "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=500&h=500&fit=crop",
    duration: 240,
    genre: "Electronic",
    releaseDate: new Date("2024-02-01"),
  },
  {
    title: "Ocean Waves",
    audio_url: "https://example.com/ocean-waves.mp3",
    cover_Image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&h=500&fit=crop",
    duration: 210,
    genre: "Ambient",
    releaseDate: new Date("2024-02-15"),
  },
  {
    title: "City Lights",
    audio_url: "https://example.com/city-lights.mp3",
    cover_Image:
      "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=500&h=500&fit=crop",
    duration: 195,
    genre: "Indie",
    releaseDate: new Date("2024-03-01"),
  },
  {
    title: "Mountain Air",
    audio_url: "https://example.com/mountain-air.mp3",
    cover_Image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=500&h=500&fit=crop",
    duration: 225,
    genre: "Folk",
    releaseDate: new Date("2024-03-15"),
  },
  {
    title: "Desert Wind",
    audio_url: "https://example.com/desert-wind.mp3",
    cover_Image:
      "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=500&h=500&fit=crop",
    duration: 200,
    genre: "World",
    releaseDate: new Date("2024-04-01"),
  },
  {
    title: "Urban Jungle",
    audio_url: "https://example.com/urban-jungle.mp3",
    cover_Image:
      "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=500&h=500&fit=crop",
    duration: 215,
    genre: "Hip Hop",
    releaseDate: new Date("2024-04-15"),
  },
  {
    title: "Forest Echo",
    audio_url: "https://example.com/forest-echo.mp3",
    cover_Image:
      "https://images.unsplash.com/photo-1511497584788-876760111969?w=500&h=500&fit=crop",
    duration: 230,
    genre: "Acoustic",
    releaseDate: new Date("2024-05-01"),
  },
  {
    title: "Rainy Days",
    audio_url: "https://example.com/rainy-days.mp3",
    cover_Image:
      "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=500&h=500&fit=crop",
    duration: 190,
    genre: "Jazz",
    releaseDate: new Date("2024-05-15"),
  },
  {
    title: "Sunset Drive",
    audio_url: "https://example.com/sunset-drive.mp3",
    cover_Image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&h=500&fit=crop",
    duration: 205,
    genre: "Rock",
    releaseDate: new Date("2024-06-01"),
  },
];

const sampleUsers = [
  {
    username: "testuser",
    email: "test@example.com",
    password: "password123",
    isArtist: false,
  },
  {
    username: "artist1",
    email: "artist1@example.com",
    password: "password123",
    isArtist: true,
  },
  {
    username: "artist2",
    email: "artist2@example.com",
    password: "password123",
    isArtist: true,
  },
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await Song.deleteMany({});
    await User.deleteMany({});
    console.log("Cleared existing data");

    // Hash passwords for users
    const hashedUsers = await Promise.all(
      sampleUsers.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10),
      }))
    );

    // Insert sample songs
    const songs = await Song.insertMany(sampleSongs);
    console.log("Inserted sample songs");

    // Insert sample users
    const users = await User.insertMany(hashedUsers);
    console.log("Inserted sample users");

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
