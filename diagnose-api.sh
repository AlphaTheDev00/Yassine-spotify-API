#!/bin/bash
echo "====================================="
echo "API Server Diagnostics (WSL)"
echo "====================================="

echo -e "\nChecking if port 3000 is in use:"
netstat -tuln | grep 3000 || echo "Port 3000 is not in use by any process"

echo -e "\nChecking MongoDB status:"
ps aux | grep mongo

echo -e "\nTesting network connectivity between WSL and Windows:"
ping -c 3 $(hostname).local

echo -e "\nChecking DNS resolution:"
nslookup localhost

echo -e "\nTrying to connect to API server:"
curl -v http://localhost:3000/api/test 2>&1 || echo "Could not connect to API server"

echo -e "\nStarting a test server on port 3001:"
node -e "const http = require('http'); const server = http.createServer((req, res) => { res.end('API test server working!'); }); server.listen(3001, '0.0.0.0', () => { console.log('Test server running on port 3001'); });" &
TEST_SERVER_PID=$!

sleep 2

echo -e "\nTrying to connect to test server from WSL:"
curl http://localhost:3001 || echo "Could not connect to test server from WSL"

echo -e "\nDone with diagnostics"

# Clean up
kill $TEST_SERVER_PID 2>/dev/null
