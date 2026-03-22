export type OSMMarker = {
  id: string;
  latitude: number;
  longitude: number;
  type: "accessible-bathroom" | "hospital" | "mobility-parking" | "pharmacy" | "accommodation";
  name: string;
};

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

/**
 * Fetches accessibility-related POIs from OpenStreetMap within a radius (metres)
 * around the given coordinates.
 */
export async function fetchOSMData(
  latitude: number,
  longitude: number,
  radiusMetres = 2000,
): Promise<OSMMarker[]> {
  const r = radiusMetres;
  const query = `
[out:json][timeout:25];
(
  node["amenity"="toilets"]["wheelchair"="yes"](around:${r},${latitude},${longitude});
  way["amenity"="toilets"]["wheelchair"="yes"](around:${r},${latitude},${longitude});
  node["amenity"="hospital"](around:${r},${latitude},${longitude});
  way["amenity"="hospital"](around:${r},${latitude},${longitude});
  node["amenity"="parking"]["parking"="disabled"](around:${r},${latitude},${longitude});
  node["parking"="disabled"](around:${r},${latitude},${longitude});
  node["amenity"="pharmacy"](around:${r},${latitude},${longitude});
  way["amenity"="pharmacy"](around:${r},${latitude},${longitude});
  node["tourism"~"hotel|motel|guest_house"]["wheelchair"="yes"](around:${r},${latitude},${longitude});
  way["tourism"~"hotel|motel|guest_house"]["wheelchair"="yes"](around:${r},${latitude},${longitude});
);
out center;
  `.trim();

  const response = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!response.ok) {
    throw new Error(`OSM fetch failed: ${response.status}`);
  }

  const json = await response.json();
  const elements: any[] = json.elements ?? [];

  const markers: OSMMarker[] = [];

  for (const el of elements) {
    // Ways return a `center` object; nodes have lat/lon directly
    const lat: number = el.lat ?? el.center?.lat;
    const lon: number = el.lon ?? el.center?.lon;
    if (!lat || !lon) continue;

    const tags = el.tags ?? {};
    const name: string =
      tags.name ?? tags["name:en"] ?? inferName(tags);

    let type: OSMMarker["type"] | null = null;

    if (tags.amenity === "toilets" && tags.wheelchair === "yes") {
      type = "accessible-bathroom";
    } else if (tags.amenity === "hospital") {
      type = "hospital";
    } else if (
      tags.amenity === "parking" && tags.parking === "disabled"
    ) {
      type = "mobility-parking";
    } else if (tags.parking === "disabled") {
      type = "mobility-parking";
    } else if (tags.amenity === "pharmacy") {
      type = "pharmacy";
    } else if (
      ["hotel", "motel", "guest_house"].includes(tags.tourism) &&
      tags.wheelchair === "yes"
    ) {
      type = "accommodation";
    }

    if (!type) continue;

    markers.push({
      id: `${el.type}-${el.id}`,
      latitude: lat,
      longitude: lon,
      type,
      name,
    });
  }

  return markers;
}

function inferName(tags: Record<string, string>): string {
  if (tags.amenity === "toilets") return "Accessible Toilet";
  if (tags.amenity === "hospital") return "Hospital";
  if (tags.parking === "disabled" || tags.amenity === "parking")
    return "Mobility Parking";
  if (tags.amenity === "pharmacy") return "Pharmacy";
  if (["hotel", "motel", "guest_house"].includes(tags.tourism))
    return "Accessible Accommodation";
  return "Point of Interest";
}
