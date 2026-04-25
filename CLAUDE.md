# Spinal Hub — Claude Instructions

## App Store Build Rules

**Every time you touch `app.json` for a build or submit:**
- Bump `ios.buildNumber` by 1 (e.g. "9" → "10")
- Bump `version` by a patch or minor version (e.g. "1.2.0" → "1.2.1")
- Do both in the same commit — never bump one without the other
- Apple rejects builds if `version` is the same as or lower than the previously approved version

## CRITICAL: Git Safety Rules

**NEVER run `git checkout HEAD -- <file>` or any destructive git reset on individual files without explicit confirmation.**

This project has a large amount of uncommitted work-in-progress (all files marked `M` or `??` in `git status`). Running `git checkout HEAD --` on any file will **permanently destroy uncommitted changes** with no recovery path — no stash, no history.

- Before reverting any file, always ask the user to confirm which specific file(s) to revert.
- If a revert is needed, list the files that would be affected and warn that changes will be lost.
- Prefer editing files back to a known state rather than using git to discard changes.
- Never include `DashboardScreen.tsx`, `RootTabsNavigator.tsx`, or any screen file in a bulk revert unless the user has explicitly named that exact file.

## UI Consistency Rules

### Product / Category Cards
- **Always use the shared `ProductCard` component** (`client/components/ProductCard.tsx`) with `compact={true}` when displaying product cards anywhere in the app.
- Card dimensions (compact): **160px wide, 88px image height**, 10px padding, small font sizes (title 13pt, caption 11pt).
- Cards must look identical across all screens — the Computer & Productivity Tech screen is the reference.
- Never create custom inline card components that duplicate `ProductCard`. Extend the shared component if a new variant is needed.
- Product listing screens (e.g. `AlternativeMiceProductsScreen`) must display cards in a **wrapped 2-column grid** using `flexDirection: "row", flexWrap: "wrap"`, not as large full-width cards.

### Navigation
- **`RootTabsNavigator.tsx`** (`client/navigation/RootTabsNavigator.tsx`) is the only active navigator — it is the one mounted in `App.tsx`.
- All new screens must be registered here inside the appropriate stack (usually `HomeStack`).
- `RootStackNavigator.tsx` has been deleted — it was dead code. Do not recreate it.

## Product Data Procedure (Single Source of Truth)

When adding or restructuring product sections in Spinal Hub, follow this procedure:

1) Single source of truth
- Products must live in exactly ONE exported array (e.g. `WHEELCHAIR_GLOVES`).
- Do NOT create duplicate per-brand arrays or per-screen arrays containing the same products.
- UI screens must filter the single array via tags/fields.

2) Tagging convention
- Every product must have a `tags` array that includes:
  - A brand tag in the form `brand:<id>` when applicable.
  - Optional filter tags in the form `filter:<id>` to enable pill filtering.
- Keep tag strings stable and reusable across screens.

3) Screens must derive data
- Brand pages, category pages, and filtered views must only derive their lists by filtering the single product array.
- Never hardcode a list of products inside a screen component.

4) Navigation + UI consistency
- Copy existing patterns for:
  - Card layout
  - Detail screen layout
  - Navigation registration and header styling
- Avoid redesigns or refactors unless explicitly requested.

5) Link validation
- Before committing new `productUrl` values, confirm they open successfully (no 404).
- Prefer canonical product pages (e.g. Shopify `/products/...`) over non-canonical or redirected URLs.

6) YouTube video embeds
- Products can have an optional `videoUrl` field (a YouTube embed URL, e.g. `https://www.youtube.com/embed/VIDEO_ID`).
- **Always use the HTML + baseUrl pattern** — never load the YouTube URL directly via `source={{ uri }}`. Direct URI loads produce error 153 because YouTube blocks null-origin embeds.
- The correct pattern (already implemented in `ProductDetailScreen.tsx`):
  ```js
  source={{
    html: `<!DOCTYPE html>...<iframe src="${videoUrl}?playsinline=1&rel=0&origin=https://spinal-hub.onrender.com" ...></iframe>...`,
    baseUrl: "https://spinal-hub.onrender.com",
  }}
  ```
- Use `height: 100vh` on both `body` and `iframe` in the HTML to prevent a black strip at the bottom.
- Add `videoUrl` to both `ManualWheelchairProduct` (or whichever product type) and the `ProductDetail` navigation param type in `client/types/navigation.ts`.

7) Minimal change principle
- Touch the fewest files needed.
- Avoid changing types unless required.
- Keep existing naming conventions and directory patterns.

---

## Finish Launch Plan

When the user says **"Finish launch plan"**, work through the following checklist in order. These are the remaining steps — everything above Step 1 is already complete.

### Completed (do not redo)
- ✅ `eas.json` created
- ✅ `app.json` updated (build numbers, iOS infoPlist, Android permissions)
- ✅ Privacy Policy written, hosted at `https://imaginative-tiramisu-f84d2c.netlify.app/privacy`, linked in Settings and Sign Up screens
- ✅ Backend updated: `0.0.0.0` bind, `PRODUCTION_DOMAIN` CORS env var
- ✅ Delete Account button in Settings + `DELETE /api/auth/account` server endpoint
- ✅ Apple Developer Program enrolled
- ✅ Google Play Console enrolled

---

### Step 1 — Deploy the Backend Server
The Express server still runs on localhost only. It needs a live HTTPS URL before the app can talk to it in production.

1. Go to **render.com** and create a free account
2. New → Web Service → connect your GitHub repo
3. Set build command: `npm install && npm run build` (or whatever builds the server)
4. Set start command: `node dist/server/index.js` (confirm the output path)
5. Add all environment variables from `.env.example` in the Render dashboard
6. Add `PRODUCTION_DOMAIN=https://your-render-url.onrender.com` as an env var
7. Once deployed, set `EXPO_PUBLIC_API_URL=https://your-render-url.onrender.com` in `eas.json` or as an EAS secret
8. Update the URL constant in `client/lib/query-client.ts` for production builds

---

### Step 2 — Run First Build
With accounts enrolled and server deployed:
```
eas build --platform all
```
EAS will prompt for Apple and Android credentials — let it manage them automatically (`eas credentials`). Fix any build errors before proceeding.

---

### Step 3 — App Store Metadata
Both stores require this before submission. Do it in App Store Connect and Google Play Console:
- **App description:** ~150 words. Category: iOS → Health & Fitness, Android → Medical. Age rating: 12+.
- **Privacy Policy URL:** `https://imaginative-tiramisu-f84d2c.netlify.app/privacy` — paste this into both store listings.
- **iOS screenshots:** 2–5 screenshots at iPhone 6.9" size (required). Take from simulator or Expo Go: Dashboard, Tools, Wheelchairs, Community screens.
- **Android screenshots:** At minimum 2 phone screenshots + feature graphic (1024×500px).

---

### Step 4 — Submit for Internal Testing
```
eas submit --platform ios      # → TestFlight
eas submit --platform android  # → Play Store internal track
```
Test with 5–10 real users. Fix issues before public review.

---

### Step 5 — Submit for Public Review
After internal testing is stable, submit both stores for public review. Apple typically takes 1–3 days. Google Play takes a few hours to 1 day.

---

### Remaining Checklist

| # | Task | Status |
|---|------|--------|
| 1 | Deploy backend to Render (or Fly.io / Railway) | — |
| 2 | `eas build --platform all` passes | — |
| 3 | Store metadata + screenshots + privacy URL in listings | — |
| 4 | Internal testing (TestFlight + Play internal) | — |
| 5 | Public review submitted | — |
