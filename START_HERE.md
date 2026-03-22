# 🚀 Quick Start Guide

## To start your SpinalHub app:

### Option 1: Double-click (easiest!)
**Just double-click `start-all.command`** in Finder

This will:
1. ✅ Stop any old processes
2. ✅ Start the Express API server (port 3000)
3. ✅ Start Expo Metro bundler (port 8081)
4. ✅ Open your browser to the app automatically

### Option 2: From Terminal
```bash
./start-all.command
```

### Option 3: Using npm
```bash
npm run dev:local
```

---

## First time setup (macOS security)

When you **first** double-click `start-all.command`, macOS might show a security warning:

1. Click "OK" on the warning
2. Go to **System Settings > Privacy & Security**
3. Click **"Allow Anyway"** next to the blocked message
4. Double-click `start-all.command` again
5. Click **"Open"** when prompted

After this, it will work every time! ✨

---

## What you'll see

- A Terminal window will open showing the server logs
- Your browser will open to http://localhost:8081
- The app will load and ask for location permission (needed for weather)

## To stop the servers

Press **Ctrl+C** in the Terminal window

---

## Troubleshooting

**If ports are busy:**
```bash
# Kill processes on port 3000
lsof -ti:3000 | xargs kill -9

# Kill processes on port 8081
lsof -ti:8081 | xargs kill -9
```

Then run `start-all.command` again.

**If the app doesn't load:**
1. Wait 10-15 seconds for Metro to bundle
2. Refresh the browser
3. Check the Terminal for any error messages

---

## URLs

- **App**: http://localhost:8081
- **API**: http://localhost:3000

---

## Features that will work:

✅ Weather widget (after granting location permission)
✅ SCI News feed
✅ Clinical trials
✅ Assistive technology browsing
✅ Medications reference
✅ All navigation and UI

Enjoy building! 🎉
