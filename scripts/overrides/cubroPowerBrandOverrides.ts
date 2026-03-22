/**
 * Manual brand overrides for Cubro power wheelchair scraper.
 * Add entries here when the scraper logs "UNCLASSIFIED" for a product
 * that is actually Quickie or Magic Mobility.
 *
 * Format: { [productUrl]: "quickie" | "magic-mobility" }
 */

export const URL_BRAND_OVERRIDES: Record<string, "quickie" | "magic-mobility"> = {
  // Example:
  // "https://www.cubro.co.nz/healthcare-products/powered-wheelchairs/some-chair": "quickie",
};
