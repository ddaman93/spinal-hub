#!/bin/bash

# SpinalHub - Start All Services
# Double-click this file to start the dev servers and open the app

cd "$(dirname "$0")"

echo "🚀 Starting SpinalHub Development Servers..."
echo ""

# Clean up any existing processes
echo "🧹 Cleaning up old processes..."
pkill -f "expo start" 2>/dev/null
pkill -f "tsx server" 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:8081 | xargs kill -9 2>/dev/null || true
sleep 1

# Start the servers
echo "▶️  Starting Express API and Expo..."
npm run dev:local &

# Wait for servers to be ready
echo "⏳ Waiting for servers to start..."
sleep 8

# Check if servers are running
if lsof -i:3000 | grep LISTEN > /dev/null 2>&1; then
    echo "✅ Express API running on http://localhost:3000"
else
    echo "❌ Express API failed to start"
fi

if lsof -i:8081 | grep LISTEN > /dev/null 2>&1; then
    echo "✅ Expo Metro running on http://localhost:8081"
else
    echo "❌ Expo failed to start"
fi

echo ""
echo "🌐 Opening browser..."
sleep 2

# Open the app in browser
open http://localhost:8081

echo ""
echo "✨ SpinalHub is ready!"
echo ""
echo "📱 App: http://localhost:8081"
echo "🔌 API: http://localhost:3000"
echo ""
echo "⚠️  Press Ctrl+C to stop the servers"
echo ""

# Keep the terminal open and show logs
tail -f /dev/null
