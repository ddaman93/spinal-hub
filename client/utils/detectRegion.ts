type BoundingBox = {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
};

type RegionEntry = {
  name: string;
  box: BoundingBox;
};

const REGIONS: RegionEntry[] = [
  // Auckland
  { name: "Auckland", box: { minLat: -37.2, maxLat: -36.6, minLng: 174.4, maxLng: 175.3 } },
  // Hamilton
  { name: "Hamilton", box: { minLat: -37.9, maxLat: -37.6, minLng: 175.1, maxLng: 175.5 } },
  // Tauranga
  { name: "Tauranga", box: { minLat: -37.8, maxLat: -37.5, minLng: 175.8, maxLng: 176.4 } },
  // Napier / Hastings
  { name: "Napier / Hastings", box: { minLat: -39.8, maxLat: -39.3, minLng: 176.6, maxLng: 177.1 } },
  // Palmerston North
  { name: "Palmerston North", box: { minLat: -40.5, maxLat: -40.2, minLng: 175.4, maxLng: 175.8 } },
  // Kapiti Coast
  { name: "Kapiti Coast", box: { minLat: -41.1, maxLat: -40.7, minLng: 174.8, maxLng: 175.2 } },
  // Upper Hutt (before Lower Hutt — narrower box)
  { name: "Upper Hutt", box: { minLat: -41.2, maxLat: -41.0, minLng: 175.0, maxLng: 175.3 } },
  // Lower Hutt
  { name: "Lower Hutt", box: { minLat: -41.3, maxLat: -41.1, minLng: 174.8, maxLng: 175.1 } },
  // Wellington
  { name: "Wellington", box: { minLat: -41.5, maxLat: -41.1, minLng: 174.6, maxLng: 175.1 } },
  // Christchurch
  { name: "Christchurch", box: { minLat: -43.7, maxLat: -43.3, minLng: 172.2, maxLng: 172.8 } },
  // Queenstown
  { name: "Queenstown", box: { minLat: -45.2, maxLat: -44.9, minLng: 168.4, maxLng: 169.0 } },
  // Dunedin
  { name: "Dunedin", box: { minLat: -46.0, maxLat: -45.7, minLng: 170.2, maxLng: 170.7 } },
];

/**
 * Returns the region name for a given lat/lng, or "Nationwide" if outside all boxes.
 */
export function detectRegion(latitude: number, longitude: number): string {
  for (const { name, box } of REGIONS) {
    if (
      latitude >= box.minLat &&
      latitude <= box.maxLat &&
      longitude >= box.minLng &&
      longitude <= box.maxLng
    ) {
      return name;
    }
  }
  return "Nationwide";
}
