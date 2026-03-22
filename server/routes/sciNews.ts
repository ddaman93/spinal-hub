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
  enclosure?: { "@_url"?: string };
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
  'https://news.google.com/rss/search?q=("spinal+cord+injury"+OR+SCI)+recovery+treatment&hl=en-NZ&gl=NZ&ceid=NZ:en',
  "https://news.google.com/rss/search?q=spinal+cord+injury+clinical+trial&hl=en-NZ&gl=NZ&ceid=NZ:en",
  "https://news.google.com/rss/search?q=paralysis+research+spinal+cord&hl=en-NZ&gl=NZ&ceid=NZ:en",
  "https://news.google.com/rss/search?q=spinal+cord+injury+rehabilitation+therapy&hl=en-NZ&gl=NZ&ceid=NZ:en",
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

  // 3. enclosure (podcast-style attachments sometimes used for images)
  if (item.enclosure?.["@_url"]) return item.enclosure["@_url"];

  // 4. <img> tag inside content:encoded or description HTML
  const html = item["content:encoded"] ?? item.description ?? "";
  const match = html.match(/<img[^>]+src="([^"]+)"/);
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

async function fetchOgImage(url: string): Promise<string | undefined> {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" },
    });
    clearTimeout(id);
    if (!res.ok) return undefined;
    const html = await res.text();
    const match =
      html.match(/property="og:image"\s+content="([^"]+)"/i) ??
      html.match(/content="([^"]+)"\s+property="og:image"/i) ??
      html.match(/name="twitter:image"\s+content="([^"]+)"/i) ??
      html.match(/content="([^"]+)"\s+name="twitter:image"/i);
    return match?.[1];
  } catch {
    return undefined;
  }
}

async function enrichWithImages(articles: NewsArticle[]): Promise<NewsArticle[]> {
  return Promise.all(
    articles.map(async (article) => {
      if (article.imageUrl) return article;
      const imageUrl = await fetchOgImage(article.url);
      return imageUrl ? { ...article, imageUrl } : article;
    }),
  );
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
    const enriched = await enrichWithImages(articles);

    cache = { data: enriched, timestamp: Date.now() };
    res.json(enriched);
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
