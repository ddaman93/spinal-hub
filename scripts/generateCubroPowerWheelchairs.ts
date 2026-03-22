/**
 * Scrapes Cubro NZ powered wheelchairs and classifies by brand (Quickie / Magic Mobility).
 * Regenerates:
 *   client/data/generated/quickiePowerWheelchairs.generated.ts
 *   client/data/generated/magicMobilityPowerWheelchairs.generated.ts
 *
 * Usage:
 *   npx tsx scripts/generateCubroPowerWheelchairs.ts
 *
 * Source: https://www.cubro.co.nz/healthcare-products/powered-wheelchairs
 * Requires: cheerio  (npm i -D cheerio)
 *
 * Brand classification heuristics:
 *   Quickie      → title contains Quickie, Q300, Q400, Q500, Q700, Alltrack, TA iQ
 *   Magic Mobility → title contains Magic, 360, Extreme X8, Frontier, Bounder (Magic models)
 *   Otherwise    → UNCLASSIFIED (logged, not included)
 *
 * Override file: scripts/overrides/cubroPowerBrandOverrides.ts
 *   Maps product URL → brand to handle any misclassified items.
 */

import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";

/* ──────────── types ──────────── */

type Brand = "quickie" | "magic-mobility";

type ProductResult = {
  id: string;
  brand: Brand;
  title: string;
  description: string;
  image: string;
  productUrl: string;
  status: string;
};

/* ──────────── brand overrides ──────────── */

let URL_BRAND_OVERRIDES: Record<string, Brand> = {};
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const overrides = require("./overrides/cubroPowerBrandOverrides");
  URL_BRAND_OVERRIDES = overrides.URL_BRAND_OVERRIDES ?? {};
  console.log(`Loaded ${Object.keys(URL_BRAND_OVERRIDES).length} brand override(s).`);
} catch {
  // No overrides file yet — that's fine
}

/* ──────────── classification ──────────── */

function classifyBrand(title: string, url: string): Brand | null {
  if (URL_BRAND_OVERRIDES[url]) return URL_BRAND_OVERRIDES[url];

  const lower = title.toLowerCase();

  if (
    /quickie|alltrack|ta\s*iq|q300|q400|q500|q700/.test(lower)
  ) return "quickie";

  if (
    /magic|frontier|extreme\s*x8|bounder/.test(lower)
  ) return "magic-mobility";

  return null;
}

/* ──────────── scraping ──────────── */

const BASE_URL = "https://www.cubro.co.nz";
const COLLECTION_URL = `${BASE_URL}/healthcare-products/powered-wheelchairs`;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    redirect: "follow",
    headers: {
      "user-agent": "SpinalHubBot/1.0 (power-wheelchair-scraper)",
      accept: "text/html",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

async function scrapeCollection(): Promise<{ title: string; url: string }[]> {
  const html = await fetchHtml(COLLECTION_URL);
  const $ = cheerio.load(html);
  const products: { title: string; url: string }[] = [];

  $("a[href*='/healthcare-products/powered-wheelchairs/']").each((_, el) => {
    const href = $(el).attr("href") ?? "";
    if (!href || href === COLLECTION_URL || href.endsWith("/powered-wheelchairs")) return;

    const url = href.startsWith("http") ? href : BASE_URL + href;
    const title = $(el).text().trim() || url.split("/").filter(Boolean).pop()!;

    if (products.find((p) => p.url === url)) return;
    products.push({ title, url });
  });

  return products;
}

async function scrapeProduct(url: string): Promise<{ title: string; description: string; image: string }> {
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);

  const title = $("h1").first().text().trim()
    || $('meta[property="og:title"]').attr("content")?.trim()
    || "";

  let description = "";
  $("p").each((_, el) => {
    if (description) return;
    const text = $(el).text().trim();
    if (text.length > 50) description = text;
  });

  const image = $('meta[property="og:image"]').attr("content")
    ?? $("img[src*='/products/']").first().attr("src")
    ?? "";

  return { title, description, image };
}

