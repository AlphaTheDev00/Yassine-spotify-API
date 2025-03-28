import mongoose from "mongoose";
import bcrypt from "bcrypt";
import "dotenv/config";
import User from "../Models/User.js";
import Song from "../Models/Song.js";
import Playlist from "../Models/Playlist.js";

// MongoDB connection string with authentication
// Changed authSource from admin to spotify-api since that's where the user exists
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb://spotify_user:spotify_password@127.0.0.1:27017/spotify-api?authSource=spotify-api";

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI, {
    family: 4,
    connectTimeoutMS: 30000,
  })
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
    console.log("Database cleared");
  } catch (error) {
    console.error("Error clearing database:", error);
    process.exit(1);
  }
};

// Seed users
const seedUsers = async () => {
  try {
    const users = [
      {
        username: "artist1",
        email: "artist1@example.com",
        password: await bcrypt.hash("password123", 10),
        profileImage:
          "https://res.cloudinary.com/df2de4wvd/image/upload/v1622222222/artist1_profile.jpg",
        isArtist: true,
      },
      {
        username: "artist2",
        email: "artist2@example.com",
        password: await bcrypt.hash("password123", 10),
        profileImage:
          "https://res.cloudinary.com/df2de4wvd/image/upload/v1622222222/artist2_profile.jpg",
        isArtist: true,
      },
      {
        username: "user1",
        email: "user1@example.com",
        password: await bcrypt.hash("password123", 10),
        profileImage:
          "https://res.cloudinary.com/df2de4wvd/image/upload/v1622222222/user1_profile.jpg",
        isArtist: false,
      },
    ];

    const createdUsers = await User.insertMany(users);
    console.log(`${createdUsers.length} users created`);
    return createdUsers;
  } catch (error) {
    console.error("Error seeding users:", error);
    process.exit(1);
  }
};

// Seed songs
const seedSongs = async (users) => {
  try {
    const songs = [
      {
        title: "Summer Vibes",
        user_id: users[0]._id,
        duration: 180,
        audio_url:
          "https://res.cloudinary.com/df2de4wvd/video/upload/v1622222222/summer_vibes.mp3",
        cover_image:
          "https://res.cloudinary.com/df2de4wvd/image/upload/v1622222222/summer_vibes_cover.jpg",
      },
      {
        title: "Midnight Dreams",
        user_id: users[0]._id,
        duration: 210,
        audio_url:
          "https://res.cloudinary.com/df2de4wvd/video/upload/v1622222222/midnight_dreams.mp3",
        cover_image:
          "https://res.cloudinary.com/df2de4wvd/image/upload/v1622222222/midnight_dreams_cover.jpg",
      },
      {
        title: "Urban Beats",
        user_id: users[1]._id,
        duration: 195,
        audio_url:
          "https://res.cloudinary.com/df2de4wvd/video/upload/v1622222222/urban_beats.mp3",
        cover_image:
          "https://res.cloudinary.com/df2de4wvd/image/upload/v1622222222/urban_beats_cover.jpg",
      },
      {
        title: "Chill Lofi",
        user_id: users[1]._id,
        duration: 240,
        audio_url:
          "https://res.cloudinary.com/df2de4wvd/video/upload/v1622222222/chill_lofi.mp3",
        cover_image:
          "https://res.cloudinary.com/df2de4wvd/image/upload/v1622222222/chill_lofi_cover.jpg",
      },
    ];

    const createdSongs = await Song.insertMany(songs);
    console.log(`${createdSongs.length} songs created`);
    return createdSongs;
  } catch (error) {
    console.error("Error seeding songs:", error);
    process.exit(1);
  }
};

// Seed playlists
const seedPlaylists = async (users, songs) => {
  try {
    const playlists = [
      {
        name: "My Favorites",
        user_id: users[2]._id,
        songs: [songs[0]._id, songs[2]._id],
      },
      {
        name: "Workout Mix",
        user_id: users[0]._id,
        songs: [songs[1]._id, songs[2]._id, songs[3]._id],
      },
    ];

    const createdPlaylists = await Playlist.insertMany(playlists);
    console.log(`${createdPlaylists.length} playlists created`);

    // Update users with playlists
    await User.findByIdAndUpdate(users[2]._id, {
      $push: { playlists: createdPlaylists[0]._id },
    });

    await User.findByIdAndUpdate(users[0]._id, {
      $push: { playlists: createdPlaylists[1]._id },
    });

    console.log("Users updated with playlists");
  } catch (error) {
    console.error("Error seeding playlists:", error);
    process.exit(1);
  }
};

// Run the seeding
const runSeed = async () => {
  try {
    await clearDatabase();
    const users = await seedUsers();
    const songs = await seedSongs(users);
    await seedPlaylists(users, songs);

    console.log("Seeding completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  }
};

runSeed();
