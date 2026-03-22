# Local Development Guide (macOS)

## ✅ Everything is now working!

### What was fixed:
1. **Server syntax error** - Completed the `server/index.ts` file that was truncated
2. **Port conflict** - Changed from port 5000 → 3000 (Claude Desktop was using 5000)
3. **Expo script** - Added `expo:dev:local` that works without Replit env vars
4. **CORS** - Fixed to allow localhost:8081 origin in development
5. **Combined script** - Added `dev:local` to run both server + Expo together

### Quick Start

**Option 1: Run everything at once (recommended)**
```bash
npm run dev:local
```

**Option 2: Run separately**
```bash
# Terminal 1:
npm run server:dev

# Terminal 2:
npm run expo:dev:local
```

### Servers

- **Express API**: http://localhost:3000
- **Expo Metro**: http://localhost:8081
- **Expo Web**: http://localhost:8081 (in browser)

### Testing the API

```bash
# Test weather endpoint
curl "http://localhost:3000/api/weather?latitude=40.7128&longitude=-74.0060"

# Expected response:
# {"temp":-1,"icon":"13n","city":"New York"}
```

### Changed Files

- `.env` - PORT changed from 5000 → 3000
- `server/index.ts` - Fixed incomplete file, updated CORS
- `client/lib/query-client.ts` - Updated to use port 3000
- `package.json` - Added local dev scripts

### Scripts Reference

- `npm run dev:local` - Start both server and Expo (local dev)
- `npm run server:dev` - Start only Express server
- `npm run expo:dev:local` - Start only Expo (local dev)
- `npm run expo:dev` - Start Expo (Replit mode - uses env vars)
- `npm run all:dev` - Start both (Replit mode)

### Troubleshooting

**If port 3000 is in use:**
```bash
lsof -ti:3000 | xargs kill -9
```

**If port 8081 is in use:**
```bash
lsof -ti:8081 | xargs kill -9
```

**Stop all dev servers:**
```bash
pkill -f "expo start"
pkill -f "tsx server"
```

### Notes

- CORS is configured to allow `localhost:8081` in development
- Weather and SCI news should now load properly in the app
- Location permission is required for weather to work
