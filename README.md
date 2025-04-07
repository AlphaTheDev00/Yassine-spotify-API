# 🎵 MusicFy API - Spotify Clone Backend

![MusicFy API Banner](https://i.imgur.com/ZJg3CZN.png)

## 📝 Description

This is the backend API for the MusicFy Spotify Clone application. It provides RESTful endpoints for user authentication, song management, playlist operations, and user preferences. Built with Node.js, Express, and MongoDB, this API is deployed as serverless functions on Netlify.

## 🚀 Deployment Link

**API Endpoint:** [MusicFy API](https://spotify-clone-api-v2.netlify.app/.netlify/functions/api)

**Health Check:** [API Health](https://spotify-clone-api-v2.netlify.app/.netlify/functions/api/health)

## 💻 Getting Started/Code Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or Atlas connection)

### Installation
```bash
# Clone the repository
git clone https://github.com/AlphaTheDev00/Yassine-spotify-API.git

# Navigate to the project directory
cd Yassine-spotify-API

# Install dependencies
npm install

# Create .env file with the following variables
# MONGO_URI=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret
# PORT=8888

# Start the development server
npm run dev
```

### Running Locally with Netlify Dev
```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Start the Netlify dev environment
netlify dev
```

## ⏱️ Timeframe & Working Team

**Timeframe:** 2 weeks

**Project Type:** Solo project

## 🛠️ Technologies Used

### Backend Framework
- Node.js
- Express.js
- MongoDB
- Mongoose

### Authentication & Security
- JSON Web Tokens (JWT)
- bcrypt.js for password hashing
- CORS for cross-origin resource sharing

### Deployment & Infrastructure
- Netlify Functions
- Serverless Framework
- MongoDB Atlas

### Development Tools
- Git & GitHub
- Postman
- VS Code
- Netlify CLI

## 📋 API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and get authentication token

### Songs
- `GET /songs` - Get all songs
- `GET /songs/:id` - Get a specific song by ID
- `POST /songs` - Create a new song (auth required)
- `PUT /songs/:id` - Update a song (auth required)
- `DELETE /songs/:id` - Delete a song (auth required)
- `GET /songs/user/:userId` - Get songs by user ID

### Playlists
- `GET /playlists` - Get all playlists for the authenticated user
- `GET /playlists/:id` - Get a specific playlist by ID
- `POST /playlists` - Create a new playlist (auth required)
- `PUT /playlists/:id` - Update a playlist (auth required)
- `DELETE /playlists/:id` - Delete a playlist (auth required)
- `PUT /playlists/:id/songs` - Add songs to a playlist (auth required)
- `DELETE /playlists/:id/songs/:songId` - Remove a song from a playlist (auth required)

### Liked Songs
- `GET /users/liked-songs` - Get all liked songs for the authenticated user
- `POST /users/liked-songs/:songId` - Add a song to liked songs (auth required)
- `DELETE /users/liked-songs/:songId` - Remove a song from liked songs (auth required)

### Utility Endpoints
- `GET /health` - Check API health status
- `GET /seed` - Seed the database with initial data (development only)

## 🔨 Build/Code Process

### Database Models

The API is built around three main models:

#### User Model
```javascript
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  profileImage: {
    type: String,
    default: "https://via.placeholder.com/150",
  },
  likedSongs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song'
  }],
  playlists: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Playlist'
  }],
}, { timestamps: true });
```

#### Song Model
```javascript
const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  artist: {
    type: String,
    required: true,
    trim: true,
  },
  album: {
    type: String,
    trim: true,
  },
  genre: {
    type: String,
    trim: true,
  },
  duration: {
    type: Number,
    default: 0,
  },
  coverImage: {
    type: String,
    default: "https://via.placeholder.com/300",
  },
  audioUrl: {
    type: String,
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });
```

#### Playlist Model
```javascript
const playlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  coverImage: {
    type: String,
    default: "https://via.placeholder.com/300",
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  songs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song'
  }],
}, { timestamps: true });
```

### Authentication Implementation

The API uses JWT for authentication. Here's the implementation of the login endpoint:

```javascript
app.post("/.netlify/functions/api/auth/login", async (req, res) => {
  console.log("Login endpoint hit with credentials:", req.body);
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    
    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Return success response with token
    res.json({
      success: true,
      token,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profileImage: user.profileImage,
        }
      },
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});
```

### Middleware for Route Protection

To protect routes that require authentication, I implemented a middleware function:

```javascript
const validateToken = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user data to request
    req.user = decoded;
    
    // Proceed to the protected route
    next();
  } catch (error) {
    console.error("Token validation error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};
```

## 🧩 Challenges

### Serverless Function Limitations

One of the major challenges was adapting the Express.js application to work within the constraints of Netlify Functions. Serverless functions have limitations on execution time and memory usage, which required optimizing database queries and response handling.

Solution:
- Implemented connection pooling for MongoDB to reuse connections
- Added caching for frequently accessed data
- Optimized query performance with proper indexing

### CORS Configuration

Setting up proper CORS configuration was challenging to ensure secure communication between the frontend and backend while allowing necessary access.

```javascript
const corsOptions = {
  origin: [
    "https://musicfy-clone.netlify.app",
    "https://musicfy-clone-client.netlify.app",
    "http://localhost:5173",
    "http://localhost:3000",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
```

### Database Connection Management

Managing database connections in a serverless environment required a different approach than traditional Express applications.

```javascript
// Database connection function with connection pooling
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log("MongoDB already connected");
      return;
    }
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};
```

## 🏆 Wins

### Efficient Data Modeling

Creating an efficient data model that supports the relationships between users, songs, and playlists was a significant win. The model allows for easy querying and population of related data.

### Mock Data Generation

Implementing a robust mock data generation system for development and testing was extremely helpful:

```javascript
const generateMockSongs = (count = 10) => {
  const genres = ['Pop', 'Rock', 'Hip Hop', 'Jazz', 'Electronic', 'Classical', 'R&B', 'Country'];
  const artists = ['The Weeknd', 'Taylor Swift', 'Drake', 'Billie Eilish', 'Ed Sheeran', 'Ariana Grande'];
  const albums = ['After Hours', 'Midnights', 'Certified Lover Boy', 'Happier Than Ever', 'Equals', 'Positions'];
  
  return Array.from({ length: count }, (_, i) => ({
    _id: `mock-song-${i + 1}`,
    title: `Mock Song ${i + 1}`,
    artist: artists[Math.floor(Math.random() * artists.length)],
    album: albums[Math.floor(Math.random() * albums.length)],
    genre: genres[Math.floor(Math.random() * genres.length)],
    duration: Math.floor(Math.random() * 300) + 120, // 2-5 minutes
    coverImage: `https://picsum.photos/seed/song${i + 1}/300/300`,
    audioUrl: 'https://example.com/audio.mp3',
    createdAt: new Date(),
    updatedAt: new Date(),
    user_id: {
      _id: 'mock-user-1',
      username: 'mockuser',
      profileImage: 'https://picsum.photos/seed/user1/150/150'
    }
  }));
};
```

### Comprehensive Error Handling

Implementing comprehensive error handling throughout the API improved reliability and debugging:

```javascript
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  // Determine status code
  const statusCode = err.statusCode || 500;
  
  // Format error response
  const errorResponse = {
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  };
  
  res.status(statusCode).json(errorResponse);
});
```

## 🎓 Key Learnings/Takeaways

### Serverless Architecture

This project provided valuable experience in building and deploying serverless applications. I learned how to structure an Express application to work efficiently within the constraints of serverless functions.

### MongoDB Best Practices

Working with MongoDB in a production environment taught me best practices for data modeling, indexing, and query optimization. I gained a deeper understanding of Mongoose's population feature for handling relationships between collections.

### Authentication Security

Implementing JWT authentication reinforced my understanding of secure authentication practices, including:
- Proper password hashing with bcrypt
- Secure token generation and validation
- Protection against common security vulnerabilities

### API Design Principles

Designing a comprehensive API for a music streaming application improved my skills in:
- RESTful API design
- Consistent error handling
- Proper HTTP status code usage
- API documentation

## 🐛 Bugs

- The API occasionally times out when handling large playlist operations due to serverless function execution limits
- Some complex MongoDB queries may return incomplete data when the dataset grows very large
- The mock data generation sometimes creates duplicate entries when run multiple times

## 🔮 Future Improvements

- **Implement GraphQL**: Add a GraphQL layer to provide more flexible data querying options
- **Rate Limiting**: Add rate limiting to protect against abuse and ensure fair resource usage
- **Caching Layer**: Implement Redis caching for frequently accessed data to improve performance
- **Full-Text Search**: Add MongoDB Atlas Search for advanced song and playlist searching
- **Analytics Endpoints**: Create endpoints for user listening statistics and recommendations
- **Streaming Optimization**: Optimize audio streaming with range requests and adaptive bitrates
- **WebSocket Integration**: Add real-time features like currently playing status and collaborative playlists
- **OAuth Integration**: Support third-party authentication providers like Google and Facebook

---

## 📱 Connect With Me

- [GitHub](https://github.com/AlphaTheDev00)
- [LinkedIn](https://www.linkedin.com/in/yassinechikar/)
- [Portfolio](https://yassine-dev.com)

---

*This API was created as part of a web development bootcamp and is for educational purposes only.*
