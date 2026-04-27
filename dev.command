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
echo "  API pointing to: http://$IP:5000"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -n "$URL" | pbcopy
echo "  ✅ Expo URL copied to clipboard"
echo "  Open Messages on your Mac, paste it, send to yourself"
echo ""
open -a Messages

# Write .env.local to override production .env — Expo gives .env.local higher priority
echo "EXPO_PUBLIC_DOMAIN=http://$IP:5000" > .env.local

# Start backend server bound to all interfaces so LAN IP can reach it
SERVER_HOST=0.0.0.0 npm run server:dev &
SERVER_PID=$!

# Start Expo
npx expo start --lan

# Clean up .env.local when Expo exits
rm -f .env.local
kill $SERVER_PID 2>/dev/null
