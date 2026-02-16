import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import pLimit from "p-limit";
import * as cheerio from "cheerio";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// ✅ Adjust this import to your real path in-repo:
import * as PW from "../client/data/powerWheelchairProducts"; // <-- CHANGE ME

type Product = {
  id: string;
  title: string;
  image: string;
  productUrl?: string;
};

const {
  CLOUDFLARE_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET,
  R2_PUBLIC_BASE_URL,
  R2_KEY_PREFIX = "assistive-tech/power-wheelchairs",
  R2_MAX_RPS = "2",
} = process.env;

function must<T>(v: T | undefined | null, name: string): T {
  if (!v) throw new Error(`Missing env: ${name}`);
  return v as T;
}

const ACCOUNT_ID = must(CLOUDFLARE_ACCOUNT_ID, "CLOUDFLARE_ACCOUNT_ID");
const ACCESS_KEY_ID = must(R2_ACCESS_KEY_ID, "R2_ACCESS_KEY_ID");
const SECRET_ACCESS_KEY = must(R2_SECRET_ACCESS_KEY, "R2_SECRET_ACCESS_KEY");
const BUCKET = must(R2_BUCKET, "R2_BUCKET");
const PUBLIC_BASE = must(R2_PUBLIC_BASE_URL, "R2_PUBLIC_BASE_URL");

const MAX_RPS = Math.max(1, Number(R2_MAX_RPS) || 2);
const MIN_DELAY_MS = Math.ceil(1000 / MAX_RPS);

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function absUrl(base: string, maybeRelative: string) {
  try {
    return new URL(maybeRelative, base).toString();
  } catch {
    return null;
  }
}

function pickLargestFromSrcset(srcset?: string) {
  if (!srcset) return null;
  // "url 400w, url 800w"
  const parts = srcset
    .split(",")
    .map((p) => p.trim())
    .map((p) => {
      const [u, size] = p.split(/\s+/);
      const w = size?.endsWith("w") ? Number(size.slice(0, -1)) : 0;
      return { u, w: Number.isFinite(w) ? w : 0 };
    })
    .filter((x) => x.u);

  if (!parts.length) return null;
  parts.sort((a, b) => b.w - a.w);
  return parts[0].u;
}

async function fetchHtml(url: string) {
  const res = await fetch(url, {
    redirect: "follow",
    headers: {
      "user-agent":
        "SpinalHubBot/1.0 (+https://spinalhub-assets; image sync)",
      accept: "text/html,application/xhtml+xml",
    },
  });
  return { res, html: await res.text() };
}

async function findBestImageUrl(pageUrl: string): Promise<string | null> {
  const { res, html } = await fetchHtml(pageUrl);
  if (!res.ok) return null;

  const $ = cheerio.load(html);

  // 1) OG image
  const og =
    $('meta[property="og:image"]').attr("content") ||
    $('meta[name="og:image"]').attr("content");
  const ogAbs = og ? absUrl(pageUrl, og) : null;
  if (ogAbs) return ogAbs;

  // 2) twitter image
  const tw =
    $('meta[name="twitter:image"]').attr("content") ||
    $('meta[property="twitter:image"]').attr("content");
  const twAbs = tw ? absUrl(pageUrl, tw) : null;
  if (twAbs) return twAbs;

  // 3) biggest srcset on <img>
  let best: string | null = null;

  $("img").each((_, el) => {
    const srcset = $(el).attr("srcset");
    const pick = pickLargestFromSrcset(srcset);
    if (pick) {
      const u = absUrl(pageUrl, pick);
      if (u) best = u;
    }
  });
  if (best) return best;

  // 4) fallback: first reasonable <img src>
  const src = $("img")
    .map((_, el) => $(el).attr("src"))
    .get()
    .find((s) => s && !s.startsWith("data:"));
  return src ? absUrl(pageUrl, src) : null;
}

function extFromContentType(ct?: string | null) {
  if (!ct) return "jpg";
  if (ct.includes("png")) return "png";
  if (ct.includes("webp")) return "webp";
  if (ct.includes("gif")) return "gif";
  if (ct.includes("jpeg") || ct.includes("jpg")) return "jpg";
  return "jpg";
}

