/**
 * Downloads pressure relief technique images from MSKTC.
 * Run with: node scripts/downloadPressureReliefImages.js
 *
 * Uses only built-in Node modules (https, http, fs, path) + cheerio (already in package.json).
 */

const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { load } = require("cheerio");

const SOURCE_URL =
  "https://msktc.org/sci/factsheets/how-do-pressure-reliefs-weight-shifts";

const OUTPUT_DIR = path.join(
  __dirname,
  "../client/assets/images/pressure-relief"
);

// Keywords to match images to technique names
const TARGETS = [
  { keywords: ["forward", "lean"], filename: "forward-lean.png" },
  { keywords: ["side", "lean"], filename: "side-lean.png" },
  { keywords: ["push", "up", "lift"], filename: "push-up.png" },
];

function fetchText(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    client
      .get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          resolve(fetchText(res.headers.location));
          return;
        }
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
      })
      .on("error", reject);
  });
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    // Ensure URL is absolute
    if (url.startsWith("//")) url = "https:" + url;
    if (!url.startsWith("http")) {
      url = "https://msktc.org" + (url.startsWith("/") ? "" : "/") + url;
    }

    console.log(`  Downloading: ${url}`);
    const client = url.startsWith("https") ? https : http;
    const file = fs.createWriteStream(destPath);

    client
      .get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          file.close();
          fs.unlink(destPath, () => {});
          resolve(downloadFile(res.headers.location, destPath));
          return;
        }
        if (res.statusCode !== 200) {
          file.close();
          fs.unlink(destPath, () => {});
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          return;
        }
        res.pipe(file);
        file.on("finish", () => {
          file.close(() => resolve(destPath));
        });
      })
      .on("error", (err) => {
        file.close();
        fs.unlink(destPath, () => {});
        reject(err);
      });
  });
}

function scoreMatch(text, keywords) {
  const lower = text.toLowerCase();
  return keywords.filter((k) => lower.includes(k)).length;
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log(`Fetching: ${SOURCE_URL}`);
  const html = await fetchText(SOURCE_URL);
  const $ = load(html);

  // Collect all images with their surrounding context
  const candidates = [];
  $("img").each((_, el) => {
    const src = $(el).attr("src") || $(el).attr("data-src") || "";
    if (!src) return;

    // Text context: alt, title, nearby text
    const alt = ($(el).attr("alt") || "").toLowerCase();
    const title = ($(el).attr("title") || "").toLowerCase();
    const parent = $(el).closest("figure, div, section, p");
    const nearbyText = (parent.text() || "").toLowerCase().slice(0, 200);
    const context = `${alt} ${title} ${nearbyText} ${src.toLowerCase()}`;

    candidates.push({ src, context });
  });

  console.log(`Found ${candidates.length} images on page.`);

  // Match each target to the best-scoring candidate
  const used = new Set();
  for (const target of TARGETS) {
    let bestScore = -1;
    let bestCandidate = null;

    for (const candidate of candidates) {
      if (used.has(candidate.src)) continue;
      const score = scoreMatch(candidate.context, target.keywords);
      if (score > bestScore) {
        bestScore = score;
        bestCandidate = candidate;
      }
    }

    const destPath = path.join(OUTPUT_DIR, target.filename);

    if (bestCandidate && bestScore > 0) {
      used.add(bestCandidate.src);
      console.log(
        `\n[${target.filename}] score=${bestScore}, src=${bestCandidate.src}`
      );
      try {
        await downloadFile(bestCandidate.src, destPath);
        console.log(`  Saved: ${destPath}`);
      } catch (err) {
        console.error(`  Failed: ${err.message}`);
      }
    } else {
      console.warn(
        `\n[${target.filename}] No matching image found (best score=${bestScore}). Skipping.`
      );
    }
  }

  console.log("\nDone.");
}

main().catch(console.error);
