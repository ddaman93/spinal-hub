import React from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useQuery } from "@tanstack/react-query";
import { Linking } from "react-native";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { getApiUrl } from "@/lib/query-client";
import { Spacing, BorderRadius } from "@/constants/theme";

type NewsArticle = {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  imageUrl?: string;
};

async function fetchSciNews(): Promise<NewsArticle[]> {
  try {
    const baseUrl = getApiUrl();
    const response = await fetch(`${baseUrl}/api/sci-news`);

    if (!response.ok) {
      throw new Error(`Failed to fetch news: ${response.status}`);
    }

    const articles: NewsArticle[] = await response.json();
    return articles;
  } catch (error) {
    console.error("Error fetching SCI news:", error);
    throw error;
  }
}

export default function SciNewsListScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const { data: articles = [], isLoading, error, refetch } = useQuery({
    queryKey: ["sciNews"],
    queryFn: fetchSciNews,
    staleTime: 6 * 60 * 60 * 1000, // 6 hours
    refetchInterval: 6 * 60 * 60 * 1000, // Refetch every 6 hours
  });

  const renderNewsCard = ({ item }: { item: NewsArticle }) => (
    <Pressable
      onPress={() => {
        if (item.url) {
          Linking.openURL(item.url);
        }
      }}
      style={({ pressed }) => [
        styles.cardContainer,
        { opacity: pressed ? 0.7 : 1 },
      ]}
      accessible
      accessibilityRole="button"
      accessibilityLabel={item.title}
    >
      <ThemedView
        style={[
          styles.card,
          { backgroundColor: theme.backgroundDefault },
        ]}
      >
        {item.imageUrl && (
          <Image
            source={{ uri: item.imageUrl }}
            style={[styles.cardImage, { backgroundColor: theme.backgroundTertiary }]}
          />
        )}

        <View style={styles.cardContent}>
          <ThemedText
            type="small"
            style={[styles.cardTitle, { color: theme.text }]}
            numberOfLines={3}
          >
            {item.title}
          </ThemedText>

          {item.publishedAt && (
            <ThemedText
              type="caption"
              style={[styles.cardDate, { color: theme.textSecondary }]}
            >
              {new Date(item.publishedAt).toLocaleDateString()}
            </ThemedText>
          )}
        </View>
      </ThemedView>
    </Pressable>
  );

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
          data={articles}
          renderItem={renderNewsCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
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
  columnWrapper: {
    gap: Spacing.md,
  },
  cardContainer: {
    flex: 1,
  },
  card: {
    borderRadius: BorderRadius.medium,
    overflow: "hidden",
    minHeight: 240,
  },
  cardImage: {
    width: "100%",
    height: 120,
  },
  cardContent: {
    padding: Spacing.sm,
    flex: 1,
    justifyContent: "space-between",
  },
  cardTitle: {
    fontWeight: "600",
    lineHeight: 16,
  },
  cardDate: {
    marginTop: Spacing.xs,
    opacity: 0.7,
  },
});
