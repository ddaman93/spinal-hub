import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Location from "expo-location";
import { Feather } from "@expo/vector-icons";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { MobilityTaxiCard } from "@/components/MobilityTaxiCard";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { MainStackParamList } from "@/types/navigation";
import { mobilityTaxiCompanies } from "@/data/mobilityTaxisNZ";
import { detectRegion } from "@/utils/detectRegion";

const ALL_REGIONS = [
  "All",
  "Auckland",
  "Wellington",
  "Christchurch",
  "Hamilton",
  "Tauranga",
  "Napier / Hastings",
  "Dunedin",
  "Queenstown",
  "Palmerston North",
  "Kapiti Coast",
  "Lower Hutt",
  "Upper Hutt",
];

export default function MobilityTaxiListScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const [selectedRegion, setSelectedRegion] = useState("All");
  const [detectedRegion, setDetectedRegion] = useState<string | null>(null);
  const [locating, setLocating] = useState(true);

  /* ── GPS auto-detect on mount ── */
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLocating(false);
          return;
        }
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const region = detectRegion(pos.coords.latitude, pos.coords.longitude);
        setDetectedRegion(region);
        // Only auto-select if we got a specific region (not Nationwide)
        if (region !== "Nationwide") {
          setSelectedRegion(region);
        }
      } catch {
        // Location unavailable — stay on "All"
      } finally {
        setLocating(false);
      }
    })();
  }, []);

  const filtered =
    selectedRegion === "All"
      ? mobilityTaxiCompanies
      : mobilityTaxiCompanies.filter((c) => c.regions.includes(selectedRegion));

  // Deduplicate
  const unique = filtered.filter(
    (c, i, arr) => arr.findIndex((x) => x.id === c.id) === i,
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xl,
          paddingHorizontal: Spacing.lg,
          gap: Spacing.md,
        }}
      >
        {/* Header */}
        <View>
          <ThemedText type="heading">Mobility Taxis</ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
            Wheelchair accessible taxi services across New Zealand
          </ThemedText>
        </View>

        {/* GPS region banner */}
        <View
          style={[
            styles.locationBanner,
            { backgroundColor: theme.backgroundDefault },
          ]}
        >
          {locating ? (
            <>
              <ActivityIndicator size="small" color="#1A7F64" />
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Detecting your region…
              </ThemedText>
            </>
          ) : detectedRegion ? (
            <>
              <Feather name="map-pin" size={14} color="#1A7F64" />
              <ThemedText type="small" style={{ color: theme.text }}>
                Region detected:{" "}
                <ThemedText type="small" style={{ color: "#1A7F64", fontWeight: "600" }}>
                  {detectedRegion}
                </ThemedText>
              </ThemedText>
            </>
          ) : (
            <>
              <Feather name="map-pin" size={14} color={theme.textSecondary} />
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Location unavailable — showing all regions
              </ThemedText>
            </>
          )}
        </View>

        {/* Region filter pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillRow}
        >
          {ALL_REGIONS.map((region) => {
            const active = selectedRegion === region;
            const isDetected = region === detectedRegion;
            return (
              <Pressable
                key={region}
                onPress={() => setSelectedRegion(region)}
                style={[
                  styles.pill,
                  {
                    backgroundColor: active ? "#1A7F64" : theme.backgroundDefault,
                    borderColor: active
                      ? "#1A7F64"
                      : isDetected
                        ? "#1A7F64"
                        : theme.border ?? theme.backgroundDefault,
                  },
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`Filter by ${region}`}
              >
                {isDetected && !active && (
                  <Feather name="map-pin" size={10} color="#1A7F64" />
                )}
                <ThemedText
                  type="small"
                  style={{
                    color: active ? "#fff" : isDetected ? "#1A7F64" : theme.textSecondary,
                    fontWeight: active || isDetected ? "600" : "400",
                  }}
                >
                  {region}
                </ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Results count */}
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {unique.length} provider{unique.length !== 1 ? "s" : ""} found
        </ThemedText>

        {/* Cards */}
        {unique.map((company) => (
          <MobilityTaxiCard
            key={company.id}
            company={company}
            onPress={() =>
              navigation.navigate("MobilityTaxiDetail", { companyId: company.id })
            }
          />
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  locationBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.medium,
    minHeight: 44,
  },
  pillRow: {
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full ?? 999,
    borderWidth: 1,
  },
});
