import React from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useQuery } from "@tanstack/react-query";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { SciNewsCard } from "@/components/SciNewsCard";
import { useTheme } from "@/hooks/useTheme";
import { getSciNews, type NewsArticle } from "@/services/newsService";
import { Spacing, BorderRadius } from "@/constants/theme";

const FILTERS = [
  "All",
  "Breakthrough",
  "Clinical Trial",
  "Rehab",
  "Research",
] as const;

type Filter = (typeof FILTERS)[number];

export default function SciNewsListScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const [selectedFilter, setSelectedFilter] = React.useState<Filter>("All");

  const { data: articles = [], isLoading, error, refetch } = useQuery({
    queryKey: ["sciNews"],
    queryFn: getSciNews,
    staleTime: 30 * 60 * 1000,
  });

  const filteredArticles = React.useMemo(() => {
    if (selectedFilter === "All") return articles;
    return articles.filter((a) => a.category === selectedFilter);
  }, [articles, selectedFilter]);

  const renderItem = ({ item }: { item: NewsArticle }) => (
    <View style={styles.cardContainer}>
      <SciNewsCard {...item} variant="grid" />
    </View>
  );

  const renderFilter = ({ item }: { item: Filter }) => {
    const isActive = item === selectedFilter;
    return (
      <Pressable
        onPress={() => setSelectedFilter(item)}
        style={({ pressed }) => [
          styles.filterPill,
          {
            backgroundColor: isActive ? theme.primary : theme.backgroundSecondary,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <ThemedText
          style={[
            styles.filterLabel,
            { color: isActive ? theme.primaryText : theme.text },
          ]}
        >
          {item}
        </ThemedText>
      </Pressable>
    );
  };

  return (
    <ThemedView style={styles.container}>
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <ThemedText
            type="subtitle"
            style={{ color: theme.text, marginBottom: Spacing.md }}
          >
            Unable to load news
          </ThemedText>
          <Pressable
            onPress={() => refetch()}
            style={({ pressed }) => [
              styles.retryButton,
              { opacity: pressed ? 0.7 : 1, backgroundColor: theme.primary },
            ]}
          >
            <ThemedText
              type="default"
              style={{ color: theme.primaryText, fontWeight: "600" }}
            >
              Retry
            </ThemedText>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filteredArticles}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          ListHeaderComponent={
            <>
              <FlatList
                data={FILTERS}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item}
                renderItem={renderFilter}
                contentContainerStyle={styles.filterBar}
                style={styles.filterList}
              />
              {filteredArticles.length === 0 && (
                <View style={styles.emptyState}>
                  <ThemedText style={{ opacity: 0.6 }}>
                    No articles found for this category.
                  </ThemedText>
                </View>
              )}
            </>
          }
          contentContainerStyle={{
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: insets.bottom + Spacing.lg,
            paddingHorizontal: Spacing.lg,
            gap: Spacing.md,
          }}
          scrollIndicatorInsets={{ bottom: insets.bottom }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
  },
  retryButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.medium,
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  filterList: {
    marginHorizontal: -Spacing.lg,
    marginBottom: Spacing.sm,
  },
  filterBar: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xs,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  columnWrapper: {
    gap: Spacing.md,
  },
  cardContainer: {
    flex: 1,
  },
  emptyState: {
    alignItems: "center",
    marginTop: 40,
  },
});
