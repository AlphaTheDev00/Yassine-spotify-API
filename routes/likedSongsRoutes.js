import express from 'express';
import { getLikedSongs, addLikedSong, removeLikedSong } from '../controllers/songController.js';
import validateToken from '../middleware/validateToken.js';

const router = express.Router();

// Get user's liked songs
router.get('/', validateToken, getLikedSongs);

// Add a song to liked songs
router.post('/', validateToken, addLikedSong);

// Remove a song from liked songs
router.delete('/:id', validateToken, removeLikedSong);

export default router;
