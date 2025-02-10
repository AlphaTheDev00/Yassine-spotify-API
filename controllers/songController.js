import express from 'express'
import Song from '../Models/Song.js'
import validateToken from '../middleware/validateToken.js'

const router = express.Router()

router.post('/api/songs', validateToken ,async (req, res, next) => {
    try {
        req.body.user_id = req.user._id
        const song = await Song.create(req.body)
        res.json({message: 'created song', song: song})
    } catch (error) {
        next(error)
    }
})

export default router