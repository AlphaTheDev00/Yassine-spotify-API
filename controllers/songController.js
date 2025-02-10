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

// delete a song
router.delete('/api/songs/:id', validateToken, async (req, res, next) => {
    try {
        const song = await Song.findById(req.params.id)

        if(!song) {
            return res.status(404).json({ message: 'song not found' })
        }

        if(!req.user._id.equals(song.user_id)){
            return res.status(403).json({ message: "nope you cant"})
        } 

        await Song.findByIdAndDelete(req.params.id)

        return res.sendStatus(204)
    } catch (error) {
        next(error)
    }

})

export default router