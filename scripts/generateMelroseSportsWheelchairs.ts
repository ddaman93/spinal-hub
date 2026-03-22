/**
 * Scrapes Melrose sports wheelchair pages and regenerates
 * client/data/generated/melroseSportsWheelchairs.generated.ts
 *
 * Usage:
 *   npx tsx scripts/generateMelroseSportsWheelchairs.ts
 *
 * Source: https://melrosewheelchairs.co.nz/wheelchairs/sports_wheelchairs.html
 * Requires: cheerio  (npm i -D cheerio)
 */

import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";

/* ──────────── product stubs ──────────── */

type SportsDiscipline =
  | "rugby"
  | "rugby-league"
  | "basketball"
  | "tennis"
  | "bowls"
  | "lacrosse"
  | "afl";

type ProductStub = {
  id: string;
  discipline: SportsDiscipline;
  productUrl: string;
};

const PRODUCTS: ProductStub[] = [
  { id: "melrose-sports-rhino",    discipline: "rugby",        productUrl: "https://melrosewheelchairs.co.nz/wheelchairs/rhino.html" },
  { id: "melrose-sports-warrior",  discipline: "rugby-league",  productUrl: "https://melrosewheelchairs.co.nz/wheelchairs/warrior.html" },
  { id: "melrose-sports-orion",    discipline: "basketball",    productUrl: "https://melrosewheelchairs.co.nz/wheelchairs/orion.html" },
  { id: "melrose-sports-gazelle",  discipline: "tennis",        productUrl: "https://melrosewheelchairs.co.nz/wheelchairs/gazelle.html" },
  { id: "melrose-sports-bowls",    discipline: "bowls",         productUrl: "https://melrosewheelchairs.co.nz/wheelchairs/bowls.html" },
  { id: "melrose-sports-wolverine",discipline: "lacrosse",      productUrl: "https://melrosewheelchairs.co.nz/wheelchairs/lacrosse.html" },
  { id: "melrose-sports-torpedo",  discipline: "afl",           productUrl: "https://melrosewheelchairs.co.nz/wheelchairs/torpedo.html" },
];

/* ──────────── helpers ──────────── */

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
      "user-agent": "SpinalHubBot/1.0 (sports-wheelchair-scraper)",
      accept: "text/html",
    },
  });
  if (!res.ok) return { ...stub, status: `fetch_failed:${res.status}` };

  const html = await res.text();
  const $ = cheerio.load(html);

  // Title: prefer H2, fall back to H1 / og:title
  const h2 = $("h2").first().text().trim();
  const h1 = $("h1").first().text().trim();
  const ogTitle = $('meta[property="og:title"]').attr("content")?.trim();
  const title = h2 || h1 || ogTitle || stub.id;

  // Description: first <p> with meaningful length
  let description = "";
  $("p").each((_, el) => {
    if (description) return;
    const text = $(el).text().trim();
    if (text.length > 40) description = text;
  });

  // Image: og:image → slider → first non-junk img
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

/* ──────────── TS file renderer ──────────── */

function renderTs(results: any[]): string {
  const items = results
    .filter((r) => r.status === "ok")
    .map((r) => `  {
    id: ${JSON.stringify(r.id)},
    brand: "melrose",
    discipline: ${JSON.stringify(r.discipline)},
    title: ${JSON.stringify(r.title)},
    description: ${JSON.stringify(r.description)},
    image: ${JSON.stringify(r.image)},
    productUrl: ${JSON.stringify(r.productUrl)},
    category: "sports",
    tags: ["brand:melrose", "sport:${r.discipline}", "category:sports"],
  },`)
    .join("\n");

  return `/**
 * AUTO-GENERATED — do not edit by hand.
 * Re-generate with: npx tsx scripts/generateMelroseSportsWheelchairs.ts
 * Source: https://melrosewheelchairs.co.nz/wheelchairs/sports_wheelchairs.html
 */

import type { SportsWheelchair } from "@/data/sportsWheelchairs";

export const MELROSE_SPORTS_WHEELCHAIRS_GENERATED: SportsWheelchair[] = [
${items}
];
`;
}

/* ──────────── main ──────────── */

async function main() {
  const outPath = path.resolve(
    process.cwd(),
    "client/data/generated/melroseSportsWheelchairs.generated.ts"
  );
  const reportPath = path.resolve(
    process.cwd(),
    "scripts/scrape-report-melrose-sports.json"
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
