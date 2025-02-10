import Song from "../Models/Song.js";
const router = express.Router();

// Show a single song by ID
 router.get ("/:id", async (req, res) => {
  try {
    const song = await Song.findById(req.params.id)
      .populate("user_id", "username email") // Populate user details
      .populate("album_id", "title"); // Populate album title

    if (!song) {
      return res.status(404).json({ message: "Song not found." });
    }

    res.status(200).json(song);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a song by ID
router.put ("/:id", async (req, res) => {
  try {
    const { title, duration, audio_url, cover_image } = req.body;

    const updatedSong = await Song.findByIdAndUpdate(
      req.params.id,
      { title, duration, audio_url, cover_image },
      { new: true, runValidators: true }
    );

    if (!updatedSong) {
      return res.status(404).json({ message: "Song not found. " });
    }
    res.status(200).json({ message: "Song updated successfully", updatedSong });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;