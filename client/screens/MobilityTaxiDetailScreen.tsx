import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { RouteProp, useRoute } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { MainStackParamList } from "@/types/navigation";
import { mobilityTaxiCompanies } from "@/data/mobilityTaxisNZ";

const BRAND_COLOR = "#1A7F64";

async function tryOpen(url: string) {
  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Error", "Unable to open this link");
    }
  } catch {
    Alert.alert("Error", "Something went wrong");
  }
}

export default function MobilityTaxiDetailScreen() {
  const route =
    useRoute<RouteProp<MainStackParamList, "MobilityTaxiDetail">>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const company = mobilityTaxiCompanies.find(
    (c) => c.id === route.params.companyId,
  );

  if (!company) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="body" style={{ padding: Spacing.lg }}>
          Company not found.
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.md,
          paddingBottom: insets.bottom + Spacing.xl,
          paddingHorizontal: Spacing.lg,
          gap: Spacing.md,
        }}
      >
        {/* Header card */}
        <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
          <View style={[styles.accentBar, { backgroundColor: BRAND_COLOR }]} />
          <View style={styles.cardContent}>
            <View style={[styles.iconBg, { backgroundColor: "rgba(26,127,100,0.12)" }]}>
              <Feather name="truck" size={24} color={BRAND_COLOR} />
            </View>
            <ThemedText type="h3" style={{ color: theme.text, marginTop: Spacing.sm }}>
              {company.name}
            </ThemedText>
            {company.wheelchairAccessible && (
              <View style={[styles.badge, { backgroundColor: "rgba(26,127,100,0.12)" }]}>
                <Feather name="check-circle" size={13} color={BRAND_COLOR} />
                <ThemedText type="small" style={{ color: BRAND_COLOR, fontWeight: "600" }}>
                  Wheelchair Accessible
                </ThemedText>
              </View>
            )}
          </View>
        </View>

        {/* Regions */}
        <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.cardContent}>
            <View style={styles.row}>
              <Feather name="map-pin" size={20} color={BRAND_COLOR} />
              <ThemedText type="h4" style={{ color: theme.text }}>
                Regions Served
              </ThemedText>
            </View>
            <View style={styles.regionsList}>
              {company.regions.map((r) => (
                <View
                  key={r}
                  style={[styles.regionChip, { backgroundColor: "rgba(26,127,100,0.08)" }]}
                >
                  <ThemedText type="small" style={{ color: BRAND_COLOR, fontWeight: "500" }}>
                    {r}
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Contact info */}
        <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.cardContent}>
            <View style={styles.row}>
              <Feather name="phone" size={20} color={BRAND_COLOR} />
              <ThemedText type="h4" style={{ color: theme.text }}>
                Contact
              </ThemedText>
            </View>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              {company.phone}
            </ThemedText>
            {company.website && (
              <ThemedText
                type="small"
                style={{ color: theme.textSecondary, marginTop: Spacing.xs }}
              >
                {company.website}
              </ThemedText>
            )}
            {company.email && (
              <ThemedText
                type="small"
                style={{ color: theme.textSecondary, marginTop: Spacing.xs }}
              >
                {company.email}
              </ThemedText>
            )}
          </View>
        </View>

        {/* Notes */}
        {company.notes && (
          <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.cardContent}>
              <View style={styles.row}>
                <Feather name="info" size={20} color={BRAND_COLOR} />
                <ThemedText type="h4" style={{ color: theme.text }}>
                  Notes
                </ThemedText>
              </View>
              <ThemedText type="body" style={{ color: theme.textSecondary, lineHeight: 22 }}>
                {company.notes}
              </ThemedText>
            </View>
          </View>
        )}

        {/* CTA buttons */}
        <Pressable
          onPress={() => tryOpen(`tel:${company.phone.replace(/\s/g, "")}`)}
          style={({ pressed }) => [
            styles.ctaButton,
            { backgroundColor: BRAND_COLOR, opacity: pressed ? 0.8 : 1 },
          ]}
          accessible
          accessibilityRole="button"
          accessibilityLabel={`Call ${company.name}`}
        >
          <Feather name="phone" size={20} color="#fff" />
          <ThemedText type="body" style={styles.ctaText}>
            Call Taxi
          </ThemedText>
        </Pressable>

        {company.website && (
          <Pressable
            onPress={() => tryOpen(company.website!)}
            style={({ pressed }) => [
              styles.ctaButton,
              styles.ctaOutline,
              {
                borderColor: BRAND_COLOR,
                backgroundColor: "transparent",
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            accessible
            accessibilityRole="button"
            accessibilityLabel={`Visit ${company.name} website`}
          >
            <Feather name="external-link" size={20} color={BRAND_COLOR} />
            <ThemedText type="body" style={[styles.ctaText, { color: BRAND_COLOR }]}>
              Visit Website
            </ThemedText>
          </Pressable>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: {
    borderRadius: BorderRadius.medium,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  accentBar: {
    height: 4,
    width: "100%",
  },
  cardContent: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  iconBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  regionsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  regionChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 20,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: BorderRadius.medium,
    minHeight: 56,
  },
  ctaOutline: {
    borderWidth: 2,
  },
  ctaText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
