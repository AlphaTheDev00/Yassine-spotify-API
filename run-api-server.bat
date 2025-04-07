@echo off
echo ===================================
echo Starting Spotify Clone API Server
echo ===================================
echo.

cd /d e:\Projects\Spotify-Clone\Yassine-spotify-API
echo Current directory: %CD%
echo.

echo Starting MongoDB (if not already running)...
start wsl -- mongod --dbpath ~/data/db --bind_ip 0.0.0.0 --port 27017 --noauth
echo.

echo Reinstalling bcrypt for WSL environment...
wsl -- chmod +x /mnt/e/Projects/Spotify-Clone/Yassine-spotify-API/reinstall-bcrypt.sh
wsl -- /mnt/e/Projects/Spotify-Clone/Yassine-spotify-API/reinstall-bcrypt.sh
echo.

echo Checking WSL networking...
wsl -- ip addr | findstr "eth0"
echo.

echo Starting API server (with explicit binding to all interfaces)...
wsl -- cd /mnt/e/Projects/Spotify-Clone/Yassine-spotify-API && NODE_OPTIONS="--dns-result-order=ipv4first" npm run dev
echo.

pause
