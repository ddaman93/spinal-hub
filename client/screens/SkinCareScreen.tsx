import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { SKIN_CARE_SECTIONS, SkinCareImage } from "@/data/sciSkinCare";

/* ── lightbox ── */
function ImageLightbox({
  image,
  onClose,
}: {
  image: SkinCareImage;
  onClose: () => void;
}) {
  const { theme } = useTheme();
  return (
    <Modal visible animationType="fade" transparent onRequestClose={onClose}>
      <Pressable
        style={[styles.lightboxBackdrop, { backgroundColor: "rgba(0,0,0,0.9)" }]}
        onPress={onClose}
      >
        <Image
          source={{ uri: image.url }}
          style={styles.lightboxImage}
          resizeMode="contain"
          accessible
          accessibilityLabel={image.alt}
        />
        <ThemedText type="small" style={styles.lightboxCaption}>
          {image.alt}
        </ThemedText>
        <Pressable style={styles.lightboxClose} onPress={onClose}>
          <Feather name="x" size={26} color="#FFFFFF" />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/* ── image row ── */
function ImageRow({ images }: { images: SkinCareImage[] }) {
  const [lightbox, setLightbox] = useState<SkinCareImage | null>(null);
  if (!images.length) return null;
  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.imageRow}
      >
        {images.map((img) => (
          <Pressable key={img.url} onPress={() => setLightbox(img)}>
            <Image
              source={{ uri: img.url }}
              style={styles.thumbnail}
              resizeMode="cover"
              accessible
              accessibilityLabel={img.alt}
            />
          </Pressable>
        ))}
      </ScrollView>
      {lightbox && (
        <ImageLightbox image={lightbox} onClose={() => setLightbox(null)} />
      )}
    </>
  );
}

/* ── section card ── */
function SectionCard({ section }: { section: typeof SKIN_CARE_SECTIONS[number] }) {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
      {/* header */}
      <Pressable
        onPress={() => setExpanded((v) => !v)}
        style={styles.cardHeader}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
      >
        <View style={[styles.colorBar, { backgroundColor: section.color }]} />
        <ThemedText type="h4" style={styles.cardTitle}>
          {section.title}
        </ThemedText>
        <Feather
          name={expanded ? "chevron-up" : "chevron-down"}
          size={20}
          color={theme.textSecondary}
        />
      </Pressable>

      {expanded && (
        <View style={styles.cardBody}>
          {section.intro ? (
            <ThemedText type="body" style={[styles.intro, { color: theme.textSecondary }]}>
              {section.intro}
            </ThemedText>
          ) : null}

          {section.warning ? (
            <View style={[styles.warningBox, { backgroundColor: "#FF3B3022", borderColor: "#FF3B30" }]}>
              <Feather name="alert-triangle" size={16} color="#FF3B30" />
              <ThemedText type="small" style={[styles.warningText, { color: "#FF3B30" }]}>
                {section.warning}
              </ThemedText>
            </View>
          ) : null}

          {section.images && section.images.length > 0 ? (
            <ImageRow images={section.images} />
          ) : null}

          {section.bullets && section.bullets.length > 0 ? (
            <View style={styles.bulletList}>
              {section.bullets.map((b, i) => (
                <View key={i} style={styles.bulletRow}>
                  <View style={[styles.bulletDot, { backgroundColor: section.color }]} />
                  <ThemedText type="body" style={styles.bulletText}>
                    {b}
                  </ThemedText>
                </View>
              ))}
            </View>
          ) : null}

          {section.subsections?.map((sub) => (
            <View key={sub.title} style={styles.subsection}>
              <ThemedText type="h4" style={[styles.subTitle, { color: section.color }]}>
                {sub.title}
              </ThemedText>
              <ThemedText type="body" style={{ color: theme.textSecondary }}>
                {sub.body}
              </ThemedText>
              {sub.images && sub.images.length > 0 ? (
                <ImageRow images={sub.images} />
              ) : null}
            </View>
          ))}

          {section.source ? (
            <ThemedText
              type="small"
              style={[styles.source, { color: theme.textSecondary }]}
            >
              {section.source}
            </ThemedText>
          ) : null}
        </View>
      )}
    </View>
  );
}

/* ── screen ── */
export default function SkinCareScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: Spacing.lg, paddingBottom: insets.bottom + Spacing.xxl },
        ]}
      >
        {/* hero */}
        <View style={[styles.hero, { backgroundColor: theme.backgroundDefault }]}>
          <Feather name="shield" size={32} color="#007AFF" />
          <View style={{ flex: 1 }}>
            <ThemedText type="h3">Skin Care After SCI</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Tap any section to expand. Tap images to enlarge.
            </ThemedText>
          </View>
        </View>

        {/* stats bar */}
        <View style={styles.statsRow}>
          {[
            { value: "25–66%", label: "SCI patients\naffected" },
            { value: "$70k", label: "avg cost per\nfull-thickness wound" },
            { value: "60k", label: "deaths/year\nattributed" },
          ].map((s) => (
            <View
              key={s.label}
              style={[styles.statCard, { backgroundColor: theme.backgroundDefault }]}
            >
              <ThemedText type="h3" style={{ color: "#FF3B30" }}>
                {s.value}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: "center" }}>
                {s.label}
              </ThemedText>
            </View>
          ))}
        </View>

        {/* sections */}
        {SKIN_CARE_SECTIONS.map((section) => (
          <SectionCard key={section.id} section={section} />
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  hero: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.medium,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.medium,
    gap: 2,
  },
  card: {
    borderRadius: BorderRadius.medium,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  colorBar: {
    width: 4,
    height: 28,
    borderRadius: 2,
  },
  cardTitle: {
    flex: 1,
  },
  cardBody: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: Spacing.md,
  },
  intro: {
    lineHeight: 22,
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.small,
    borderLeftWidth: 3,
  },
  warningText: {
    flex: 1,
    lineHeight: 18,
  },
  bulletList: {
    gap: Spacing.sm,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
    flexShrink: 0,
  },
  bulletText: {
    flex: 1,
    lineHeight: 22,
  },
  subsection: {
    gap: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(128,128,128,0.2)",
  },
  subTitle: {
    fontWeight: "600",
  },
  imageRow: {
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  thumbnail: {
    width: 160,
    height: 120,
    borderRadius: BorderRadius.small,
    backgroundColor: "#1a1a1a",
  },
  lightboxBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  lightboxImage: {
    width: "100%",
    height: "70%",
  },
  lightboxCaption: {
    color: "#CCCCCC",
    textAlign: "center",
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  lightboxClose: {
    position: "absolute",
    top: 56,
    right: Spacing.xl,
  },
  source: {
    fontStyle: "italic",
    marginTop: Spacing.sm,
  },
});
