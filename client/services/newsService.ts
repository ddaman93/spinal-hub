import { getApiUrl } from "@/lib/query-client";

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

type CacheEntry = {
  data: NewsArticle[];
  timestamp: number;
};

const CACHE_TTL = 30 * 60 * 1000; // 30 minutes
let memCache: CacheEntry | null = null;

function normalizeArticles(articles: NewsArticle[]): NewsArticle[] {
  return articles.map((article) => ({
    ...article,
    id: article.id || article.url,
    imageUrl: article.imageUrl || "https://source.unsplash.com/featured/?medical,spine",
    category: article.category || "General",
  }));
}

export async function getSciNews(): Promise<NewsArticle[]> {
  if (memCache && Date.now() - memCache.timestamp < CACHE_TTL) {
    return memCache.data;
  }

  try {
    const res = await fetch(`${getApiUrl()}/api/sci-news`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const raw: NewsArticle[] = await res.json();
    const articles = normalizeArticles(raw);
    memCache = { data: articles, timestamp: Date.now() };
    return articles;
  } catch (error) {
    console.error("getSciNews error:", error);
    return memCache?.data ?? [];
  }
}