function toId(brand: Brand, url: string): string {
  const slug = url.split("/powered-wheelchairs/")[1]?.replace(/\//g, "") ?? url;
  return brand + "-power-" + slug.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
}

/* ──────────── renderer ──────────── */

function renderTs(brand: Brand, products: ProductResult[]): string {
  const exportName = brand === "quickie"
    ? "QUICKIE_POWER_WHEELCHAIRS_GENERATED"
    : "MAGIC_MOBILITY_POWER_WHEELCHAIRS_GENERATED";

  const items = products
    .filter((p) => p.status === "ok")
    .map((p) => `  {
    id: ${JSON.stringify(p.id)},
    brand: ${JSON.stringify(brand)},
    title: ${JSON.stringify(p.title)},
    description: ${JSON.stringify(p.description)},
    image: ${JSON.stringify(p.image)},
    productUrl: ${JSON.stringify(p.productUrl)},
    category: "power",
    tags: ["brand:${brand}", "type:power"],
  },`)
    .join("\n");

  return `/**
 * AUTO-GENERATED — do not edit by hand.
 * Re-generate with: npx tsx scripts/generateCubroPowerWheelchairs.ts
 * Source: https://www.cubro.co.nz/healthcare-products/powered-wheelchairs
 */

import type { PowerWheelchair } from "@/data/powerWheelchairs";

export const ${exportName}: PowerWheelchair[] = [
${items}
];
`;
}

/* ──────────── main ──────────── */

async function main() {
  console.log("Fetching Cubro powered wheelchairs collection…");
  const stubs = await scrapeCollection();
  console.log(`Found ${stubs.length} product link(s).`);

  const quickie: ProductResult[] = [];
  const magic: ProductResult[] = [];
  const unclassified: { title: string; url: string }[] = [];

  for (const stub of stubs) {
    const brand = classifyBrand(stub.title, stub.url);
    if (!brand) {
      unclassified.push(stub);
      console.log(`  UNCLASSIFIED: "${stub.title}"  →  ${stub.url}`);
      continue;
    }

    console.log(`Scraping [${brand}]: ${stub.url}`);
    try {
      const detail = await scrapeProduct(stub.url);
      const result: ProductResult = {
        id: toId(brand, stub.url),
        brand,
        title: detail.title || stub.title,
        description: detail.description,
        image: detail.image,
        productUrl: stub.url,
        status: "ok",
      };
      if (brand === "quickie") quickie.push(result);
      else magic.push(result);
      console.log(`  ✓ ok  image=${result.image || "(none)"}`);
    } catch (e: any) {
      console.error(`  ✗ ${e.message}`);
    }
    await sleep(700);
  }

  if (unclassified.length > 0) {
    console.log("\n⚠ UNCLASSIFIED items (add to scripts/overrides/cubroPowerBrandOverrides.ts):");
    unclassified.forEach((u) => console.log(`  "${u.title}"  ${u.url}`));
  }

  // Write outputs
  const quickiePath = path.resolve(process.cwd(), "client/data/generated/quickiePowerWheelchairs.generated.ts");
  const magicPath   = path.resolve(process.cwd(), "client/data/generated/magicMobilityPowerWheelchairs.generated.ts");
  const reportPath  = path.resolve(process.cwd(), "scripts/scrape-report-cubro-power.json");

  fs.writeFileSync(quickiePath, renderTs("quickie", quickie), "utf8");
  fs.writeFileSync(magicPath,   renderTs("magic-mobility", magic), "utf8");
  fs.writeFileSync(reportPath,  JSON.stringify({ quickie, magic, unclassified }, null, 2), "utf8");

  console.log(`\nGenerated: ${quickiePath}`);
  console.log(`Generated: ${magicPath}`);
  console.log(`Report:    ${reportPath}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
