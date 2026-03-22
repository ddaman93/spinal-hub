/**
 * Manual wheelchair models (actual chairs, not accessories).
 * Permobil data scraped from permobil.com/en-nz via scripts/scrape-permobil-chairs.ts
 * Melrose data from client/data/generated/melroseManualWheelchairs.generated.ts
 */

import { MELROSE_MANUAL_CHAIRS_GENERATED } from "@/data/generated/melroseManualWheelchairs.generated";
import { INVACARE_MANUAL_CHAIRS_GENERATED } from "@/data/generated/invacareManualWheelchairs.generated";

/* ───────────── types ───────────── */

export type ManualChairBrand = "permobil" | "melrose" | "invacare";

export type ManualWheelchairFrameType = "fixed" | "folding";

export type ManualWheelchairSubcategory =
  | "active"
  | "standard"
  | "tilt-in-space"
  | "paediatric"
  | "other";

export type ManualWheelchair = {
  id: string;
  brand: ManualChairBrand;
  /** Sub-brand / manufacturer line, e.g. "TiLite", "Panthera", "Melrose", "Ottobock" */
  manufacturerLine: string;
  /** Frame type — used for Permobil/Melrose tabs. Optional for subcategory-based brands. */
  frameType?: ManualWheelchairFrameType;
  /** Subcategory — used for Invacare tabs (Active/Standard/Tilt-in-space/Paediatric). */
  subcategory?: ManualWheelchairSubcategory;
  title: string;
  description: string;
  /** Remote image URL */
  image: string;
  tags: string[];
  category: "manual";
  productUrl: string;
  whatItIs?: string;
  whatItDoes?: string;
  whoItsFor?: string;
};

export type ManualChairBrandInfo = {
  id: ManualChairBrand;
  title: string;
  description: string;
  image: string;
};

/* ───────────── brand directory ───────────── */

export const MANUAL_CHAIR_BRAND_INFO: ManualChairBrandInfo[] = [
  {
    id: "permobil",
    title: "Permobil",
    description: "TiLite & Panthera — ultralight, fully adjustable, custom-built manual chairs.",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/Chairs/manual-chairs/permobil/History-Permobil-logo.webp",
  },
  {
    id: "melrose",
    title: "Melrose",
    description: "New Zealand-designed wheelchairs built for active lifestyles.",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/Chairs/manual-chairs/melrose/melrose-logo-white-800-24.png",
  },
  {
    id: "invacare",
    title: "Invacare",
    description: "A wide range of manual wheelchairs for everyday and active use.",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/Chairs/manual-chairs/invacare/invavare-logo.jpeg",
  },
];

/* ───────────── Permobil / TiLite products ───────────── */

