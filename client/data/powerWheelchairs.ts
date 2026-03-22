/**
 * Power wheelchair models.
 * Data scraped from:
 *   Permobil   → permobil.com/en-nz
 *   Quickie    → medifab.com/nz (NZ distributor)
 *   Magic Mobility → a1wheelchairs.co.nz (NZ distributor)
 */

import { PERMOBIL_POWER_WHEELCHAIRS_GENERATED } from "@/data/generated/permobilPowerWheelchairs.generated";
import { QUICKIE_POWER_WHEELCHAIRS_GENERATED } from "@/data/generated/quickiePowerWheelchairs.generated";
import { MAGIC_MOBILITY_POWER_WHEELCHAIRS_GENERATED } from "@/data/generated/magicMobilityPowerWheelchairs.generated";

/* ───────────── types ───────────── */

export type PowerWheelchairBrand = "permobil" | "quickie" | "magic-mobility";

export type PowerWheelchairDriveType = "mid-wheel" | "front-wheel" | "rear-wheel" | "other";

export type PowerWheelchair = {
  id: string;
  brand: PowerWheelchairBrand;
  /** Drive type — used for Permobil filter bubbles. */
  driveType?: PowerWheelchairDriveType;
  title: string;
  description: string;
  image: string;
  productUrl: string;
  category: "power";
  tags: string[];
};

export type PowerChairBrandInfo = {
  id: PowerWheelchairBrand;
  title: string;
  description: string;
  /** Brand logo / hero image URL */
  image: string;
  /** Override image background colour (default: theme.backgroundTertiary) */
  imageBg?: string;
  /** Override image contentFit (default: "cover") */
  imageContentFit?: "cover" | "contain";
};

/* ───────────── brand directory ───────────── */

export const POWER_CHAIR_BRAND_INFO: PowerChairBrandInfo[] = [
  {
    id: "permobil",
    title: "Permobil",
    description: "Advanced power wheelchairs with intelligent seating systems and smart connectivity.",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/Chairs/manual-chairs/permobil/History-Permobil-logo.webp",
  },
  {
    id: "quickie",
    title: "Quickie",
    description: "Feature-rich mid-wheel drive power chairs for active and complex clinical needs.",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/Chairs/power-chairs/quickie/quickie-logo.png",
  },
  {
    id: "magic-mobility",
    title: "Magic Mobility",
    description: "All-terrain power wheelchairs engineered for outdoor adventures and tough terrain.",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/Chairs/power-chairs/magic/magic%20logo.png",
    imageBg: "#ffffff",
    imageContentFit: "contain",
  },
];

/* ───────────── brand arrays ───────────── */

export const PERMOBIL_POWER_CHAIRS: PowerWheelchair[] = PERMOBIL_POWER_WHEELCHAIRS_GENERATED;
export const QUICKIE_POWER_CHAIRS: PowerWheelchair[] = QUICKIE_POWER_WHEELCHAIRS_GENERATED;
export const MAGIC_MOBILITY_POWER_CHAIRS: PowerWheelchair[] = MAGIC_MOBILITY_POWER_WHEELCHAIRS_GENERATED;

/* ───────────── combined lookup ───────────── */

export const POWER_WHEELCHAIRS_BY_BRAND: Record<PowerWheelchairBrand, PowerWheelchair[]> = {
  permobil: PERMOBIL_POWER_CHAIRS,
  quickie: QUICKIE_POWER_CHAIRS,
  "magic-mobility": MAGIC_MOBILITY_POWER_CHAIRS,
};

export const ALL_POWER_CHAIRS: PowerWheelchair[] = [
  ...PERMOBIL_POWER_CHAIRS,
  ...QUICKIE_POWER_CHAIRS,
  ...MAGIC_MOBILITY_POWER_CHAIRS,
];

export function getPowerChairsByBrand(brandId: PowerWheelchairBrand): PowerWheelchair[] {
  return POWER_WHEELCHAIRS_BY_BRAND[brandId] ?? [];
}

export function getPowerChairById(id: string): PowerWheelchair | undefined {
  return ALL_POWER_CHAIRS.find((c) => c.id === id);
}
