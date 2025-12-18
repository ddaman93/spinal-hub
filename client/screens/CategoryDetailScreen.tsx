import React from "react";
import { View, StyleSheet, FlatList, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { CATEGORIES } from "@/config/catalog";


import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { MainStackParamList } from "@/types/navigation";

type CategoryDetailRouteProp = RouteProp<MainStackParamList, "CategoryDetail">;



export default function CategoryDetailScreen() {
  const route = useRoute<CategoryDetailRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { category } = route.params;

  const categoryConfig = CATEGORIES.find(c => c.id === category);
  const tools = categoryConfig?.tools ?? [];

  const handleToolPress = (tool) => {
    if (tool.route) {
      navigation.navigate(tool.route);
    }
  };


  const renderTool = ({ item }: { item: Tool }) => (
    <Pressable
      onPress={() => handleToolPress(item)}
      disabled={item.comingSoon}
      style={[
        styles.toolCard,
        { 
          backgroundColor: theme.backgroundDefault,
          opacity: item.comingSoon ? 0.6 : 1,
        },
      ]}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`${item.name}. ${item.description}${item.comingSoon ? ". Coming soon." : ""}`}
    >
      <View style={[styles.iconContainer, { backgroundColor: theme.primary + "20" }]}>
        <Feather name={item.icon} size={28} color={theme.primary} />
      </View>
      <View style={styles.toolContent}>
        <View style={styles.toolHeader}>
          <ThemedText type="h4" style={styles.toolName}>
            {item.name}
          </ThemedText>
          {item.comingSoon ? (
            <View style={[styles.comingSoonBadge, { backgroundColor: theme.backgroundSecondary }]}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Soon
              </ThemedText>
            </View>
          ) : (
            <Feather name="chevron-right" size={20} color={theme.textSecondary} />
          )}
        </View>
        <ThemedText
          type="body"
          style={[styles.toolDescription, { color: theme.textSecondary }]}
        >
          {item.description}
        </ThemedText>
      </View>
    </Pressable>
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={tools}
        renderItem={renderTool}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ThemedText type="body">No tools available yet.</ThemedText>
          </View>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  toolCard: {
    flexDirection: "row",
    padding: Spacing.lg,
    borderRadius: BorderRadius.medium,
    gap: Spacing.md,
    minHeight: 88,
    alignItems: "center",
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  toolContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  toolHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toolName: {
    flex: 1,
  },
  comingSoonBadge: {
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.small,
  },
  toolDescription: {
    opacity: 0.8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: Spacing.xxl,
  },
});