const TILITE_PRODUCTS: ManualWheelchair[] = [
  {
    id: "tilite-aero-x",
    brand: "permobil",
    manufacturerLine: "TiLite",
    frameType: "fixed",
    title: "TiLite Aero X",
    description:
      "Innovative modular design with clean modern lines and configurability. Available in heavy-duty, hemi, and amputee options.",
    image: "https://permobilwebcdn.azureedge.net/media/sqshscr4/aerox.jpg",
    tags: ["brand:permobil", "line:tilite", "type:rigid", "material:aluminum"],
    category: "manual",
    productUrl: "https://www.permobil.com/en-nz/products/manual-wheelchairs/tilite-aero-x/",
    whatItIs: "A modular rigid-frame aluminium wheelchair with multiple configuration options.",
    whatItDoes: "Offers heavy-duty, hemi, and amputee configurations from a single frame platform.",
    whoItsFor: "Active users who need a highly configurable aluminium rigid chair.",
  },
  {
    id: "tilite-aero-t",
    brand: "permobil",
    manufacturerLine: "TiLite",
    frameType: "fixed",
    title: "TiLite Aero T",
    description:
      "Our most advanced aluminium chair. The Aero T's dual-tube frame minimises weight whilst maximising performance, with full adjustability and TiFit precision.",
    image: "https://permobilwebcdn.azureedge.net/media/4kpduo2l/2021-aero-t-red-ano.jpg",
    tags: ["brand:permobil", "line:tilite", "type:rigid", "material:aluminum"],
    category: "manual",
    productUrl: "https://www.permobil.com/en-nz/products/manual-wheelchairs/tilite-aero-t/",
    whatItIs: "A dual-tube rigid aluminium wheelchair with TiFit adjustability.",
    whatItDoes: "Delivers maximum performance and minimum weight in a precision-fitted package.",
    whoItsFor: "Active riders wanting the best-performing aluminium TiLite chair.",
  },
  {
    id: "tilite-aero-z",
    brand: "permobil",
    manufacturerLine: "TiLite",
    frameType: "fixed",
    title: "TiLite Aero Z",
    description:
      "The only TiFit mono-tube aluminium frame on the market. Lightweight, fully adjustable, and won't break the bank.",
    image: "https://permobilwebcdn.azureedge.net/media/yadjvpii/2021-aero-z-gold-ano-1.jpg",
    tags: ["brand:permobil", "line:tilite", "type:rigid", "material:aluminum"],
    category: "manual",
    productUrl: "https://www.permobil.com/en-nz/products/manual-wheelchairs/tilite-aero-z/",
    whatItIs: "A TiFit mono-tube aluminium rigid frame, the only one of its kind.",
    whatItDoes: "Combines open-frame styling with full TiFit adjustability at an accessible price point.",
    whoItsFor: "Users wanting mono-tube aluminium aesthetics without the titanium price tag.",
  },
  {
    id: "tilite-zr",
    brand: "permobil",
    manufacturerLine: "TiLite",
    frameType: "fixed",
    title: "TiLite ZR",
    description:
      "The minimalist mono-tube titanium frame — less truly is more. Clean aesthetics with superior vibration dampening for a smooth, head-turning ride.",
    image: "https://permobilwebcdn.azureedge.net/media/djlmoo5p/2021-zr-orange-ano.jpg",
    tags: ["brand:permobil", "line:tilite", "type:rigid", "material:titanium"],
    category: "manual",
    productUrl: "https://www.permobil.com/en-nz/products/manual-wheelchairs/tilite-zr/",
    whatItIs: "A mono-tube rigid titanium wheelchair with TiFit adjustability.",
    whatItDoes: "Delivers superior vibration dampening and ultra-clean aesthetics from a single titanium tube.",
    whoItsFor: "Style-conscious active users who want titanium at its simplest.",
  },
  {
    id: "tilite-zra",
    brand: "permobil",
    manufacturerLine: "TiLite",
    frameType: "fixed",
    title: "TiLite ZRA",
    description:
      "Full adjustability and a minimalist mono-tube frame with style without boundaries. Available with TiFit titanium frame for the complete package.",
    image: "https://permobilwebcdn.azureedge.net/media/wgqomrv0/2021-zra-purple-ano.jpg",
    tags: ["brand:permobil", "line:tilite", "type:rigid", "material:titanium"],
    category: "manual",
    productUrl: "https://www.permobil.com/en-nz/products/manual-wheelchairs/tilite-zra/",
    whatItIs: "A fully adjustable mono-tube titanium rigid frame with optional TiFit precision fit.",
    whatItDoes: "Combines bold styling with full adjustability and the ride quality of titanium.",
    whoItsFor: "Active users who want maximum adjustability and titanium performance in one mono-tube design.",
  },
  {
    id: "tilite-tra",
    brand: "permobil",
    manufacturerLine: "TiLite",
    frameType: "fixed",
    title: "TiLite TRA",
    description:
      "The power of a titanium dual-tube frame combined with TiFit precision and full adjustability. Better performance and comfort, built around you.",
    image: "https://permobilwebcdn.azureedge.net/media/kftoysgc/2021-tra-gold-ano.jpg",
    tags: ["brand:permobil", "line:tilite", "type:rigid", "material:titanium"],
    category: "manual",
    productUrl: "https://www.permobil.com/en-nz/products/manual-wheelchairs/tilite-tra/",
    whatItIs: "A dual-tube rigid titanium wheelchair with TiFit adjustability.",
    whatItDoes: "Rolls better with a titanium dual-tube frame that offers superior performance and vibration dampening.",
    whoItsFor: "Active users who want top-tier titanium performance with full adjustability.",
  },
  {
    id: "tilite-tr",
    brand: "permobil",
    manufacturerLine: "TiLite",
    frameType: "fixed",
    title: "TiLite TR",
    description:
      "Titanium rigid frame with superior strength and vibration dampening. TiFit adjustability lets you dial in the perfect fit for your body and lifestyle.",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/Chairs/manual-chairs/permobil/tilite-tr.webp",
    tags: ["brand:permobil", "line:tilite", "type:rigid", "material:titanium"],
    category: "manual",
    productUrl: "https://www.permobil.com/en-nz/products/manual-wheelchairs/tilite-tr/",
    whatItIs: "A titanium rigid-frame wheelchair with TiFit precision fit.",
    whatItDoes: "Combines titanium's strength-to-weight ratio and vibration dampening with a rigid performance frame.",
    whoItsFor: "Active users seeking entry-level titanium performance with TiFit adjustability.",
  },
  {
    id: "tilite-2gx",
    brand: "permobil",
    manufacturerLine: "TiLite",
    frameType: "folding",
    title: "TiLite 2GX",
    description:
      "Combines the advantages of a modular folding frame with the high strength and vibration dampening characteristics of titanium.",
    image: "https://permobilwebcdn.azureedge.net/media/yconr4t4/2gx.jpg",
    tags: ["brand:permobil", "line:tilite", "type:folding", "material:titanium"],
    category: "manual",
    productUrl: "https://www.permobil.com/en-nz/products/manual-wheelchairs/tilite-2gx/",
    whatItIs: "A modular folding titanium wheelchair.",
    whatItDoes: "Offers the portability of a folding frame with titanium's vibration dampening and strength.",
    whoItsFor: "Users who need the packability of a folding chair without sacrificing titanium ride quality.",
  },
  {
    id: "tilite-pilot",
    brand: "permobil",
    manufacturerLine: "TiLite",
    frameType: "fixed",
    title: "TiLite Pilot",
    description:
      "TiFit adjustability in a supportive titanium frame, designed for users who require additional postural support. Versatile and fully customisable.",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/Chairs/manual-chairs/permobil/tilite%20pilot.webp",
    tags: ["brand:permobil", "line:tilite", "type:rigid", "material:titanium"],
    category: "manual",
    productUrl: "https://www.permobil.com/en-nz/products/manual-wheelchairs/tilite-pilot/",
    whatItIs: "A supportive TiFit titanium rigid-frame chair for users needing additional postural support.",
    whatItDoes: "Provides full TiFit adjustability and titanium performance for a broad range of users.",
    whoItsFor: "Users — including those with higher lesion levels — who need more support in an active rigid frame.",
  },
  {
    id: "tilite-twist",
    brand: "permobil",
    manufacturerLine: "TiLite",
    frameType: "fixed",
    title: "TiLite TWIST",
    description:
      "A rigid mono-tube aluminum wheelchair that grows straight out of the box. Perfect for users transitioning to a rigid chair.",
    image: "https://permobilwebcdn.azureedge.net/media/3nzlmtiq/twist-100.jpg",
    tags: ["brand:permobil", "line:tilite", "type:rigid", "material:aluminum"],
    category: "manual",
    productUrl: "https://www.permobil.com/en-nz/products/manual-wheelchairs/tilite-twist/",
    whatItIs: "A rigid mono-tube aluminium wheelchair designed to grow with the user.",
    whatItDoes: "Provides a true rigid-frame experience for users making the transition from a folding chair.",
    whoItsFor: "New active riders and those graduating to their first rigid frame.",
  },
  {
    id: "tilite-cr1",
    brand: "permobil",
    manufacturerLine: "TiLite",
    frameType: "fixed",
    title: "TiLite CR1",
    description:
      "Aerodynamic tube profile and foam-filled core in a carbon fibre frame designed for uncompromising performance and strength.",
    image: "https://permobilwebcdn.azureedge.net/media/kqmh4ju2/milz-oven.jpg",
    tags: ["brand:permobil", "line:tilite", "type:rigid", "material:carbon-fiber"],
    category: "manual",
    productUrl: "https://www.permobil.com/en-nz/products/manual-wheelchairs/tilite-cr1/",
    whatItIs: "A full carbon fibre rigid-frame wheelchair with an aerodynamic tube profile.",
    whatItDoes: "Delivers uncompromising performance and strength from a foam-filled carbon fibre frame.",
    whoItsFor: "Elite active users wanting the ultimate in lightweight, stiff performance.",
  },
];

