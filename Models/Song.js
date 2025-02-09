import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";

const songSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true,
  },

  title: {
    type: String,
    required: [true, "Song title is required."],
  },
  user_id: {
    type: String,
    ref: "User",
    required: true,
  },

  album_id: {
    type: String,
    ref: "Album",
  },
  duration: {
    type: Number,
    required: true,
  },

  audio_url: {
    type: String,
    required: [true, "Audio URL is required."],
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const Song = mongoose.model("Song", songSchema);
export default Song;
