@echo off
echo Starting MongoDB in WSL...
start wsl -- mongod --dbpath ~/data/db --bind_ip 127.0.0.1 --port 27017 --noauth
echo MongoDB server started in a separate window.
echo.
echo Now you can run your Node.js server with:
echo cd /mnt/e/Projects/Spotify-Clone/Yassine-spotify-API
echo npm run dev
echo.
echo Press any key to exit...
pause > nul
