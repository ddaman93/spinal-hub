/**
 * Scrapes Permobil product pages (manual wheelchairs) and generates / refreshes
 * client/data/manualWheelchairChairs.ts image fields.
 *
 * Usage:
 *   npx ts-node --esm scripts/scrape-permobil-chairs.ts
 *   # or
 *   npx tsx scripts/scrape-permobil-chairs.ts
 *
 * The script writes a JSON report to scripts/scrape-report-permobil-chairs.json.
 * After reviewing the report, manually update the image fields in
 * client/data/manualWheelchairChairs.ts with the CDN URLs listed under "imageUrl".
 *
 * No R2 upload — images are served directly from permobilwebcdn.azureedge.net.
 */

import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";

/* ──────────── product list (kept in sync with manualWheelchairChairs.ts) ──────────── */

type ProductStub = {
  id: string;
  title: string;
  productUrl: string;
};

const PRODUCTS: ProductStub[] = [
  // TiLite
  {
    id: "tilite-aero-x",
    title: "TiLite Aero X",
    productUrl: "https://www.permobil.com/en-nz/products/manual-wheelchairs/tilite-aero-x/",
  },
  {
    id: "tilite-aero-t",
    title: "TiLite Aero T",
    productUrl: "https://www.permobil.com/en-nz/products/manual-wheelchairs/tilite-aero-t/",
  },
  {
    id: "tilite-aero-z",
    title: "TiLite Aero Z",
    productUrl: "https://www.permobil.com/en-nz/products/manual-wheelchairs/tilite-aero-z/",
  },
  {
    id: "tilite-zr",
    title: "TiLite ZR",
    productUrl: "https://www.permobil.com/en-nz/products/manual-wheelchairs/tilite-zr/",
  },
  {
    id: "tilite-zra",
    title: "TiLite ZRA",
    productUrl: "https://www.permobil.com/en-nz/products/manual-wheelchairs/tilite-zra/",
  },
  {
    id: "tilite-tra",
    title: "TiLite TRA",
    productUrl: "https://www.permobil.com/en-nz/products/manual-wheelchairs/tilite-tra/",
  },
  {
    id: "tilite-tr",
    title: "TiLite TR",
    productUrl: "https://www.permobil.com/en-nz/products/manual-wheelchairs/tilite-tr/",
  },
  {
    id: "tilite-2gx",
    title: "TiLite 2GX",
    productUrl: "https://www.permobil.com/en-nz/products/manual-wheelchairs/tilite-2gx/",
  },
  {
    id: "tilite-pilot",
    title: "TiLite Pilot",
    productUrl: "https://www.permobil.com/en-nz/products/manual-wheelchairs/tilite-pilot/",
  },
  {
    id: "tilite-twist",
    title: "TiLite TWIST",
    productUrl: "https://www.permobil.com/en-nz/products/manual-wheelchairs/tilite-twist/",
  },
  {
    id: "tilite-cr1",
    title: "TiLite CR1",
    productUrl: "https://www.permobil.com/en-nz/products/manual-wheelchairs/tilite-cr1/",
  },
  // Panthera
  {
    id: "panthera-u3",
    title: "Panthera U3",
    productUrl: "https://www.permobil.com/en-nz/products/manual-wheelchairs/panthera-u3/",
  },
  {
    id: "panthera-u3-light",
    title: "Panthera U3 Light",
    productUrl:
      "https://www.permobil.com/en-nz/products/manual-wheelchairs/panthera-u3-light/",
  },
  {
    id: "panthera-x3",
    title: "Panthera X3",
    productUrl: "https://www.permobil.com/en-nz/products/manual-wheelchairs/panthera-x3/",
  },
  {
    id: "panthera-s3-series",
    title: "Panthera S3 Series",
    productUrl:
      "https://www.permobil.com/en-nz/products/manual-wheelchairs/panthera-s3-series/",
  },
  {
    id: "panthera-s3-swing",
    title: "Panthera S3 Swing",
    productUrl:
      "https://www.permobil.com/en-nz/products/manual-wheelchairs/panthera-s3-swing/",
  },
  {
    id: "panthera-micro-3",
    title: "Panthera Micro 3",
    productUrl:
      "https://www.permobil.com/en-nz/products/manual-wheelchairs/panthera-micro-3/",
  },
  {
    id: "panthera-bambino-3",
    title: "Panthera Bambino 3",
    productUrl:
      "https://www.permobil.com/en-nz/products/manual-wheelchairs/panthera-bambino-3/",
  },
];

