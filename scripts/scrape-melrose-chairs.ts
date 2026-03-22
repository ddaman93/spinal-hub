/**
 * Scrapes Melrose wheelchair product pages and (re)generates
 * client/data/generated/melroseManualWheelchairs.generated.ts
 *
 * Usage:
 *   npx tsx scripts/scrape-melrose-chairs.ts
 *
 * Requires: cheerio  (npm i -D cheerio)
 */

import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";

/* ──────────── product stubs ──────────── */

type ProductStub = {
  id: string;
  frameType: "fixed" | "folding";
  manufacturerLine: string;
  productUrl: string;
};

const PRODUCTS: ProductStub[] = [
  // Fixed frame
  { id: "melrose-scorpion",   frameType: "fixed",   manufacturerLine: "Melrose",  productUrl: "https://melrosewheelchairs.co.nz/wheelchairs/scorpion.html" },
  { id: "melrose-hawk",       frameType: "fixed",   manufacturerLine: "Melrose",  productUrl: "https://melrosewheelchairs.co.nz/wheelchairs/hawk.html" },
  { id: "melrose-hawk-ultra", frameType: "fixed",   manufacturerLine: "Melrose",  productUrl: "https://melrosewheelchairs.co.nz/wheelchairs/hawk_ultra.html" },
  { id: "melrose-piranha",    frameType: "fixed",   manufacturerLine: "Melrose",  productUrl: "https://melrosewheelchairs.co.nz/wheelchairs/piranha.html" },
  { id: "melrose-hornet",     frameType: "fixed",   manufacturerLine: "Melrose",  productUrl: "https://melrosewheelchairs.co.nz/wheelchairs/hornet.html" },
  { id: "melrose-stallion",   frameType: "fixed",   manufacturerLine: "Melrose",  productUrl: "https://melrosewheelchairs.co.nz/wheelchairs/stallion.html" },
  { id: "melrose-zenit-r",    frameType: "fixed",   manufacturerLine: "Ottobock", productUrl: "https://melrosewheelchairs.co.nz/wheelchairs/zenit_r.html" },
  // Folding frame
  { id: "melrose-condor",     frameType: "folding", manufacturerLine: "Melrose",  productUrl: "https://melrosewheelchairs.co.nz/wheelchairs/condor.html" },
  { id: "melrose-korimako",   frameType: "folding", manufacturerLine: "Melrose",  productUrl: "https://melrosewheelchairs.co.nz/wheelchairs/korimako.html" },
  { id: "melrose-zenit",      frameType: "folding", manufacturerLine: "Ottobock", productUrl: "https://melrosewheelchairs.co.nz/wheelchairs/zenit.html" },
  { id: "melrose-avantgarde", frameType: "folding", manufacturerLine: "Ottobock", productUrl: "https://melrosewheelchairs.co.nz/wheelchairs/avantgarde.html" },
];

/* ──────────── helpers ──────────── */

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function absUrl(base: string, rel: string): string | null {
  try { return new URL(rel, base).toString(); } catch { return null; }
}

function isNavOrIcon(src: string): boolean {
  const lower = src.toLowerCase();
  return (
    lower.includes("logo") ||
    lower.includes("icon") ||
    lower.includes("button") ||
    lower.includes("nav") ||
    lower.includes("banner") ||
    lower.includes("pixel") ||
    lower.includes("spacer") ||
    lower.endsWith(".gif")
  );
}

async function scrapePage(stub: ProductStub) {
  const res = await fetch(stub.productUrl, {
    redirect: "follow",
    headers: {
      "user-agent": "SpinalHubBot/1.0 (wheelchair-scraper)",
      accept: "text/html",
    },
  });

  if (!res.ok) return { ...stub, status: `fetch_failed:${res.status}` };

  const html = await res.text();
  const $ = cheerio.load(html);

  // Title: prefer H2 (Melrose uses H2 for product names), fall back to H1 / og:title
  const h2 = $("h2").first().text().trim();
  const h1 = $("h1").first().text().trim();
  const ogTitle = $('meta[property="og:title"]').attr("content")?.trim();
  const title = h2 || h1 || ogTitle || stub.id;

  // Description: first <p> after the heading block
  let description = "";
  $("p").each((_, el) => {
    if (description) return;
    const text = $(el).text().trim();
    if (text.length > 40) description = text;
  });

  // Image: prefer slider images, skip nav/icon junk
  let image = "";

  // 1) og:image
  const og = $('meta[property="og:image"]').attr("content");
  if (og) image = absUrl(stub.productUrl, og) ?? "";

  // 2) slider img
  if (!image) {
    $("img").each((_, el) => {
      if (image) return;
      const src = $(el).attr("src") ?? "";
      if (src.includes("slider") && !isNavOrIcon(src)) {
        image = absUrl(stub.productUrl, src) ?? "";
      }
    });
  }

  // 3) any non-junk img
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
  const items = (results as any[])
    .filter((r) => r.status === "ok")
    .map((r: any) => {
      const frameLabel = r.frameType === "fixed" ? "fixed" : "folding";
      const tags = [
        `"brand:melrose"`,
        `"type:${r.frameType}"`,
        r.manufacturerLine !== "Melrose" ? `"line:${r.manufacturerLine.toLowerCase()}"` : null,
      ]
        .filter(Boolean)
        .join(", ");

      return `  {
    id: "${r.id}",
    brand: "melrose",
    manufacturerLine: "${r.manufacturerLine}",
    frameType: "${frameLabel}",
    title: ${JSON.stringify(r.title)},
    description: ${JSON.stringify(r.description)},
    image: ${JSON.stringify(r.image)},
    tags: [${tags}],
    category: "manual",
    productUrl: "${r.productUrl}",
  },`;
    })
    .join("\n");

  return `/**
 * AUTO-GENERATED — do not edit by hand.
 * Re-generate with: npx tsx scripts/scrape-melrose-chairs.ts
 * Source: https://melrosewheelchairs.co.nz/wheelchairs/
 */

import type { ManualWheelchair } from "@/data/manualWheelchairChairs";

export const MELROSE_MANUAL_CHAIRS_GENERATED: ManualWheelchair[] = [
${items}
];
`;
}

/* ──────────── main ──────────── */

async function main() {
  const outPath = path.resolve(
    process.cwd(),
    "client/data/generated/melroseManualWheelchairs.generated.ts"
  );
  const reportPath = path.resolve(
    process.cwd(),
    "scripts/scrape-report-melrose-chairs.json"
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
