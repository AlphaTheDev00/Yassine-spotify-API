import express from "express";
import Song from "../Models/Song.js";
import User from "../Models/User.js"; // Assuming User model is defined in this file
import Playlist from "../Models/Playlist.js"; // Assuming Playlist model is defined in this file
import validateToken from "../middleware/validateToken.js";
import mongoose from "mongoose";

const router = express.Router();

// list all songs
router.get("/", validateToken, async (req, res, next) => {
  try {
    console.log("GET /songs endpoint hit");

    // Log connection state
    console.log("MongoDB Connection State:", mongoose.connection.readyState);
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting

    const songs = await Song.find()
      .sort({ createdAt: -1 })
      .populate("artist", "username"); // Populate artist details if needed

    console.log(`Found ${songs.length} songs`);
    res.status(200).json(songs);
  } catch (error) {
    console.error("Error fetching songs:", error);
    // Pass error to the error handler middleware
    next(error);
  }
});

// Get songs by user ID
router.get("/user/:userId", validateToken, async (req, res, next) => {
  try {
    const songs = await Song.find({ user_id: req.params.userId }).populate(
      "user_id",
      "username"
    );

    if (!songs.length) {
      return res.status(404).json({ message: "No songs found for this user." });
    }

    res.status(200).json(songs);
  } catch (error) {
    next(error);
  }
});

// Show a single song by ID
router.get("/:id", validateToken, async (req, res, next) => {
  try {
    const song = await Song.findById(req.params.id)
      .populate("user_id", "username email")
      .populate("album_id", "title");

    if (!song) {
      return res.status(404).json({ message: "Song not found." });
    }

    res.status(200).json(song);
  } catch (error) {
    next(error);
  }
});

// Update a song by ID
router.put("/:id", validateToken, async (req, res, next) => {
  try {
    const { title, duration, audio_url, cover_Image } = req.body;

    // Find the song first
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ message: "Song not found." });
    }

    // Ensure the logged in user is the owner of the song
    if (song.user_id.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized: You can only update your own songs." });
    }

    // Update only the fields provided in the request Body
    if (title) song.title = title;
    if (duration) song.duration = duration;
    if (audio_url) song.audio_url = audio_url;
    if (cover_Image) song.cover_Image = cover_Image;

    const updatedSong = await song.save();
    res.status(200).json({ message: "Song updated successfully", updatedSong });
  } catch (error) {
    next(error);
  }
});

// Create a new song
router.post("/", validateToken, async (req, res, next) => {
  try {
    const { title, duration, audio_url, cover_Image } = req.body;

    const newSong = new Song({
      title,
      duration,
      audio_url,
      cover_Image,
      user_id: req.user._id, // Set the user_id from the authenticated user
    });

    const savedSong = await newSong.save();
    res.status(201).json(savedSong);
  } catch (error) {
    next(error);
  }
});

// Delete a song by ID
router.delete("/:id", validateToken, async (req, res, next) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ message: "Song not found." });
    }

    // Ensure the logged in user is the owner of the song
    if (song.user_id.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized: You can only delete your own songs." });
    }

    await song.deleteOne();
    res.status(200).json({ message: "Song deleted successfully" });
  } catch (error) {
    next(error);
  }
});

// Playlist Controllers
export const getPlaylists = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate({
      path: "playlists",
      populate: {
        path: "songs",
        model: "Song",
      },
    });
    res.json(user.playlists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createPlaylist = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user._id;

    const playlist = await Playlist.create({ name });
    await User.findByIdAndUpdate(userId, {
      $push: { playlists: playlist._id },
    });

    res.status(201).json(playlist);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getSinglePlaylist = async (req, res) => {
  try {
    const { id } = req.params;
    const playlist = await Playlist.findById(id).populate("songs");

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    res.json(playlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePlaylist = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, songId, action } = req.body;
    const playlist = await Playlist.findById(id);

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    if (name) {
      playlist.name = name;
    }

    if (songId && action) {
      if (action === "add") {
        playlist.songs.addToSet(songId);
      } else if (action === "remove") {
        playlist.songs.pull(songId);
      }
    }

    await playlist.save();
    res.json(playlist);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deletePlaylist = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const playlist = await Playlist.findByIdAndDelete(id);
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    await User.findByIdAndUpdate(userId, {
      $pull: { playlists: id },
    });

    res.json({ message: "Playlist deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Liked Songs Controllers
export const getLikedSongs = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate("likedSongs");
    res.json({ songs: user.likedSongs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addLikedSong = async (req, res) => {
  try {
    const userId = req.user._id;
    const { songId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.likedSongs.addToSet(songId);
    await user.save();

    res.json({ message: "Song added to liked songs" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const removeLikedSong = async (req, res) => {
  try {
    const userId = req.user._id;
    const songId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.likedSongs.pull(songId);
    await user.save();

    res.json({ message: "Song removed from liked songs" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

router.get("/playlists", validateToken, getPlaylists);
router.post("/playlists", validateToken, createPlaylist);
router.get("/playlists/:id", validateToken, getSinglePlaylist);
router.put("/playlists/:id", validateToken, updatePlaylist);
router.delete("/playlists/:id", validateToken, deletePlaylist);

router.get("/users/liked-songs", validateToken, getLikedSongs);
router.post("/users/liked-songs", validateToken, addLikedSong);
router.delete("/users/liked-songs/:id", validateToken, removeLikedSong);

// Export the router
export default router;
