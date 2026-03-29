import type { Request, Response } from "express";
import { XMLParser } from "fast-xml-parser";

/* ───────────────── types ───────────────── */

export type ArticleCategory =
  | "Breakthrough"
  | "Clinical Trial"
  | "Rehab"
  | "Research"
  | "General";

export type NewsArticle = {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  summary: string;
  category: ArticleCategory;
  imageUrl?: string;
};

type RawItem = {
  title?: string;
  link?: string;
  pubDate?: string;
  guid?: string;
  description?: string;
  "content:encoded"?: string;
  "media:content"?: { "@_url"?: string };
  "media:thumbnail"?: { "@_url"?: string };
  enclosure?: { "@_url"?: string; "@_type"?: string };
  source?: { "#text"?: string };
};

type CacheEntry = {
  data: NewsArticle[];
  timestamp: number;
};

/* ───────────────── constants ───────────────── */

const CACHE_TTL = 30 * 60 * 1000; // 30 minutes
let cache: CacheEntry | null = null;

const FEED_URLS = [
  // ScienceDaily — dedicated SCI section, includes article images natively
  "https://www.sciencedaily.com/rss/health_medicine/spinal_cord_injury.xml",
  // Google News — broad coverage, no images but good for recency
  'https://news.google.com/rss/search?q=("spinal+cord+injury"+OR+SCI)+recovery+treatment&hl=en-US&gl=US&ceid=US:en',
  "https://news.google.com/rss/search?q=spinal+cord+injury+clinical+trial&hl=en-US&gl=US&ceid=US:en",
  "https://news.google.com/rss/search?q=paralysis+research+spinal+cord&hl=en-US&gl=US&ceid=US:en",
];

const ANIMAL_KEYWORDS = ["rat ", "rats ", "mouse", "mice", "zebrafish", " rodent", "murine"];

const RELEVANCE_KEYWORDS = [
  "spinal cord",
  "paralysis",
  "quadriplegia",
  "tetraplegia",
  "clinical trial",
  "rehabilitation",
];

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });

/* ───────────────── pipeline ───────────────── */

async function fetchFeed(url: string): Promise<RawItem[]> {
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const xml = await res.text();
    const parsed = parser.parse(xml);
    const items = parsed?.rss?.channel?.item ?? [];
    return Array.isArray(items) ? items : items ? [items] : [];
  } catch {
    return [];
  }
}

async function fetchAllFeeds(): Promise<RawItem[]> {
  const results = await Promise.all(FEED_URLS.map(fetchFeed));
  return results.flat();
}

function filterRelevantArticles(items: RawItem[]): RawItem[] {
  return items.filter((item) => {
    const text = `${item.title ?? ""} ${item.description ?? ""}`.toLowerCase();
    const hasAnimal = ANIMAL_KEYWORDS.some((kw) => text.includes(kw));
    if (hasAnimal) return false;
    return RELEVANCE_KEYWORDS.some((kw) => text.includes(kw));
  });
}

function deduplicateArticles(items: RawItem[]): RawItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.link ?? item.guid ?? item.title ?? "";
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function sortByDate(items: RawItem[]): RawItem[] {
  return [...items].sort((a, b) => {
    const da = new Date(a.pubDate ?? 0).getTime();
    const db = new Date(b.pubDate ?? 0).getTime();
    return db - da;
  });
}

function categorizeArticle(item: RawItem): ArticleCategory {
  const text = `${item.title ?? ""} ${item.description ?? ""}`.toLowerCase();

  if (
    text.includes("clinical trial") ||
    text.includes("phase 1") ||
    text.includes("phase 2") ||
    text.includes("phase 3")
  ) {
    return "Clinical Trial";
  }

  if (
    text.includes("implant") ||
    text.includes("device") ||
    text.includes("stimulator") ||
    text.includes("breakthrough") ||
    text.includes("first-ever") ||
    text.includes("restored")
  ) {
    return "Breakthrough";
  }

  if (
    text.includes("rehabilitation") ||
    text.includes("therapy") ||
    text.includes("physio") ||
    text.includes("exercise") ||
    text.includes("recovery program")
  ) {
    return "Rehab";
  }

  if (
    text.includes("study") ||
    text.includes("research") ||
    text.includes("scientists") ||
    text.includes("findings") ||
    text.includes("published")
  ) {
    return "Research";
  }

  return "General";
}

function extractImage(item: RawItem): string | undefined {
  // 1. media:content (most common in RSS)
  if (item["media:content"]?.["@_url"]) return item["media:content"]["@_url"];

  // 2. media:thumbnail
  if (item["media:thumbnail"]?.["@_url"]) return item["media:thumbnail"]["@_url"];

  // 3. enclosure — ScienceDaily and others use this for article images
  const enc = item.enclosure?.["@_url"];
  if (enc && /\.(jpe?g|png|webp|gif)/i.test(enc)) return enc;

  // 4. <img> tag inside content:encoded or description HTML
  const html = item["content:encoded"] ?? item.description ?? "";
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (match?.[1]) return match[1];

  return undefined;
}

function cleanArticle(item: RawItem, index: number): NewsArticle {
  const rawTitle: string = item.title ?? "Untitled";
  const dashIdx = rawTitle.lastIndexOf(" - ");
  const title = dashIdx !== -1 ? rawTitle.slice(0, dashIdx).trim() : rawTitle;
  const source =
    item.source?.["#text"] ??
    (dashIdx !== -1 ? rawTitle.slice(dashIdx + 3).trim() : "Google News");

  return {
    id: `${item.guid ?? item.link ?? title}-${index}`,
    title,
    source,
    url: item.link ?? "",
    publishedAt: item.pubDate ?? "",
    summary: item.description ? stripHtml(item.description) : "",
    category: categorizeArticle(item),
    imageUrl: extractImage(item),
  };
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}


/* ───────────────── route handler ───────────────── */

function isCacheValid(): boolean {
  return cache !== null && Date.now() - cache.timestamp < CACHE_TTL;
}

export async function getSciNews(_req: Request, res: Response): Promise<void> {
  try {
    if (isCacheValid() && cache) {
      res.json(cache.data);
      return;
    }

    const raw = await fetchAllFeeds();
    const filtered = filterRelevantArticles(raw);
    const deduped = deduplicateArticles(filtered);
    const sorted = sortByDate(deduped);
    const articles = sorted.slice(0, 30).map(cleanArticle);

    cache = { data: articles, timestamp: Date.now() };
    res.json(articles);
  } catch (error) {
    console.error("SCI news API error:", error);
    // Return cached data if available, even if stale
    if (cache) {
      res.json(cache.data);
      return;
    }
    res.status(500).json({ error: "Internal server error" });
  }
}