/* ──────────── scrape helpers ──────────── */

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function absUrl(base: string, rel: string): string | null {
  try {
    return new URL(rel, base).toString();
  } catch {
    return null;
  }
}

function pickLargestFromSrcset(srcset?: string): string | null {
  if (!srcset) return null;
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

async function scrapeProduct(p: ProductStub) {
  const res = await fetch(p.productUrl, {
    redirect: "follow",
    headers: {
      "user-agent": "SpinalHubBot/1.0 (product-scraper; image discovery)",
      accept: "text/html,application/xhtml+xml",
    },
  });

  if (!res.ok) {
    return { ...p, status: "fetch_failed", httpStatus: res.status };
  }

  const html = await res.text();
  const $ = cheerio.load(html);

  // Title: og:title or h1
  const ogTitle = $('meta[property="og:title"]').attr("content");
  const h1 = $("h1").first().text().trim();
  const title = ogTitle || h1 || p.title;

  // Description: meta description or first <p>
  const metaDesc =
    $('meta[name="description"]').attr("content") ||
    $('meta[property="og:description"]').attr("content");
  const firstP = $("p").first().text().trim();
  const description = metaDesc || firstP || "";

  // Image: prefer CDN URL from og:image, twitter:image, then srcset, then src
  const ogImage =
    $('meta[property="og:image"]').attr("content") ||
    $('meta[name="twitter:image"]').attr("content");

  let imageUrl: string | null = ogImage ? absUrl(p.productUrl, ogImage) : null;

  if (!imageUrl) {
    // Try CDN img tags first
    $("img").each((_, el) => {
      if (imageUrl) return;
      const src = $(el).attr("src") ?? "";
      if (src.includes("permobilwebcdn.azureedge.net")) {
        imageUrl = absUrl(p.productUrl, src);
      }
    });
  }

  if (!imageUrl) {
    // Largest srcset from any img
    $("img").each((_, el) => {
      if (imageUrl) return;
      const srcset = $(el).attr("srcset");
      const picked = pickLargestFromSrcset(srcset);
      if (picked) imageUrl = absUrl(p.productUrl, picked);
    });
  }

  return {
    id: p.id,
    title,
    description,
    imageUrl,
    productUrl: p.productUrl,
    status: imageUrl ? "ok" : "no_image_found",
  };
}

/* ──────────── main ──────────── */

async function main() {
  const reportPath = path.resolve(
    process.cwd(),
    "scripts/scrape-report-permobil-chairs.json"
  );

  const results: any[] = [];

  for (const p of PRODUCTS) {
    console.log(`Scraping: ${p.title}`);
    try {
      const result = await scrapeProduct(p);
      results.push(result);
      console.log(
        `  ${result.status === "ok" ? "✓" : "✗"} ${result.status}${
          result.imageUrl ? ` → ${result.imageUrl}` : ""
        }`
      );
    } catch (e: any) {
      results.push({ ...p, status: "error", error: String(e?.message || e) });
      console.error(`  ✗ error: ${e?.message}`);
    }
    await sleep(600); // ~1.6 req/s — polite crawling
  }

  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2), "utf8");
  console.log(`\nDone. Report written to ${reportPath}`);
  console.log(
    "Update image fields in client/data/manualWheelchairChairs.ts with the imageUrl values."
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
