/**
 * Scrapes the Permobil NZ brand page for power wheelchairs and regenerates
 * client/data/generated/permobilPowerWheelchairs.generated.ts
 *
 * Usage:
 *   npx tsx scripts/generatePermobilPowerWheelchairs.ts
 *
 * Source: https://www.permobil.com/en-nz/our-brands/permobil
 * Requires: cheerio  (npm i -D cheerio)
 */

import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";

const BASE_URL = "https://www.permobil.com";
const BRAND_PAGE = `${BASE_URL}/en-nz/our-brands/permobil`;
const CDN = "https://permobilwebcdn.azureedge.net";

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

async function scrapeBrandPage(): Promise<{ title: string; url: string; image: string }[]> {
  const html = await fetchHtml(BRAND_PAGE);
  const $ = cheerio.load(html);
  const products: { title: string; url: string; image: string }[] = [];

  // Permobil uses JSON or tile cards — try to extract product links
  $("a[href*='/products/power-wheelchairs/']").each((_, el) => {
    const href = $(el).attr("href") ?? "";
    if (!href || href.includes("?") || href.includes("/functions/")) return;

    const fullUrl = href.startsWith("http") ? href : BASE_URL + href;
    const title = $(el).find("img").attr("alt") ?? $(el).text().trim();
    const imgSrc = $(el).find("img").attr("src") ?? "";
    const image = imgSrc.startsWith("http") ? imgSrc : imgSrc ? CDN + imgSrc : "";

    if (products.find((p) => p.url === fullUrl)) return; // dedup
    if (title) products.push({ title, url: fullUrl, image });
  });

  return products;
}

async function scrapeProduct(url: string) {
  try {
    const html = await fetchHtml(url);
    const $ = cheerio.load(html);

    const title = $("h1").first().text().trim()
      || $('meta[property="og:title"]').attr("content")?.trim()
      || url.split("/").filter(Boolean).pop()!;

    let description = "";
    $("p").each((_, el) => {
      if (description) return;
      const text = $(el).text().trim();
      if (text.length > 50) description = text;
    });

    let image = $('meta[property="og:image"]').attr("content") ?? "";

    return { title, description, image, status: "ok" };
  } catch (e: any) {
    return { title: "", description: "", image: "", status: `error:${e.message}` };
  }
}

function toId(url: string): string {
  const slug = url.split("/products/power-wheelchairs/")[1]?.replace(/\//g, "") ?? url;
  return "permobil-power-" + slug.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
}

function renderTs(products: any[]): string {
  const items = products
    .filter((p) => p.status === "ok")
    .map((p) => `  {
    id: ${JSON.stringify(p.id)},
    brand: "permobil",
    title: ${JSON.stringify(p.title)},
    description: ${JSON.stringify(p.description)},
    image: ${JSON.stringify(p.image)},
    productUrl: ${JSON.stringify(p.url)},
    category: "power",
    tags: ["brand:permobil", "type:power"],
  },`)
    .join("\n");

  return `/**
 * AUTO-GENERATED — do not edit by hand.
 * Re-generate with: npx tsx scripts/generatePermobilPowerWheelchairs.ts
 * Source: https://www.permobil.com/en-nz/our-brands/permobil
 */

import type { PowerWheelchair } from "@/data/powerWheelchairs";

export const PERMOBIL_POWER_WHEELCHAIRS_GENERATED: PowerWheelchair[] = [
${items}
];
`;
}

async function main() {
  const outPath = path.resolve(
    process.cwd(),
    "client/data/generated/permobilPowerWheelchairs.generated.ts"
  );
  const reportPath = path.resolve(
    process.cwd(),
    "scripts/scrape-report-permobil-power.json"
  );

  console.log("Fetching Permobil NZ brand page…");
  const stubs = await scrapeBrandPage();
  console.log(`Found ${stubs.length} power wheelchair link(s).`);

  const results: any[] = [];
  for (const stub of stubs) {
    console.log(`Scraping: ${stub.url}`);
    const detail = await scrapeProduct(stub.url);
    const id = toId(stub.url);
    const merged = {
      id,
      url: stub.url,
      title: detail.title || stub.title,
      description: detail.description,
      image: detail.image || stub.image,
      status: detail.status,
    };
    results.push(merged);
    console.log(`  ${detail.status === "ok" ? "✓" : "✗"} ${detail.status}`);
    await sleep(700);
  }

  fs.writeFileSync(outPath, renderTs(results), "utf8");
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2), "utf8");
  console.log(`\nGenerated: ${outPath}`);
  console.log(`Report:    ${reportPath}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
