import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  Alert,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

const BRAND_COLOR = "#1A6B9E";
const BOOK_IMAGE_URL =
  "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/Spinal%20hub%20photos/Books/Back%20on%20track.jpg";
const BUY_URL =
  "https://nzspinaltrust.org.nz/product/back-on-track-4th-edition/";

async function openURL(url: string) {
  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Error", "Unable to open this link");
    }
  } catch {
    Alert.alert("Error", "Something went wrong opening this link");
  }
}

export default function BackOnTrackScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

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
        {/* Book cover image */}
        <View style={[styles.imageCard, { shadowColor: theme.text }]}>
          <Image
            source={{ uri: BOOK_IMAGE_URL }}
            style={styles.bookImage}
            resizeMode="contain"
            accessibilityLabel="Back on Track book cover"
          />
        </View>

        {/* Title & description card */}
        <View
          style={[
            styles.card,
            styles.infoCard,
            { backgroundColor: theme.backgroundDefault },
          ]}
        >
          <View style={[styles.accentBar, { backgroundColor: BRAND_COLOR }]} />
          <View style={styles.cardContent}>
            <ThemedText type="h3" style={{ color: theme.text }}>
              Back on Track
            </ThemedText>
            <ThemedText
              type="body"
              style={[styles.edition, { color: BRAND_COLOR }]}
            >
              4th Edition — NZ Spinal Trust
            </ThemedText>
            <ThemedText
              type="body"
              style={[styles.body, { color: theme.textSecondary }]}
            >
              Back on Track is the NZ Spinal Trust's essential guide for people
              living with a spinal cord injury. Written by New Zealanders for
              New Zealanders, this comprehensive resource covers everything from
              the early days of rehabilitation through to life in the community —
              including daily care, health management, relationships, equipment,
              and practical strategies for living well with SCI.
            </ThemedText>
            <ThemedText
              type="body"
              style={[styles.body, { color: theme.textSecondary }]}
            >
              Whether you're newly injured, a carer, or a health professional,
              Back on Track provides trusted, locally relevant information to
              help you navigate life after spinal cord injury.
            </ThemedText>
          </View>
        </View>

        {/* Buy button */}
        <Pressable
          onPress={() => openURL(BUY_URL)}
          style={({ pressed }) => [
            styles.buyButton,
            { backgroundColor: BRAND_COLOR, opacity: pressed ? 0.82 : 1 },
          ]}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Buy Back on Track from the NZ Spinal Trust store"
        >
          <Feather name="shopping-cart" size={18} color="#FFFFFF" />
          <ThemedText style={styles.buyButtonText}>
            Buy from NZ Spinal Trust
          </ThemedText>
          <Feather name="external-link" size={16} color="rgba(255,255,255,0.7)" />
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  imageCard: {
    borderRadius: BorderRadius.large,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  bookImage: {
    width: "100%",
    height: 240,
  },

  card: {
    borderRadius: BorderRadius.medium,
    overflow: "hidden",
  },
  infoCard: {
    position: "relative",
  },
  accentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  cardContent: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  edition: {
    fontWeight: "600",
    fontSize: 13,
  },
  body: {
    lineHeight: 22,
  },

  buyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.medium,
    minHeight: 52,
  },
  buyButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
});
