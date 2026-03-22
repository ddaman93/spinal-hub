import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import * as Location from "expo-location";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PlatformWebView } from "@/components/PlatformWebView";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { mobilityTaxiCompanies } from "@/data/mobilityTaxisNZ";
import { detectRegion } from "@/utils/detectRegion";
import { fetchOSMData, OSMMarker } from "@/utils/fetchOSMData";

// NZ centre fallback (Wellington)
const NZ_DEFAULT = { latitude: -41.2865, longitude: 174.7762 };
const SEARCH_RADIUS = 2000;

type AllMarker = {
  lat: number;
  lng: number;
  type: "taxi" | OSMMarker["type"];
  name: string;
};

const REGION_CENTRES: Record<string, { latitude: number; longitude: number }> = {
  Auckland: { latitude: -36.8485, longitude: 174.7633 },
  Hamilton: { latitude: -37.7826, longitude: 175.2528 },
  Tauranga: { latitude: -37.6878, longitude: 176.1651 },
  "Napier / Hastings": { latitude: -39.4928, longitude: 176.912 },
  "Palmerston North": { latitude: -40.3564, longitude: 175.6109 },
  "Kapiti Coast": { latitude: -40.8948, longitude: 175.0038 },
  "Lower Hutt": { latitude: -41.2127, longitude: 174.908 },
  "Upper Hutt": { latitude: -41.1243, longitude: 175.0554 },
  Wellington: { latitude: -41.2865, longitude: 174.7762 },
  Christchurch: { latitude: -43.5321, longitude: 172.6362 },
  Queenstown: { latitude: -45.0312, longitude: 168.6626 },
  Dunedin: { latitude: -45.8788, longitude: 170.5028 },
  Nationwide: { latitude: -41.2865, longitude: 174.7762 },
};

function stableJitter(id: string): { lat: number; lng: number } {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return {
    lat: ((h % 200) - 100) / 50000,
    lng: (((h >> 8) % 200) - 100) / 50000,
  };
}

