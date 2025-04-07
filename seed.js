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

// Sample users
const sampleUsers = [
  {
    username: "regular_user",
    email: "user@example.com",
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
  {
    username: "jazz_master",
    email: "jazz@example.com",
    password: "password123",
    isArtist: true,
  },
  {
    username: "rock_legend",
    email: "rock@example.com",
    password: "password123",
    isArtist: true,
  },
];

// Sample songs without user_id (will be assigned during seeding)
const sampleSongs = [
  {
    title: "Summer Vibes",
    audio_url: "https://example.com/summer-vibes.mp3",
    cover_Image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&h=500&fit=crop",
    duration: 180,
    genre: "Pop",
    releaseDate: new Date("2024-01-15"),
  },
  {
    title: "Midnight Dreams",
    audio_url: "https://example.com/midnight-dreams.mp3",
    cover_Image: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=500&h=500&fit=crop",
    duration: 240,
    genre: "Electronic",
    releaseDate: new Date("2024-02-01"),
  },
  {
    title: "Ocean Waves",
    audio_url: "https://example.com/ocean-waves.mp3",
    cover_Image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&h=500&fit=crop",
    duration: 210,
    genre: "Ambient",
    releaseDate: new Date("2024-02-15"),
  },
  {
    title: "City Lights",
    audio_url: "https://example.com/city-lights.mp3",
    cover_Image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=500&h=500&fit=crop",
    duration: 195,
    genre: "Indie",
    releaseDate: new Date("2024-03-01"),
  },
  {
    title: "Mountain Air",
    audio_url: "https://example.com/mountain-air.mp3",
    cover_Image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=500&h=500&fit=crop",
    duration: 225,
    genre: "Folk",
    releaseDate: new Date("2024-03-15"),
  },
  {
    title: "Desert Wind",
    audio_url: "https://example.com/desert-wind.mp3",
    cover_Image: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=500&h=500&fit=crop",
    duration: 200,
    genre: "World",
    releaseDate: new Date("2024-04-01"),
  },
  {
    title: "Urban Jungle",
    audio_url: "https://example.com/urban-jungle.mp3",
    cover_Image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=500&h=500&fit=crop",
    duration: 215,
    genre: "Hip Hop",
    releaseDate: new Date("2024-04-15"),
  },
  {
    title: "Forest Echo",
    audio_url: "https://example.com/forest-echo.mp3",
    cover_Image: "https://images.unsplash.com/photo-1511497584788-876760111969?w=500&h=500&fit=crop",
    duration: 230,
    genre: "Acoustic",
    releaseDate: new Date("2024-05-01"),
  },
  {
    title: "Rainy Days",
    audio_url: "https://example.com/rainy-days.mp3",
    cover_Image: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=500&h=500&fit=crop",
    duration: 190,
    genre: "Jazz",
    releaseDate: new Date("2024-05-15"),
  },
  {
    title: "Sunset Drive",
    audio_url: "https://example.com/sunset-drive.mp3",
    cover_Image:
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500&h=500&fit=crop",
    duration: 205,
    genre: "Rock",
    releaseDate: new Date("2024-06-01"),
  },
  {
    title: "Neon Lights",
    audio_url: "https://example.com/neon-lights.mp3",
    cover_Image: "https://images.unsplash.com/photo-1563089145-599997674d42?w=500&h=500&fit=crop",
    duration: 195,
    genre: "Synthwave",
    releaseDate: new Date("2024-06-15"),
  },
  {
    title: "Moonlight Sonata",
    audio_url: "https://example.com/moonlight-sonata.mp3",
    cover_Image: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=500&h=500&fit=crop",
    duration: 320,
    genre: "Classical",
    releaseDate: new Date("2024-07-01"),
  },
  {
    title: "Rhythm of the Night",
    audio_url: "https://example.com/rhythm-night.mp3",
    cover_Image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&h=500&fit=crop",
    duration: 240,
    genre: "Dance",
    releaseDate: new Date("2024-07-15"),
  },
  {
    title: "Autumn Leaves",
    audio_url: "https://example.com/autumn-leaves.mp3",
    cover_Image: "https://images.unsplash.com/photo-1507783548227-544c3b8fc065?w=500&h=500&fit=crop",
    duration: 210,
    genre: "Jazz",
    releaseDate: new Date("2024-08-01"),
  },
  {
    title: "Electric Dreams",
    audio_url: "https://example.com/electric-dreams.mp3",
    cover_Image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&h=500&fit=crop",
    duration: 225,
    genre: "Electronic",
    releaseDate: new Date("2024-08-15"),
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

    // Insert sample users
    const users = await User.insertMany(hashedUsers);
    console.log("Inserted sample users:", users.length);

    // Assign users to songs and insert them
    const songsWithUsers = sampleSongs.map((song, index) => {
      // Distribute songs among artist users (skip the regular user)
      const artistIndex = (index % (users.length - 1)) + 1; // Skip first user (non-artist)
      return {
        ...song,
        user_id: users[artistIndex]._id, // Assign user_id
      };
    });

    // Insert sample songs with user_id
    const songs = await Song.insertMany(songsWithUsers);
    console.log("Inserted sample songs:", songs.length);

    // Add some songs to the regular user's liked songs
    const regularUser = users[0]; // First user is the regular user
    const songsToLike = songs.slice(0, 5); // Like the first 5 songs
    
    regularUser.likedSongs = songsToLike.map(song => song._id);
    await regularUser.save();
    console.log("Added liked songs to regular user");

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
