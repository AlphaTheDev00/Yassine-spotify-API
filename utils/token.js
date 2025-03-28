import jwt from 'jsonwebtoken'
import 'dotenv/config'

export default function generateToken(user){
    return jwt.sign(
        // payload
        {
            user: {
                _id: user._id,
                username: user.username,
                profileImage: user.profileImage,
                isArtist: user.isArtist,
                playlists: user.playlists,
                likedSongs: user.likedSongs,
                likes: user.likes
            }
        },
        // secret
        process.env.TOKEN_SECRET,
        // options
        { expiresIn: '24h'}
    )
}