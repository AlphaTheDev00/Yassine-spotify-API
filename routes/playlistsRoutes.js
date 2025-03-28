import express from 'express';
import { getPlaylists, createPlaylist, getSinglePlaylist, updatePlaylist, deletePlaylist } from '../controllers/songController.js';
import validateToken from '../middleware/validateToken.js';

const router = express.Router();

// Get all playlists
router.get('/', validateToken, getPlaylists);

// Create a new playlist
router.post('/', validateToken, createPlaylist);

// Get a single playlist by ID
router.get('/:id', validateToken, getSinglePlaylist);

// Update a playlist
router.put('/:id', validateToken, updatePlaylist);

// Delete a playlist
router.delete('/:id', validateToken, deletePlaylist);

export default router;
