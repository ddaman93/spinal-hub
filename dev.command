#!/bin/bash
cd "$(dirname "$0")"

# Find Mac's local IP on WiFi
IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null)

if [ -z "$IP" ]; then
  echo "⚠️  Could not detect WiFi IP. Make sure you're connected to WiFi."
  exit 1
fi

URL="exp://$IP:8081"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Expo URL for your phone:"
echo "  $URL"
echo ""
echo "  API pointing to: http://$IP:3000"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -n "$URL" | pbcopy
echo "  ✅ Expo URL copied to clipboard"
echo "  Open Messages on your Mac, paste it, send to yourself"
echo ""
open -a Messages

# Write .env.local to override production EXPO_PUBLIC_DOMAIN
# (.env.local has higher priority than .env in Expo's loading order)
echo "EXPO_PUBLIC_DOMAIN=http://$IP:3000" > .env.local

# Kill any stale server process on port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null

# Start backend server in background
npm run server:dev &
SERVER_PID=$!

# Give the server a moment to start
sleep 2

# Start Expo
npx expo start --lan

# Clean up
rm -f .env.local
kill $SERVER_PID 2>/dev/null
