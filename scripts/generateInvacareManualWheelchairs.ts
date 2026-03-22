/**
 * Scrapes Invacare NZ manual wheelchair pages and (re)generates
 * client/data/generated/invacareManualWheelchairs.generated.ts
 *
 * Usage:
 *   npx tsx scripts/generateInvacareManualWheelchairs.ts
 *
 * Data source: https://invacareonline.co.nz/collections/manual-mobility
 * Requires: cheerio  (npm i -D cheerio)
 */

import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";

/* ──────────── types ──────────── */

type Subcategory = "active" | "standard" | "tilt-in-space" | "paediatric" | "other";

type ProductStub = {
  id: string;
  manufacturerLine: string;
  subcategory: Subcategory;
  productUrl: string;
};

/* ──────────── filter rules ──────────── */

const EXCLUDE_KEYWORDS = [
  "alber", "e-motion", "emotion", "smoov", "power assist", "power add",
  "add-on", "accessory", "cushion", "tyre", "tire", "rim", "battery",
  "charger", "wheel ",
];

function isManualChair(title: string): boolean {
  const lower = title.toLowerCase();
  return !EXCLUDE_KEYWORDS.some((kw) => lower.includes(kw));
}

function assignSubcategory(title: string): Subcategory {
  const lower = title.toLowerCase();
  if (/k[uü]schall|compact attract|champion|k-series|ksl/.test(lower)) return "active";
  if (/rea|azalea/.test(lower)) return "tilt-in-space";
  if (/jnr|junior|kids|paediatric|pediatric/.test(lower)) return "paediatric";
  if (/action|1r|3ng/.test(lower)) return "standard";
  return "other";
}

function toId(url: string): string {
  return "invacare-" + url.split("/products/")[1].replace(/\//g, "").replace(/_/g, "-");
}

/* ──────────── helpers ──────────── */

const COLLECTION_URL = "https://invacareonline.co.nz/collections/manual-mobility";
const BASE_URL = "https://invacareonline.co.nz";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function absUrl(rel: string): string {
  return rel.startsWith("http") ? rel : BASE_URL + rel;
}

/* ──────────── scrape ──────────── */

async function fetchPage(url: string) {
  const res = await fetch(url, {
    redirect: "follow",
    headers: {
      "user-agent": "SpinalHubBot/1.0 (wheelchair-scraper)",
      accept: "text/html",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

async function scrapeCollection(): Promise<ProductStub[]> {
  const html = await fetchPage(COLLECTION_URL);
  const $ = cheerio.load(html);
  const stubs: ProductStub[] = [];

  $("a[href*='/products/']").each((_, el) => {
    const href = $(el).attr("href") ?? "";
    if (!href.includes("/collections/")) return;
    const title = $(el).text().trim() || href;
    if (!isManualChair(title)) return;

    const fullUrl = absUrl(href);
    const id = toId(fullUrl);
    if (stubs.find((s) => s.id === id)) return; // dedup

    const mfr = /k[uü]schall/i.test(title) ? "Küschall"
      : /rea|azalea/i.test(title) ? "Rea"
      : "Invacare";

    stubs.push({
      id,
      manufacturerLine: mfr,
      subcategory: assignSubcategory(title),
      productUrl: fullUrl,
    });
  });

  return stubs;
}

async function scrapeProduct(stub: ProductStub) {
  const html = await fetchPage(stub.productUrl);
  const $ = cheerio.load(html);

  const title = $("h1").first().text().trim() || stub.id;

  let description = "";
  $("p").each((_, el) => {
    if (description) return;
    const text = $(el).text().trim();
    if (text.length > 40) description = text;
  });

  // Image: prefer og:image, then first product media image
  let image = $('meta[property="og:image"]').attr("content") ?? "";
  if (!image) {
    $("img").each((_, el) => {
      if (image) return;
      const src = $(el).attr("src") ?? "";
      if (src && !src.startsWith("data:") && src.includes("/products/")) {
        image = absUrl(src);
      }
    });
  }

  return { ...stub, title, description, image, status: "ok" };
}

/* ──────────── TS file renderer ──────────── */

function renderTs(results: any[]): string {
  const items = results
    .filter((r) => r.status === "ok")
    .map((r) => {
      return `  {
    id: ${JSON.stringify(r.id)},
    brand: "invacare",
    manufacturerLine: ${JSON.stringify(r.manufacturerLine)},
    frameType: "folding",
    subcategory: ${JSON.stringify(r.subcategory)},
    title: ${JSON.stringify(r.title)},
    description: ${JSON.stringify(r.description)},
    image: ${JSON.stringify(r.image)},
    tags: ["brand:invacare", "line:${r.manufacturerLine.toLowerCase().replace(/[^a-z0-9]/g, "")}", "subcategory:${r.subcategory}", "type:folding"],
    category: "manual",
    productUrl: ${JSON.stringify(r.productUrl)},
  },`;
    })
    .join("\n");

  return `/**
 * AUTO-GENERATED — do not edit by hand.
 * Re-generate with: npx tsx scripts/generateInvacareManualWheelchairs.ts
 * Source: https://invacareonline.co.nz/collections/manual-mobility
 */

import type { ManualWheelchair } from "@/data/manualWheelchairChairs";

export const INVACARE_MANUAL_CHAIRS_GENERATED: ManualWheelchair[] = [
${items}
];
`;
}

/* ──────────── main ──────────── */

async function main() {
  const outPath = path.resolve(
    process.cwd(),
    "client/data/generated/invacareManualWheelchairs.generated.ts"
  );
  const reportPath = path.resolve(
    process.cwd(),
    "scripts/scrape-report-invacare-chairs.json"
  );

  console.log("Fetching collection…");
  const stubs = await scrapeCollection();
  console.log(`Found ${stubs.length} manual chair product(s).`);

  const results: any[] = [];

  for (const stub of stubs) {
    console.log(`Scraping: ${stub.id}`);
    try {
      const result = await scrapeProduct(stub);
      results.push(result);
      const r = result as any;
      console.log(`  ${r.status === "ok" ? "✓" : "✗"} ${r.status}${r.image ? ` → ${r.image}` : ""}`);
    } catch (e: any) {
      results.push({ ...stub, status: "error", error: String(e?.message || e) });
      console.error(`  ✗ ${e?.message}`);
    }
    await sleep(700);
  }

  fs.writeFileSync(outPath, renderTs(results), "utf8");
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2), "utf8");
  console.log(`\nGenerated: ${outPath}`);
  console.log(`Report:    ${reportPath}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
