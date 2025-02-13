import express from "express";
import Song from "../Models/Song.js";
import validateToken from "../middleware/validateToken.js";

const router = express.Router();

// Show a single song by ID
router.get("/api/songs/:id", async (req, res, next) => {
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
router.put("/api/songs/:id", validateToken, async (req, res, next) => {
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

// list all songs
router.get("/api/songs", async (req, res, next) => {
  try {
    const allSongs = await Song.find().populate("user_id");
    return res.status(200).json({ allSongs });
  } catch (error) {
    next(error);
  }
});

// Create a song
router.post("/api/songs", validateToken, async (req, res, next) => {
  try {
    req.body.user_id = req.user._id;
    const song = await Song.create(req.body);
    return res.status(201).json({ message: "Song created", song });
  } catch (error) {
    next(error);
  }
});

// Delete a song
router.delete("/api/songs/:id", validateToken, async (req, res, next) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }

    if (!req.user._id.equals(song.user_id)) {
      return res
        .status(403)
        .json({ message: "Unauthorized: You can only delete your own songs." });
    }

    await Song.findByIdAndDelete(req.params.id);
    return res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

export default router;