async function downloadImage(url: string) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`Image download failed: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const ct = res.headers.get("content-type");
  return { buf, contentType: ct || "image/jpeg" };
}

async function uploadToR2(key: string, buf: Buffer, contentType: string) {
  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buf,
      ContentType: contentType,
    })
  );
}

function safeKey(prefix: string, id: string, ext: string) {
  const clean = id.replace(/[^a-zA-Z0-9-_]/g, "-");
  return `${prefix}/${clean}.${ext}`;
}

function updateTsFileImageById(tsPath: string, id: string, newUrl: string) {
  const raw = fs.readFileSync(tsPath, "utf8");

  // Replace the first `image: "..."` inside the object that contains `id: "<id>"`
  const re = new RegExp(
    `(id:\\s*["']${id}["'][\\s\\S]*?\\bimage:\\s*["'])([^"']*)(["'])`,
    "m"
  );

  const next = raw.replace(re, `$1${newUrl}$3`);
  if (next === raw) return false;

  fs.writeFileSync(tsPath, next, "utf8");
  return true;
}

async function headOk(url: string) {
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    // Some sites block HEAD — if so, treat as "unknown" and attempt GET later.
    if (res.status === 405 || res.status === 403) return true;
    return res.ok;
  } catch {
    return false;
  }
}

function getAllProducts(): Product[] {
  // Pull arrays from module (keeps this scalable to other categories later)
  const arrays = Object.values(PW).filter((v) => Array.isArray(v)) as any[][];
  const items = arrays.flat().filter(Boolean);

  // Guard shape
  return items
    .filter((p) => typeof p?.id === "string" && typeof p?.title === "string")
    .map((p) => ({
      id: p.id,
      title: p.title,
      image: p.image,
      productUrl: p.productUrl,
    }));
}

async function main() {
  const tsFilePath = path.resolve(process.cwd(), "client/data/powerWheelchairProducts.ts"); // <-- CHANGE if needed
  const reportPath = path.resolve(
    process.cwd(),
    "scripts/r2-sync-report-power-wheelchair.json"
  );

  const products = getAllProducts().filter((p) => p.productUrl);
  const limit = pLimit(1); // strict rate + stability

  const report: any[] = [];

  for (const p of products) {
    await limit(async () => {
      const started = Date.now();
      const productUrl = p.productUrl!;
      const ok = await headOk(productUrl);
      await sleep(MIN_DELAY_MS);

      if (!ok) {
        report.push({
          id: p.id,
          title: p.title,
          productUrl,
          status: "broken_url",
        });
        return;
      }

      let imgUrl: string | null = null;
      try {
        imgUrl = await findBestImageUrl(productUrl);
      } catch (e: any) {
        report.push({
          id: p.id,
          title: p.title,
          productUrl,
          status: "scrape_failed",
          error: String(e?.message || e),
        });
        return;
      }

      await sleep(MIN_DELAY_MS);

      if (!imgUrl) {
        report.push({
          id: p.id,
          title: p.title,
          productUrl,
          status: "no_image_found",
        });
        return;
      }

      try {
        const { buf, contentType } = await downloadImage(imgUrl);
        await sleep(MIN_DELAY_MS);

        const hash = crypto.createHash("sha1").update(buf).digest("hex").slice(0, 10);
        const ext = extFromContentType(contentType);
        const key = safeKey(R2_KEY_PREFIX, `${p.id}-${hash}`, ext);

        await uploadToR2(key, buf, contentType);
        await sleep(MIN_DELAY_MS);

        const publicUrl = `${PUBLIC_BASE}/${key}`;

        const updated = updateTsFileImageById(tsFilePath, p.id, publicUrl);

        report.push({
          id: p.id,
          title: p.title,
          productUrl,
          sourceImage: imgUrl,
          r2Key: key,
          publicUrl,
          updatedTs: updated,
          ms: Date.now() - started,
          status: "ok",
        });
      } catch (e: any) {
        report.push({
          id: p.id,
          title: p.title,
          productUrl,
          sourceImage: imgUrl,
          status: "download_or_upload_failed",
          error: String(e?.message || e),
        });
      }
    });
  }

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");
  console.log(`Done. Report: ${reportPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