/* ───────────── Permobil / Panthera products ───────────── */

const PANTHERA_PRODUCTS: ManualWheelchair[] = [
  {
    id: "panthera-u3",
    brand: "permobil",
    manufacturerLine: "Panthera",
    frameType: "fixed",
    title: "Panthera U3",
    description:
      "Made for active users who want a slim-looking wheelchair and easy manoeuvrability, combined with adjustable accessories for added comfort and security.",
    image: "https://permobilwebcdn.azureedge.net/media/skaffai4/panthera_1251x1251_u3_iso.jpg",
    tags: ["brand:permobil", "line:panthera", "type:rigid"],
    category: "manual",
    productUrl: "https://www.permobil.com/en-nz/products/manual-wheelchairs/panthera-u3/",
    whatItIs: "A slim, active rigid-frame manual wheelchair.",
    whatItDoes: "Provides easy manoeuvrability and a full range of adjustable accessories for everyday active use.",
    whoItsFor: "Active users who want a slim, manoeuvrable wheelchair with accessory flexibility.",
  },
  {
    id: "panthera-u3-light",
    brand: "permobil",
    manufacturerLine: "Panthera",
    frameType: "fixed",
    title: "Panthera U3 Light",
    description:
      "For experienced manual wheelchair users who need a low-weight, manoeuvrable device, the U3 Light offers stability and comfortable posture support.",
    image: "https://permobilwebcdn.azureedge.net/media/rbqnur1e/panthera_1251x1251_product_u3_light_iso_black.jpg",
    tags: ["brand:permobil", "line:panthera", "type:rigid", "weight:ultralight"],
    category: "manual",
    productUrl: "https://www.permobil.com/en-nz/products/manual-wheelchairs/panthera-u3-light/",
    whatItIs: "An ultralight manoeuvrable rigid-frame wheelchair.",
    whatItDoes: "Reduces rolling resistance and overall weight while maintaining stability and posture support.",
    whoItsFor: "Experienced active users prioritising a lightweight, manoeuvrable daily chair.",
  },
  {
    id: "panthera-x3",
    brand: "permobil",
    manufacturerLine: "Panthera",
    frameType: "fixed",
    title: "Panthera X3",
    description:
      "Designed for experienced users who need a dynamic wheelchair for their active lifestyles. One of the lightest manual wheelchairs on the market.",
    image: "https://permobilwebcdn.azureedge.net/media/kilhl2oe/panthera-x3_lifestyle-product-page_01.png",
    tags: ["brand:permobil", "line:panthera", "type:rigid", "weight:ultralight"],
    category: "manual",
    productUrl: "https://www.permobil.com/en-nz/products/manual-wheelchairs/panthera-x3/",
    whatItIs: "One of the lightest rigid manual wheelchairs on the market, built for experienced active users.",
    whatItDoes: "Combines ultralight construction with improved durability and modern design for dynamic use.",
    whoItsFor: "Experienced active wheelchair users who demand the absolute lightest dynamic chair.",
  },
  {
    id: "panthera-s3-series",
    brand: "permobil",
    manufacturerLine: "Panthera",
    frameType: "fixed",
    title: "Panthera S3 Series",
    description:
      "Seven models designed to accommodate users of different builds. Every S3 offers full-width frame comfort, low transport weight, and a complete range of accessories.",
    image: "https://permobilwebcdn.azureedge.net/media/u5naee41/panthera_1251x1251_product_s3_iso.jpg",
    tags: ["brand:permobil", "line:panthera", "type:rigid"],
    category: "manual",
    productUrl: "https://www.permobil.com/en-nz/products/manual-wheelchairs/panthera-s3-series/",
    whatItIs: "A family of seven rigid manual wheelchairs for a variety of user sizes.",
    whatItDoes: "Provides full-width frame comfort and low transport weight across seven size-differentiated models.",
    whoItsFor: "Users of all builds who need a comfortable, full-width rigid chair with broad accessory support.",
  },
  {
    id: "panthera-s3-swing",
    brand: "permobil",
    manufacturerLine: "Panthera",
    frameType: "fixed",
    title: "Panthera S3 Swing",
    description:
      "Available in 4 models, the S3 Swing provides the comfort and low transport weight of the S3 series with the added flexibility of a swing-away footrest for easier transfers.",
    image: "https://permobilwebcdn.azureedge.net/media/bc5dp2ll/panthera-s3-swing-headerimage.png",
    tags: ["brand:permobil", "line:panthera", "type:rigid"],
    category: "manual",
    productUrl: "https://www.permobil.com/en-nz/products/manual-wheelchairs/panthera-s3-swing/",
    whatItIs: "A rigid manual wheelchair with a swing-away footrest for improved transfer accessibility.",
    whatItDoes: "Adds swing-away footrest flexibility to the proven S3 comfort and low transport weight.",
    whoItsFor: "S3 users who want easier transfers via a swing-away footrest.",
  },
  {
    id: "panthera-micro-3",
    brand: "permobil",
    manufacturerLine: "Panthera",
    frameType: "fixed",
    title: "Panthera Micro 3",
    description:
      "Designed for very young users in indoor environments and supervised outdoor activities. Lightweight and easy-to-handle for exploring the world.",
    image: "https://permobilwebcdn.azureedge.net/media/la0kzsu3/colour_racing_blue_1250.jpg",
    tags: ["brand:permobil", "line:panthera", "type:rigid", "age:children"],
    category: "manual",
    productUrl: "https://www.permobil.com/en-nz/products/manual-wheelchairs/panthera-micro-3/",
    whatItIs: "A lightweight manual wheelchair designed for very young and small children.",
    whatItDoes: "Enables young children to explore independently in indoor environments and supervised outdoor spaces.",
    whoItsFor: "Very young or small children who need a lightweight, easy-to-handle chair.",
  },
  {
    id: "panthera-bambino-3",
    brand: "permobil",
    manufacturerLine: "Panthera",
    frameType: "fixed",
    title: "Panthera Bambino 3",
    description:
      "An active, easy-to-handle manual wheelchair for children who need a robust chair for their active lives.",
    image: "https://permobilwebcdn.azureedge.net/media/ic1pbous/jalle-jungnell-panthera-bengt-thorsson-permobil-16-9-jpg.png",
    tags: ["brand:permobil", "line:panthera", "type:rigid", "age:children"],
    category: "manual",
    productUrl: "https://www.permobil.com/en-nz/products/manual-wheelchairs/panthera-bambino-3/",
    whatItIs: "A robust active manual wheelchair built for children's everyday active lives.",
    whatItDoes: "Provides an easy-to-handle, durable platform that keeps up with an active child.",
    whoItsFor: "Active children who need a robust, reliable everyday wheelchair.",
  },
];

/* ───────────── brand exports ───────────── */

export const PERMOBIL_MANUAL_CHAIRS: ManualWheelchair[] = [
  ...TILITE_PRODUCTS,
  ...PANTHERA_PRODUCTS,
];

export const MELROSE_MANUAL_CHAIRS: ManualWheelchair[] = MELROSE_MANUAL_CHAIRS_GENERATED;

export const INVACARE_MANUAL_CHAIRS: ManualWheelchair[] = INVACARE_MANUAL_CHAIRS_GENERATED;

/* ───────────── combined export + helpers ───────────── */

export const ALL_MANUAL_CHAIRS: ManualWheelchair[] = [
  ...PERMOBIL_MANUAL_CHAIRS,
  ...MELROSE_MANUAL_CHAIRS,
  ...INVACARE_MANUAL_CHAIRS,
];

export function getChairsByBrand(brandId: ManualChairBrand): ManualWheelchair[] {
  return ALL_MANUAL_CHAIRS.filter((c) => c.brand === brandId);
}

export function getChairById(id: string): ManualWheelchair | undefined {
  return ALL_MANUAL_CHAIRS.find((c) => c.id === id);
}
