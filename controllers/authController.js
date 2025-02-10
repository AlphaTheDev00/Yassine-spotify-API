import express from 'express'
import User from '../Models/user.js'
import generateToken from '../utils/token.js'

const router = express.Router()

router.post('/api/auth/register', async (req, res, next) => {
    try {

        const user = await User.create(req.body)

        const token = generateToken(user)

        res.json({ message: 'Registering user', token: token })
    } catch (error) {
        next(error)
    }

})

router.post('/api/auth/login', async (req, res, next) => {
    try {
        const user = await User.findOne({
            $or: [
                { username: req.body.identifier },
                { email: req.body.identifier }
            ]
        })

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials provided' })
        }

        if (!user.isPasswordValid(req.body.password)) {
            return res.status(401).json({ message: 'Invalid credentials provided' })
        }

        const token = generateToken(user)

        res.json({ message: 'Logging in...', token: token })
    } catch (error) {
        next(error)
    }
})

export default router