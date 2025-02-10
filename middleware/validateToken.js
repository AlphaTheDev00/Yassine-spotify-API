import jwt from 'jsonwebtoken'
import User from '../Models/user.js'

export default async function validateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      throw new Error('No authorization was present on the request')
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new Error('Invalid header syntax')
    }

    const token = authHeader.replace('Bearer ', '')
    const payload = jwt.verify(token, process.env.TOKEN_SECRET)

    const user = await User.findById(payload.user._id)

    if (!user) throw new Error('Token valid but user not found')
    req.user = user
    
    next()
  } catch (error) {
    console.log(error)
    return res.status(401).json({ message: 'Invalid token'})
  }
}