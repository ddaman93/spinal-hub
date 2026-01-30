import type { Request, Response } from "express";
import { XMLParser } from "fast-xml-parser";

type NewsArticle = {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  imageUrl?: string;
};

type CacheEntry = {
  data: NewsArticle[];
  timestamp: number;
};

// In-memory cache with 6-hour TTL
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
let cache: CacheEntry | null = null;

function isCacheValid(): boolean {
  if (!cache) return false;
  const now = Date.now();
  return now - cache.timestamp < CACHE_TTL;
}

export async function getSciNews(_req: Request, res: Response): Promise<void> {
  try {
    // Check if cache is valid
    if (isCacheValid() && cache) {
      return res.json(cache.data);
    }

    const rssUrl =
      "https://news.google.com/rss/search?q=spinal%20cord%20injury%20breakthrough&hl=en-NZ&gl=NZ&ceid=NZ:en";

    const response = await fetch(rssUrl);

    if (!response.ok) {
      res
        .status(response.status)
        .json({ error: "Failed to fetch SCI news from Google" });
      return;
    }

    const xmlData = await response.text();

    // Parse XML using fast-xml-parser
    const parser = new XMLParser({ ignoreAttributes: false });
    const parsed = parser.parse(xmlData);

    const items = parsed.rss?.channel?.item || [];
    const articlesArray = Array.isArray(items) ? items : items ? [items] : [];

    const articles: NewsArticle[] = articlesArray
      .slice(0, 25)
      .map((item: any, index: number) => {
        // Extract image from media:content or media:thumbnail
        let imageUrl: string | undefined;

        if (item["media:content"]?.url) {
          imageUrl = item["media:content"].url;
        } else if (item["media:thumbnail"]?.url) {
          imageUrl = item["media:thumbnail"].url;
        }

        return {
          id: `${item.guid || item.link}-${index}`,
          title: item.title || "Untitled",
          url: item.link || "",
          source: item.source?.["#text"] || "Google News",
          publishedAt: item.pubDate || "",
          imageUrl,
        };
      })
      // Sort by publishedAt descending
      .sort((a, b) => {
        const dateA = new Date(a.publishedAt).getTime();
        const dateB = new Date(b.publishedAt).getTime();
        return dateB - dateA;
      });

    // Update cache
    cache = {
      data: articles,
      timestamp: Date.now(),
    };

    res.json(articles);
  } catch (error) {
    console.error("SCI news API error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
