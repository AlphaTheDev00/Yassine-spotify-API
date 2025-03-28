import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import "dotenv/config";
import User from "./Models/User.js";
import Song from "./Models/Song.js";
import Playlist from "./Models/Playlist.js";

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB for seeding"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Clear existing data
const clearDatabase = async () => {
  try {
    await User.deleteMany({});
    await Song.deleteMany({});
    await Playlist.deleteMany({});
    console.log("Database cleared successfully");
  } catch (error) {
    console.error("Error clearing database:", error);
    process.exit(1);
  }
};

// Seed Users
const seedUsers = async () => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("Password123!", salt);

    const users = [
      {
        username: "regular_user",
        email: "user@example.com",
        password: hashedPassword,
        profileImage: "https://i.pravatar.cc/150?img=3",
        isArtist: false,
        likedSongs: [],
        playlists: [],
      },
      {
        username: "artist_user",
        email: "artist@example.com",
        password: hashedPassword,
        profileImage: "https://i.pravatar.cc/150?img=8",
        isArtist: true,
        likedSongs: [],
        playlists: [],
      },
      {
        username: "dj_beats",
        email: "dj@example.com",
        password: hashedPassword,
        profileImage: "https://i.pravatar.cc/150?img=12",
        isArtist: true,
        likedSongs: [],
        playlists: [],
      },
    ];

    const createdUsers = await User.insertMany(users);
    console.log(`${createdUsers.length} users created successfully`);
    return createdUsers;
  } catch (error) {
    console.error("Error seeding users:", error);
    process.exit(1);
  }
};

// Seed Songs
const seedSongs = async (users) => {
  try {
    const artistUser = users.find(user => user.isArtist);
    const djUser = users.find(user => user.username === "dj_beats");
    
    const songs = [
      {
        title: "Summer Vibes",
        user_id: artistUser._id,
        duration: 210, // 3:30
        audio_url: "https://example.com/audio/summer-vibes.mp3",
        cover_Image: "https://picsum.photos/id/1019/300/300",
      },
      {
        title: "Midnight Dreams",
        user_id: artistUser._id,
        duration: 195, // 3:15
        audio_url: "https://example.com/audio/midnight-dreams.mp3",
        cover_Image: "https://picsum.photos/id/1025/300/300",
      },
      {
        title: "Urban Rhythm",
        user_id: djUser._id,
        duration: 240, // 4:00
        audio_url: "https://example.com/audio/urban-rhythm.mp3",
        cover_Image: "https://picsum.photos/id/1035/300/300",
      },
      {
        title: "Electric Sunset",
        user_id: djUser._id,
        duration: 225, // 3:45
        audio_url: "https://example.com/audio/electric-sunset.mp3",
        cover_Image: "https://picsum.photos/id/1039/300/300",
      },
      {
        title: "Chill Wave",
        user_id: artistUser._id,
        duration: 180, // 3:00
        audio_url: "https://example.com/audio/chill-wave.mp3",
        cover_Image: "https://picsum.photos/id/1042/300/300",
      },
    ];

    const createdSongs = await Song.insertMany(songs);
    console.log(`${createdSongs.length} songs created successfully`);
    return createdSongs;
  } catch (error) {
    console.error("Error seeding songs:", error);
    process.exit(1);
  }
};

// Seed Playlists
const seedPlaylists = async (users, songs) => {
  try {
    const regularUser = users.find(user => !user.isArtist);
    const artistUser = users.find(user => user.isArtist && user.username !== "dj_beats");
    
    const playlists = [
      {
        name: "My Favorites",
        songs: [songs[0]._id, songs[2]._id, songs[4]._id],
      },
      {
        name: "Workout Mix",
        songs: [songs[1]._id, songs[3]._id],
      },
      {
        name: "Relaxing Tunes",
        songs: [songs[0]._id, songs[4]._id],
      },
    ];

    const createdPlaylists = await Playlist.insertMany(playlists);
    
    // Add playlists to users
    await User.findByIdAndUpdate(regularUser._id, {
      $push: { playlists: [createdPlaylists[0]._id, createdPlaylists[1]._id] }
    });
    
    await User.findByIdAndUpdate(artistUser._id, {
      $push: { playlists: createdPlaylists[2]._id }
    });
    
    console.log(`${createdPlaylists.length} playlists created successfully`);
    return createdPlaylists;
  } catch (error) {
    console.error("Error seeding playlists:", error);
    process.exit(1);
  }
};

// Add liked songs to users
const addLikedSongs = async (users, songs) => {
  try {
    const regularUser = users.find(user => !user.isArtist);
    const artistUser = users.find(user => user.isArtist && user.username !== "dj_beats");
    
    await User.findByIdAndUpdate(regularUser._id, {
      $push: { likedSongs: [songs[0]._id, songs[2]._id, songs[4]._id] }
    });
    
    await User.findByIdAndUpdate(artistUser._id, {
      $push: { likedSongs: [songs[1]._id, songs[3]._id] }
    });
    
    console.log("Liked songs added to users successfully");
  } catch (error) {
    console.error("Error adding liked songs:", error);
    process.exit(1);
  }
};

// Run the seeding process
const seedDatabase = async () => {
  try {
    await clearDatabase();
    const users = await seedUsers();
    const songs = await seedSongs(users);
    const playlists = await seedPlaylists(users, songs);
    await addLikedSongs(users, songs);
    
    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
