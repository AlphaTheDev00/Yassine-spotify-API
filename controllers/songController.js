import express from 'express'
import Song from '../Models/Song.js'
import validateToken from '../middleware/validateToken.js'
import { parseWebStream } from 'music-metadata'

const router = express.Router()

// list all songs
router.get('/api/songs', async (req, res, next) => {
    try {
        const allSongs = await Song.find().populate('user_id')

        return res.status(200).json({allSongs})
    } catch (error) {
        next(error)
    }
    
})

// Create a song
router.post('/api/songs', validateToken ,async (req, res, next) => {
    try {
        req.body.user_id = req.user._id

        const song = await Song.create(req.body)
        
        return res.status(201).json({message: 'created song', song: song})
    } catch (error) {
        next(error)
    }
})

export default router