function buildLeafletHTML(
  userLat: number,
  userLng: number,
  markers: AllMarker[],
): string {
  const markersJson = JSON.stringify(markers);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { height: 100%; width: 100%; }
    .leaflet-popup-content-wrapper { border-radius: 10px; }
    .leaflet-popup-content { font-family: -apple-system, sans-serif; font-size: 14px; }
    .popup-type { font-size: 12px; margin-top: 2px; opacity: 0.7; }

    .user-marker {
      filter: drop-shadow(0 3px 6px rgba(0,0,0,0.35));
      animation: wheelchair-pulse 2.2s ease-in-out infinite;
      transform-origin: center;
    }
    @keyframes wheelchair-pulse {
      0%, 100% { transform: scale(1); }
      50%       { transform: scale(1.15); }
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const map = L.map('map', { zoomControl: true }).setView([${userLat}, ${userLng}], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    // User location — wheelchair SVG marker
    var wheelchairHTML = '<div class="user-marker">'
      + '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 46 46">'
      + '<circle cx="23" cy="23" r="22" fill="#2563EB" stroke="white" stroke-width="2.5"/>'
      + '<circle cx="26" cy="9.5" r="4" fill="white"/>'
      + '<path d="M26 13.5 L21 21 L28 21 Z" fill="white"/>'
      + '<rect x="18" y="20" width="3.5" height="9" rx="1.75" fill="white"/>'
      + '<rect x="18" y="28.5" width="11" height="3.5" rx="1.75" fill="white"/>'
      + '<path d="M29 28.5 L30 34" stroke="white" stroke-width="2.5" stroke-linecap="round"/>'
      + '<circle cx="21" cy="35" r="7.5" fill="none" stroke="white" stroke-width="3"/>'
      + '<circle cx="31" cy="35" r="3.5" fill="none" stroke="white" stroke-width="2.5"/>'
      + '<path d="M25 17 L31 14" stroke="white" stroke-width="2.5" stroke-linecap="round"/>'
      + '</svg>'
      + '</div>';

    var userIcon = L.divIcon({
      html: wheelchairHTML,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -18]
    });

    L.marker([${userLat}, ${userLng}], { icon: userIcon })
      .addTo(map)
      .bindPopup('<b>You are here ♿</b>');

    // Search radius circle
    L.circle([${userLat}, ${userLng}], {
      radius: ${SEARCH_RADIUS},
      color: 'rgba(37,99,235,0.4)',
      fillColor: 'rgba(37,99,235,0.05)',
      fillOpacity: 1,
      weight: 1.5,
      dashArray: '6 4'
    }).addTo(map);

    const COLORS = {
      taxi: '#2563EB',
      'mobility-parking': '#16A34A',
      'accessible-bathroom': '#CA8A04',
      hospital: '#DC2626',
      pharmacy: '#9333EA',
      accommodation: '#EA580C'
    };

    const LABELS = {
      taxi: 'Wheelchair Taxi',
      'mobility-parking': 'Mobility Parking',
      'accessible-bathroom': 'Accessible Bathroom',
      hospital: 'Hospital',
      pharmacy: 'Pharmacy',
      accommodation: 'Accessible Accommodation'
    };

    const markers = ${markersJson};

    markers.forEach(function(m) {
      const color = COLORS[m.type] || '#888';
      const label = LABELS[m.type] || m.type;
      L.circleMarker([m.lat, m.lng], {
        radius: 9,
        color: '#fff',
        fillColor: color,
        fillOpacity: 0.9,
        weight: 2
      }).addTo(map).bindPopup(
        '<b>' + m.name + '</b><div class="popup-type">' + label + '</div>'
      );
    });
  </script>
</body>
</html>`;
}

type LoadState = "locating" | "fetching" | "ready";

const LEGEND_ITEMS = [
  { color: "#2563EB", label: "Wheelchair Taxi" },
  { color: "#16A34A", label: "Mobility Parking" },
  { color: "#CA8A04", label: "Accessible Bathroom" },
  { color: "#DC2626", label: "Hospital" },
  { color: "#9333EA", label: "Pharmacy" },
  { color: "#EA580C", label: "Accessible Accommodation" },
];

export default function AccessibleTransportMapScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const [loadState, setLoadState] = useState<LoadState>("locating");
  const [detectedRegion, setDetectedRegion] = useState<string | null>(null);
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    buildMap();
  }, []);

  async function buildMap() {
    let lat = NZ_DEFAULT.latitude;
    let lng = NZ_DEFAULT.longitude;

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      }
    } catch {
      // fall through to default coords
    }

    const region = detectRegion(lat, lng);
    setDetectedRegion(region);
    setLoadState("fetching");

    // Taxi markers from dataset
    const taxiMarkers: AllMarker[] = mobilityTaxiCompanies
      .filter(
        (c) =>
          c.regions.includes(region) || c.regions.includes("Nationwide"),
      )
      .filter((c, i, arr) => arr.findIndex((x) => x.id === c.id) === i)
      .flatMap((c) => {
        const primaryRegion = c.regions.find((r) => REGION_CENTRES[r]);
        const centre = primaryRegion
          ? REGION_CENTRES[primaryRegion]
          : REGION_CENTRES["Wellington"];
        const jitter = stableJitter(c.id);
        return [
          {
            lat: centre.latitude + jitter.lat,
            lng: centre.longitude + jitter.lng,
            type: "taxi" as const,
            name: c.name,
          },
        ];
      });

    // OSM markers (best-effort, 15 s client-side timeout)
    let osmMarkers: AllMarker[] = [];
    try {
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("OSM timeout")), 15000),
      );
      const raw = await Promise.race([
        fetchOSMData(lat, lng, SEARCH_RADIUS),
        timeout,
      ]);
      osmMarkers = raw.map((m) => ({
        lat: m.latitude,
        lng: m.longitude,
        type: m.type,
        name: m.name,
      }));
    } catch {
      // network unavailable or slow — continue without OSM data
    }

    setHtml(buildLeafletHTML(lat, lng, [...taxiMarkers, ...osmMarkers]));
    setLoadState("ready");
  }

  return (
    <ThemedView style={styles.container}>
      {/* Map (fills entire screen — uses iframe on web, WebView on native) */}
      {html ? <PlatformWebView html={html} /> : null}

      {/* Loading overlay */}
      {loadState !== "ready" && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator size="large" color="#2563EB" />
          <ThemedText type="small" style={styles.loadingText}>
            {loadState === "locating"
              ? "Getting your location…"
              : "Loading nearby services…"}
          </ThemedText>
        </View>
      )}

      {/* Top region pill */}
      {loadState === "ready" && (
        <View
          style={[
            styles.topBar,
            {
              top: insets.top + Spacing.sm,
              backgroundColor: theme.backgroundDefault,
            },
          ]}
        >
          <Feather name="map-pin" size={13} color="#2563EB" />
          <ThemedText type="small" style={{ color: theme.text }}>
            {detectedRegion ?? "New Zealand"}
          </ThemedText>
        </View>
      )}

      {/* Always-visible legend — bottom left */}
      {loadState === "ready" && (
        <View
          style={[
            styles.legend,
            { bottom: insets.bottom + 20 },
          ]}
        >
          <ThemedText
            type="small"
            style={styles.legendTitle}
          >
            Accessibility Legend
          </ThemedText>

          {LEGEND_ITEMS.map(({ color, label }) => (
            <View key={label} style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: color }]} />
              <ThemedText style={styles.legendLabel}>{label}</ThemedText>
            </View>
          ))}
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  loadingText: {
    color: "#fff",
    marginTop: Spacing.sm,
  },

  topBar: {
    position: "absolute",
    alignSelf: "center",
    left: undefined,
    right: undefined,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },

  legend: {
    position: "absolute",
    left: 10,
    backgroundColor: "#ffffff",
    borderRadius: 7,
    padding: 6,
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  legendTitle: {
    fontSize: 9,
    fontWeight: "700",
    color: "#111",
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    flexShrink: 0,
  },
  legendLabel: {
    fontSize: 9,
    color: "#222",
    lineHeight: 13,
  },
});
