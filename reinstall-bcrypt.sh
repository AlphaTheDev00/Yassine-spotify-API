#!/bin/bash
cd /mnt/e/Projects/Spotify-Clone/Yassine-spotify-API
echo "Removing node_modules/bcrypt..."
rm -rf node_modules/bcrypt
echo "Reinstalling bcrypt..."
npm install bcrypt
echo "bcrypt reinstalled successfully."
