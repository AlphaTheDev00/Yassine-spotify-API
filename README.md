# Spotify Clone API

This is the backend API for a Spotify-like music streaming application. It provides endpoints for user authentication, song management, and playlist functionality.

## Technologies Used

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Express Middleware

## Setup Instructions

1. Clone the repository
2. Install dependencies with `npm install`
3. Make sure MongoDB is running locally
4. Create a `.env` file with the following variables:
   ```
   MONGODB_URI=mongodb://localhost:27017/spotify-api
   TOKEN_SECRET=your_secure_secret_key
   PORT=3000
   ```
5. Start the server with `npm start`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user

### Songs
- `GET /api/songs` - Get all songs
- `GET /api/songs/user/:userId` - Get songs by user ID
- `GET /api/songs/:id` - Get a specific song
- `POST /api/songs` - Create a new song (requires authentication)
- `PUT /api/songs/:id` - Update a song (requires authentication)
- `DELETE /api/songs/:id` - Delete a song (requires authentication)

## Models

### User
- username (String, required, unique)
- email (String, required, unique)
- password (String, required, validated)
- profileImage (String)
- isArtist (Boolean, required)
- playlists (Array of Playlist references)
- likes (Array of Song references)

### Song
- title (String, required)
- user_id (Reference to User, required)
- album_id (Reference to Album)
- duration (Number)
- audio_url (String, required)
- cover_Image (String)

### Playlist
- name (String, required)
- songs (Array of Song references)