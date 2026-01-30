import React, { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useRoute, useNavigation } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { AssistiveTechCard } from "@/components/AssistiveTechCard";
import { Spacing } from "@/constants/theme";
import { MainStackParamList } from "@/types/navigation";
import { ASSISTIVE_TECH_ITEMS } from "@/data/assistiveTech";
import { TECH_CATEGORIES } from "@/data/techCategories";
import { TECH_SUBSECTIONS, getSubsectionItems } from "@/config/techSubsections";

type AllAssistiveTechScreenProps = NativeStackScreenProps<
  MainStackParamList,
  "AllAssistiveTech"
>;

/* ───────────────────────── screen ───────────────────────── */

export default function AllAssistiveTechScreen({}: AllAssistiveTechScreenProps) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const route = useRoute<AllAssistiveTechScreenProps["route"]>();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    route.params?.categoryId
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Check if category has subsections
  const hasSubsections = selectedCategory && TECH_SUBSECTIONS[selectedCategory];

  // Filter items based on category and search
  const filteredItems = useMemo(() => {
    let items = ASSISTIVE_TECH_ITEMS;

    if (selectedCategory) {
      items = items.filter((item) => item.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.summary.toLowerCase().includes(query) ||
          item.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return items;
  }, [selectedCategory, searchQuery]);

  // Get subsection items
  const getSubsectionItemsLocal = (filterTags: string[]) => {
    return filteredItems
      .filter((item) => filterTags.some((tag) => item.tags.includes(tag)))
      .slice(0, 4);
  };

  const selectedCategoryTitle = selectedCategory
    ? TECH_CATEGORIES.find((cat) => cat.id === selectedCategory)?.title
    : "All Assistive Technology";

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xl,
          paddingHorizontal: Spacing.lg,
          width: "100%",
        }}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <ThemedText type="heading">{selectedCategoryTitle}</ThemedText>
          <ThemedText type="small" style={styles.subtitle}>
            {selectedCategory
              ? TECH_CATEGORIES.find((cat) => cat.id === selectedCategory)
                  ?.description
              : "Browse all assistive technology solutions to find the right tools for your needs."}
          </ThemedText>
        </View>

        {/* SEARCH BAR */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search assistive tech..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* CATEGORY FILTER TABS */}
        <View style={styles.filterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: Spacing.xs }}
          >
            <Pressable
              style={[
                styles.filterTab,
                !selectedCategory && styles.filterTabActive,
              ]}
              onPress={() => setSelectedCategory(undefined)}
            >
              <ThemedText
                type="caption"
                style={[
                  styles.filterTabText,
                  !selectedCategory && styles.filterTabTextActive,
                ]}
              >
                All
              </ThemedText>
            </Pressable>

            {TECH_CATEGORIES.slice(0, 3).map((category) => (
              <Pressable
                key={category.id}
                style={[
                  styles.filterTab,
                  selectedCategory === category.id &&
                    styles.filterTabActive,
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <ThemedText
                  type="caption"
                  style={[
                    styles.filterTabText,
                    selectedCategory === category.id &&
                      styles.filterTabTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {category.title}
                </ThemedText>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* CATEGORY FILTER TABS - ROW 2 */}
        <View style={styles.filterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: Spacing.xs }}
          >
            {TECH_CATEGORIES.slice(3).map((category) => (
              <Pressable
                key={category.id}
                style={[
                  styles.filterTab,
                  selectedCategory === category.id &&
                    styles.filterTabActive,
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <ThemedText
                  type="caption"
                  style={[
                    styles.filterTabText,
                    selectedCategory === category.id &&
                      styles.filterTabTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {category.title}
                </ThemedText>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* RESULTS COUNT */}
        {!hasSubsections && (
          <ThemedText type="caption" style={styles.resultCount}>
            {filteredItems.length}{" "}
            {filteredItems.length === 1 ? "result" : "results"}
          </ThemedText>
        )}

        {/* SUBSECTIONS VIEW (if category selected and has subsections) */}
        {hasSubsections && selectedCategory ? (
          <View style={styles.subsectionsContainer}>
            {TECH_SUBSECTIONS[selectedCategory].map((subsection) => {
              const subsectionItems = getSubsectionItemsLocal(subsection.filterTags);
              return (
                <View key={subsection.id} style={styles.subsectionBlock}>
                  {/* SUBSECTION HEADER */}
                  <View style={styles.subsectionHeader}>
                    <ThemedText type="small" style={{ fontWeight: "600" }}>
                      {subsection.title}
                    </ThemedText>
                    <Pressable
                      onPress={() => navigation.navigate(subsection.seeAllRoute)}
                    >
                      <ThemedText type="caption" style={styles.seeAllLink}>
                        See all →
                      </ThemedText>
                    </Pressable>
                  </View>

                  {/* SUBSECTION PREVIEW ITEMS */}
                  {subsectionItems.length > 0 ? (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ paddingVertical: Spacing.sm }}
                    >
                      {subsectionItems.map((item, index) => (
                        <View
                          key={item.id}
                          style={[
                            styles.previewCardWrapper,
                            index < subsectionItems.length - 1 &&
                              styles.previewCardMargin,
                          ]}
                        >
                          <AssistiveTechCard item={item} variant="carousel" />
                        </View>
                      ))}
                    </ScrollView>
                  ) : (
                    <ThemedText type="caption" style={styles.noItems}>
                      No items available
                    </ThemedText>
                  )}
                </View>
              );
            })}
          </View>
        ) : filteredItems.length > 0 ? (
          /* ASSISTIVE TECH GRID (default flat view) */
          <View style={styles.grid}>
            {filteredItems.map((item) => (
              <View key={item.id} style={styles.cardContainer}>
                <AssistiveTechCard item={item} />
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <ThemedText type="small" style={styles.emptyStateText}>
              No assistive tech found for "{searchQuery}". Try different keywords
              or browse all categories.
            </ThemedText>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

/* ───────────────── styles ───────────────── */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    marginBottom: Spacing.lg,
  },

  subtitle: {
    opacity: 0.7,
    marginTop: Spacing.xs,
  },

  searchContainer: {
    marginBottom: Spacing.lg,
  },

  searchInput: {
    borderRadius: 8,
    backgroundColor: "#2C2C2E",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: "#FFF",
    fontSize: 16,
  },

  filterContainer: {
    marginBottom: Spacing.lg,
  },

  filterTab: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 16,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#3A3A3C",
  },

  filterTabActive: {
    backgroundColor: "#3AA6FF",
    borderColor: "#3AA6FF",
  },

  filterTabText: {
    color: "#999",
  },

  filterTabTextActive: {
    color: "#000",
    fontWeight: "600",
  },

  resultCount: {
    opacity: 0.6,
    marginBottom: Spacing.md,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: Spacing.md,
  },

  cardContainer: {
    width: "48%",
    aspectRatio: 1,
    marginBottom: Spacing.md,
  },

  emptyState: {
    paddingVertical: Spacing.xl * 2,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyStateText: {
    opacity: 0.6,
    textAlign: "center",
  },

  subsectionsContainer: {
    marginTop: Spacing.md,
  },

  subsectionBlock: {
    marginBottom: Spacing.lg,
  },

  subsectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },

  seeAllLink: {
    color: "#3AA6FF",
    fontWeight: "500",
  },

  previewCardWrapper: {
    width: 220,
  },

  previewCardMargin: {
    marginRight: Spacing.md,
  },

  noItems: {
    opacity: 0.6,
  },
});
