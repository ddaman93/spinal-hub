/**
 * Scrapes Melrose airline wheelchair pages and regenerates
 * client/data/generated/melroseAirlineWheelchairs.generated.ts
 *
 * Usage:
 *   npx tsx scripts/generateMelroseAirlineWheelchairs.ts
 *
 * Source: https://melrosewheelchairs.co.nz/wheelchairs/
 * Requires: cheerio  (npm i -D cheerio)
 */

import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";

type AirlineType =
  | "aisle-fixed"
  | "onboard-folding"
  | "onboard-lift"
  | "terminal-transit";

type ProductStub = {
  id: string;
  airlineType: AirlineType;
  productUrl: string;
};

const PRODUCTS: ProductStub[] = [
  { id: "melrose-airline-fixed-aisle",      airlineType: "aisle-fixed",      productUrl: "https://melrosewheelchairs.co.nz/wheelchairs/fixed_frame_aisle_chair.html" },
  { id: "melrose-airline-onboard-folding",  airlineType: "onboard-folding",  productUrl: "https://melrosewheelchairs.co.nz/wheelchairs/aisle_onboard_chair.html" },
  { id: "melrose-airline-onboard-lift",     airlineType: "onboard-lift",     productUrl: "https://melrosewheelchairs.co.nz/wheelchairs/aisle_onboard_lift_chair.html" },
  { id: "melrose-airline-passenger-transit",airlineType: "terminal-transit",  productUrl: "https://melrosewheelchairs.co.nz/wheelchairs/passenger_transit.html" },
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function absUrl(base: string, rel: string): string | null {
  try { return new URL(rel, base).toString(); } catch { return null; }
}

function isNavOrIcon(src: string): boolean {
  const lower = src.toLowerCase();
  return (
    lower.includes("logo") || lower.includes("icon") || lower.includes("button") ||
    lower.includes("nav")  || lower.includes("banner") || lower.includes("pixel") ||
    lower.includes("spacer") || lower.endsWith(".gif")
  );
}

async function scrapePage(stub: ProductStub) {
  const res = await fetch(stub.productUrl, {
    redirect: "follow",
    headers: {
      "user-agent": "SpinalHubBot/1.0 (airline-wheelchair-scraper)",
      accept: "text/html",
    },
  });
  if (!res.ok) return { ...stub, status: `fetch_failed:${res.status}` };

  const html = await res.text();
  const $ = cheerio.load(html);

  const h2 = $("h2").first().text().trim();
  const h1 = $("h1").first().text().trim();
  const ogTitle = $('meta[property="og:title"]').attr("content")?.trim();
  const title = h2 || h1 || ogTitle || stub.id;

  let description = "";
  $("p").each((_, el) => {
    if (description) return;
    const text = $(el).text().trim();
    if (text.length > 40) description = text;
  });

  let image = "";
  const og = $('meta[property="og:image"]').attr("content");
  if (og) image = absUrl(stub.productUrl, og) ?? "";

  if (!image) {
    $("img").each((_, el) => {
      if (image) return;
      const src = $(el).attr("src") ?? "";
      if (src.includes("slider") && !isNavOrIcon(src)) {
        image = absUrl(stub.productUrl, src) ?? "";
      }
    });
  }

  if (!image) {
    $("img").each((_, el) => {
      if (image) return;
      const src = $(el).attr("src") ?? "";
      if (src && !src.startsWith("data:") && !isNavOrIcon(src)) {
        image = absUrl(stub.productUrl, src) ?? "";
      }
    });
  }

  return { ...stub, title, description, image, status: "ok" };
}

function renderTs(results: any[]): string {
  const items = results
    .filter((r) => r.status === "ok")
    .map((r) => `  {
    id: ${JSON.stringify(r.id)},
    brand: "melrose",
    airlineType: ${JSON.stringify(r.airlineType)},
    title: ${JSON.stringify(r.title)},
    description: ${JSON.stringify(r.description)},
    image: ${JSON.stringify(r.image)},
    url: ${JSON.stringify(r.productUrl)},
    category: "airline",
    tags: ["brand:melrose", "airline:${r.airlineType}", "category:airline"],
  },`)
    .join("\n");

  return `/**
 * AUTO-GENERATED — do not edit by hand.
 * Re-generate with: npx tsx scripts/generateMelroseAirlineWheelchairs.ts
 * Source: https://melrosewheelchairs.co.nz/wheelchairs/
 */

import type { AirlineWheelchairProduct } from "@/data/airlineWheelchairs";

export const MELROSE_AIRLINE_WHEELCHAIRS_GENERATED: AirlineWheelchairProduct[] = [
${items}
];
`;
}

async function main() {
  const outPath = path.resolve(
    process.cwd(),
    "client/data/generated/melroseAirlineWheelchairs.generated.ts"
  );
  const reportPath = path.resolve(
    process.cwd(),
    "scripts/scrape-report-melrose-airline.json"
  );

  const results: any[] = [];

  for (const stub of PRODUCTS) {
    console.log(`Scraping: ${stub.id}`);
    try {
      const result = await scrapePage(stub);
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
