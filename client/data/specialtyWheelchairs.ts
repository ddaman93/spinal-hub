/**
 * Specialty wheelchair models (shower/commode, beach, suspension, tilt-in-space).
 * Data scraped from melrosewheelchairs.co.nz
 */

import { MELROSE_SPECIALTY_WHEELCHAIRS_GENERATED } from "@/data/generated/melroseSpecialtyWheelchairs.generated";

/* ───────────── types ───────────── */

export type SpecialtyWheelchairBrand = "melrose";

export type SpecialtyType =
  | "shower-commode"
  | "beach"
  | "suspension"
  | "tilt-in-space";

export type SpecialtyWheelchairProduct = {
  id: string;
  brand: SpecialtyWheelchairBrand;
  title: string;
  description: string;
  image: string;
  url: string;
  category: "specialty";
  specialtyType: SpecialtyType;
  tags: string[];
};

export type SpecialtyChairBrandInfo = {
  id: SpecialtyWheelchairBrand;
  title: string;
  description: string;
  image: string;
  imageBg?: string;
  imageContentFit?: "cover" | "contain";
};

/* ───────────── brand directory ───────────── */

export const SPECIALTY_CHAIR_BRAND_INFO: SpecialtyChairBrandInfo[] = [
  {
    id: "melrose",
    title: "Melrose",
    description: "Custom-built NZ specialty chairs for shower, beach, suspension, and tilt-in-space needs.",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/Chairs/manual-chairs/melrose/melrose-logo-white-800-24.png",
  },
];

/* ───────────── brand arrays ───────────── */

export const MELROSE_SPECIALTY_CHAIRS: SpecialtyWheelchairProduct[] =
  MELROSE_SPECIALTY_WHEELCHAIRS_GENERATED;

export const ALL_SPECIALTY_CHAIRS: SpecialtyWheelchairProduct[] = [
  ...MELROSE_SPECIALTY_CHAIRS,
];

export function getSpecialtyChairsByBrand(
  brandId: SpecialtyWheelchairBrand
): SpecialtyWheelchairProduct[] {
  return ALL_SPECIALTY_CHAIRS.filter((c) => c.brand === brandId);
}

export function getSpecialtyChairById(
  id: string
): SpecialtyWheelchairProduct | undefined {
  return ALL_SPECIALTY_CHAIRS.find((c) => c.id === id);
}
