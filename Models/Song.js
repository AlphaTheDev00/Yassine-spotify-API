import mongoose from "mongoose";

const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Song title is required"],
    trim: true,
  },
  // Support both artist and user_id for compatibility
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  // Support both audioUrl and audio_url
  audioUrl: {
    type: String,
  },
  audio_url: {
    type: String,
  },
  // Support both imageUrl and cover_Image
  imageUrl: {
    type: String,
    default: "/default-album-art.jpg",
  },
  cover_Image: {
    type: String,
  },
  // Support album_id for relationship
  album_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Album",
  },
  duration: {
    type: Number,
    default: 0,
  },
  plays: {
    type: Number,
    default: 0,
  },
  releaseDate: {
    type: Date,
    default: Date.now,
  },
  genre: {
    type: String,
    default: "Unknown",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save hook to ensure consistent field usage
songSchema.pre("save", function (next) {
  // Copy values between duplicate fields to maintain consistency
  if (this.artist && !this.user_id) this.user_id = this.artist;
  if (this.user_id && !this.artist) this.artist = this.user_id;
  next();
});

const Song = mongoose.model("Song", songSchema);

export default Song;
