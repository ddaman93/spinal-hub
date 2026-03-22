/**
 * Sports wheelchair models.
 * Data scraped from melrosewheelchairs.co.nz
 */

import { MELROSE_SPORTS_WHEELCHAIRS_GENERATED } from "@/data/generated/melroseSportsWheelchairs.generated";

/* ───────────── types ───────────── */

export type SportsWheelchairBrand = "melrose";

export type SportsDiscipline =
  | "rugby"
  | "rugby-league"
  | "basketball"
  | "tennis"
  | "bowls"
  | "lacrosse"
  | "afl";

export type SportsWheelchair = {
  id: string;
  brand: SportsWheelchairBrand;
  title: string;
  description: string;
  image: string;
  productUrl: string;
  category: "sports";
  discipline: SportsDiscipline;
  tags: string[];
};

export type SportsChairBrandInfo = {
  id: SportsWheelchairBrand;
  title: string;
  description: string;
  image: string;
  imageBg?: string;
  imageContentFit?: "cover" | "contain";
};

/* ───────────── brand directory ───────────── */

export const SPORTS_CHAIR_BRAND_INFO: SportsChairBrandInfo[] = [
  {
    id: "melrose",
    title: "Melrose",
    description: "Custom-built NZ sports wheelchairs for rugby, basketball, tennis, and more.",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/Chairs/manual-chairs/melrose/melrose-logo-white-800-24.png",
  },
];

/* ───────────── brand arrays ───────────── */

export const MELROSE_SPORTS_CHAIRS: SportsWheelchair[] = MELROSE_SPORTS_WHEELCHAIRS_GENERATED;

export const ALL_SPORTS_CHAIRS: SportsWheelchair[] = [...MELROSE_SPORTS_CHAIRS];

export function getSportsChairsByBrand(brandId: SportsWheelchairBrand): SportsWheelchair[] {
  return ALL_SPORTS_CHAIRS.filter((c) => c.brand === brandId);
}

export function getSportsChairById(id: string): SportsWheelchair | undefined {
  return ALL_SPORTS_CHAIRS.find((c) => c.id === id);
}
