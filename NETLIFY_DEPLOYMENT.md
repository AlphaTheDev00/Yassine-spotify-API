# Spotify Clone API - Netlify Deployment Guide

This guide will help you properly deploy your Spotify Clone API to Netlify.

## Prerequisites

- A Netlify account
- Your code pushed to GitHub
- MongoDB Atlas account (for database hosting)

## Deployment Steps

### 1. Set Up Environment Variables in Netlify

In the Netlify UI, navigate to **Site settings > Build & deploy > Environment** and add the following variables:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
NODE_ENV=production
```

### 2. Connect Your Repository

1. Log in to Netlify
2. Click "New site from Git"
3. Select your GitHub repository
4. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `public`
   - Functions directory: `netlify/functions`

### 3. Deploy Functions

Netlify will automatically deploy your serverless functions from the `netlify/functions` directory.

### 4. Verify Deployment

After deployment, check the following:

1. Visit your API's health endpoint: `https://your-site-name.netlify.app/.netlify/functions/api/health`
2. Check the Netlify function logs for any errors

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your CORS settings in `api.js` include your client domain
2. **MongoDB Connection Issues**: Check your MongoDB Atlas network settings to allow connections from Netlify
3. **Function Timeout**: If your functions time out, consider optimizing database queries

### Function Logs

To view function logs:
1. Go to Netlify dashboard
2. Select your site
3. Navigate to Functions > Your function name
4. View the logs

## Client-Side Configuration

Ensure your client is configured to use the deployed API URL:

```javascript
// In your client's API service
const API_URL = 'https://your-api-site-name.netlify.app/.netlify/functions/api';
```

## Local Development

For local development:

1. Install the Netlify CLI: `npm install -g netlify-cli`
2. Run `netlify dev` to test your functions locally

## Important Notes

- The MongoDB connection is cached in the serverless function to improve performance
- JWT authentication is handled by the validateToken middleware
- All API routes are prefixed with `/.netlify/functions/api`
