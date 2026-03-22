/**
 * Scrapes skin care images from the Christopher Reeve Foundation page,
 * uploads them to Cloudflare R2, and writes a manifest JSON that the
 * app's data file can reference.
 *
 * Run with: npx ts-node -r dotenv/config scripts/scrape-sci-skincare-images.ts
 */

import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";

const {
  CLOUDFLARE_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET,
  R2_PUBLIC_BASE_URL,
} = process.env;

function must(v: string | undefined, name: string): string {
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

const ACCOUNT_ID    = must(CLOUDFLARE_ACCOUNT_ID, "CLOUDFLARE_ACCOUNT_ID");
const ACCESS_KEY_ID = must(R2_ACCESS_KEY_ID,       "R2_ACCESS_KEY_ID");
const SECRET_KEY    = must(R2_SECRET_ACCESS_KEY,    "R2_SECRET_ACCESS_KEY");
const BUCKET        = must(R2_BUCKET,               "R2_BUCKET");
const PUBLIC_BASE   = must(R2_PUBLIC_BASE_URL,      "R2_PUBLIC_BASE_URL").replace(/\/$/, "");
const KEY_PREFIX    = "skin-care";

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: ACCESS_KEY_ID, secretAccessKey: SECRET_KEY },
});

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* ── images to fetch ── */
const IMAGES = [
  { key: "healthy-skin-dark",       src: "https://www.christopherreeve.org/wp-content/uploads/2024/04/Healthy-Skin-D-Pigment.jpg",                      alt: "Healthy skin anatomy – dark pigment" },
  { key: "healthy-skin-light",      src: "https://www.christopherreeve.org/wp-content/uploads/2024/04/01-Healthy-Skin-L-Pigment.jpg",                   alt: "Healthy skin anatomy – light pigment" },
  { key: "pressure-areas-1",        src: "https://www.christopherreeve.org/wp-content/uploads/2024/04/skin1.png",                                        alt: "Body areas susceptible to pressure injury (view 1)" },
  { key: "pressure-areas-2",        src: "https://www.christopherreeve.org/wp-content/uploads/2024/04/skin2.png",                                        alt: "Body areas susceptible to pressure injury (view 2)" },
  { key: "pressure-areas-3",        src: "https://www.christopherreeve.org/wp-content/uploads/2024/04/skin3.png",                                        alt: "Body areas susceptible to pressure injury (view 3)" },
  { key: "stage-1-dark",            src: "https://www.christopherreeve.org/wp-content/uploads/2024/04/Stage-1-D-Pigment.jpg",                            alt: "Stage 1 pressure injury – dark pigment" },
  { key: "stage-1-light",           src: "https://www.christopherreeve.org/wp-content/uploads/2024/04/Stage-1-L-Pigment.jpg",                            alt: "Stage 1 pressure injury – light pigment" },
  { key: "stage-2",                 src: "https://www.christopherreeve.org/wp-content/uploads/2024/04/Stage-2-April-2020.jpg",                            alt: "Stage 2 pressure injury" },
  { key: "stage-3",                 src: "https://www.christopherreeve.org/wp-content/uploads/2024/04/Stage-3-April-2020.jpg",                            alt: "Stage 3 pressure injury" },
  { key: "stage-3-epibole",         src: "https://www.christopherreeve.org/wp-content/uploads/2024/04/1j.-Stage-3-with-Epibole-April-2016.jpg",           alt: "Stage 3 pressure injury with epibole" },
  { key: "stage-4",                 src: "https://www.christopherreeve.org/wp-content/uploads/2024/04/Stage-4-April-2020.jpg",                            alt: "Stage 4 pressure injury" },
  { key: "unstageable-no-slough",   src: "https://www.christopherreeve.org/wp-content/uploads/2024/04/Unstageable-NoSlough.jpg",                          alt: "Unstageable pressure injury – no slough" },
  { key: "unstageable-half-slough", src: "https://www.christopherreeve.org/wp-content/uploads/2024/04/Unstageable-HALFSlough-1.jpg",                      alt: "Unstageable pressure injury – partial slough" },
  { key: "deep-tissue",             src: "https://www.christopherreeve.org/wp-content/uploads/2024/04/Deep-Tissue-Pressure-Injury-April-2020.jpg",        alt: "Deep tissue pressure injury" },
  { key: "blanch-test",             src: "https://www.christopherreeve.org/wp-content/uploads/2024/04/1g.-Blanchable-vs-Non-Blanchable-April-2016.jpg",   alt: "Blanchable vs non-blanchable comparison" },
];

function extOf(url: string, ct?: string | null): string {
  if (ct?.includes("png"))  return "png";
  if (ct?.includes("webp")) return "webp";
  if (ct?.includes("gif"))  return "gif";
  const ext = url.split("?")[0].split(".").pop()?.toLowerCase();
  if (ext && ["jpg","jpeg","png","webp","gif"].includes(ext)) return ext === "jpeg" ? "jpg" : ext;
  return "jpg";
}

async function alreadyInR2(key: string): Promise<boolean> {
  try {
    await r2.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function downloadImage(url: string): Promise<{ buf: Buffer; contentType: string }> {
  const res = await fetch(url, {
    headers: { "User-Agent": "SpinalHubBot/1.0 (+https://spinalhub-assets; skin-care sync)" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  return { buf, contentType: res.headers.get("content-type") ?? "image/jpeg" };
}

async function uploadToR2(key: string, buf: Buffer, contentType: string): Promise<void> {
  await r2.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: buf, ContentType: contentType }));
}

async function main() {
  const manifest: Record<string, { url: string; alt: string }> = {};
  const manifestPath = path.resolve(__dirname, "../client/data/generated/skinCareImages.json");
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });

  for (const img of IMAGES) {
    const { buf, contentType } = await downloadImage(img.src).catch((e) => {
      console.error(`  ✗ Download failed for ${img.key}: ${e.message}`);
      return { buf: null as any, contentType: "" };
    });

    if (!buf) continue;

    const ext = extOf(img.src, contentType);
    const r2Key = `${KEY_PREFIX}/${img.key}.${ext}`;

    const exists = await alreadyInR2(r2Key);
    if (exists) {
      console.log(`  ↩ Already in R2: ${r2Key}`);
    } else {
      await uploadToR2(r2Key, buf, contentType);
      console.log(`  ✓ Uploaded: ${r2Key}`);
    }

    manifest[img.key] = {
      url: `${PUBLIC_BASE}/${r2Key}`,
      alt: img.alt,
    };

    await sleep(300);
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
  console.log(`\nManifest written → ${manifestPath}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
