/**
 * Airline wheelchair models (aisle, onboard, lift, terminal/transit).
 * Data scraped from melrosewheelchairs.co.nz
 */

import { MELROSE_AIRLINE_WHEELCHAIRS_GENERATED } from "@/data/generated/melroseAirlineWheelchairs.generated";

/* ───────────── types ───────────── */

export type AirlineWheelchairBrand = "melrose";

export type AirlineType =
  | "aisle-fixed"
  | "onboard-folding"
  | "onboard-lift"
  | "terminal-transit";

export type AirlineWheelchairProduct = {
  id: string;
  brand: AirlineWheelchairBrand;
  title: string;
  description: string;
  image: string;
  url: string;
  category: "airline";
  airlineType: AirlineType;
  tags: string[];
};

export type AirlineChairBrandInfo = {
  id: AirlineWheelchairBrand;
  title: string;
  description: string;
  image: string;
  imageBg?: string;
  imageContentFit?: "cover" | "contain";
};

/* ───────────── brand directory ───────────── */

export const AIRLINE_CHAIR_BRAND_INFO: AirlineChairBrandInfo[] = [
  {
    id: "melrose",
    title: "Melrose",
    description: "Custom-built NZ airline wheelchairs for aisle, onboard, and terminal use.",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/Chairs/manual-chairs/melrose/melrose-logo-white-800-24.png",
  },
];

/* ───────────── brand arrays ───────────── */

export const MELROSE_AIRLINE_CHAIRS: AirlineWheelchairProduct[] =
  MELROSE_AIRLINE_WHEELCHAIRS_GENERATED;

export const ALL_AIRLINE_CHAIRS: AirlineWheelchairProduct[] = [
  ...MELROSE_AIRLINE_CHAIRS,
];

export function getAirlineChairsByBrand(
  brandId: AirlineWheelchairBrand
): AirlineWheelchairProduct[] {
  return ALL_AIRLINE_CHAIRS.filter((c) => c.brand === brandId);
}

export function getAirlineChairById(
  id: string
): AirlineWheelchairProduct | undefined {
  return ALL_AIRLINE_CHAIRS.find((c) => c.id === id);
}
