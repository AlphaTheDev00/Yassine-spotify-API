import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const playlistSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true,
  },

  name: {
    type: String,
    required: [true, "Playlist name is required."],
  },
  user_id: {
    type: String,
    ref: "User",
    required: true,
  },

  created_at: {
    type: Date,
    default: Date.now,
  },
});

const Playlist = mongoose.model("Playlist, playlistSchema");
export default Playlist;
