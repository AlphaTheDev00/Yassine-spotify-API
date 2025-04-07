import express from "express";
import cors from "cors";
const app = express();
const PORT = 3000;

// Sample data
const songs = [
  {
    _id: "1",
    title: "Song 1",
    cover_image: "https://picsum.photos/200/300",
    user_id: { username: "user1" },
  },
  {
    _id: "2",
    title: "Song 2",
    cover_image: "https://picsum.photos/200/300",
    user_id: { username: "user1" },
  },
  {
    _id: "3",
    title: "Song 3",
    cover_image: "https://picsum.photos/200/300",
    user_id: { username: "user2" },
  },
];

const likedSongs = [songs[0], songs[1]];

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// Routes
app.get("/api/songs", (req, res) => {
  res.json({ data: songs });
});

app.get("/api/liked-songs", (req, res) => {
  res.json({ data: likedSongs });
});

app.post("/api/liked-songs", (req, res) => {
  const { songId } = req.body;
  const song = songs.find((s) => s._id === songId);
  if (song && !likedSongs.find((s) => s._id === songId)) {
    likedSongs.push(song);
  }
  res.json({ data: null, message: "Song added to liked songs" });
});

app.delete("/api/liked-songs/:id", (req, res) => {
  const songId = req.params.id;
  const index = likedSongs.findIndex((s) => s._id === songId);
  if (index !== -1) {
    likedSongs.splice(index, 1);
  }
  res.json({ data: null, message: "Song removed from liked songs" });
});

// Auth routes (simplified)
app.post("/api/auth/login", (req, res) => {
  res.json({ message: "Logging in...", token: "fake-token-123" });
});

app.post("/api/auth/register", (req, res) => {
  res.json({ message: "Registering user", token: "fake-token-123" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Simple server running on port ${PORT}`);
});
