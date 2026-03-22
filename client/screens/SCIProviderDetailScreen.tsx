import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Linking,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { RouteProp, useRoute } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { MainStackParamList } from "@/types/navigation";

/* ─── constants ─── */

const BRAND_COLOR = "#7C3AED";
const CHECK_COLOR = "#16A34A";
const STAR_COLOR = "#F59E0B";
const DANGER_COLOR = "#DC2626";

const INTERVIEW_QUESTIONS = [
  "Do your carers have training in bowel routine care for spinal cord injury clients?",
  "Do you provide overnight carers or sleepover shifts?",
  "Can you supply backup carers if someone calls in sick?",
  "Do you train carers specifically for tetraplegia or high-level spinal injuries?",
];

/* ─── types ─── */

type Review = {
  id: string;
  rating: number;
  comment: string;
  date: string;
};

/* ─── sub-components ─── */

function CapabilityRow({ label, enabled }: { label: string; enabled: boolean }) {
  const { theme } = useTheme();
  return (
    <View style={styles.capabilityRow}>
      <Feather
        name={enabled ? "check-circle" : "circle"}
        size={20}
        color={enabled ? CHECK_COLOR : theme.textSecondary}
      />
      <ThemedText
        style={[
          styles.capabilityLabel,
          { color: enabled ? CHECK_COLOR : theme.textSecondary },
        ]}
      >
        {label}
      </ThemedText>
    </View>
  );
}

function StarRow({
  rating,
  size = 20,
  onSelect,
}: {
  rating: number;
  size?: number;
  onSelect?: (n: number) => void;
}) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable
          key={n}
          onPress={() => onSelect?.(n)}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={`${n} star${n !== 1 ? "s" : ""}`}
        >
          <Feather name="star" size={size} color={n <= rating ? STAR_COLOR : "#D1D5DB"} />
        </Pressable>
      ))}
    </View>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.reviewCard, { backgroundColor: theme.backgroundDefault }]}>
      <View style={styles.reviewHeader}>
        <StarRow rating={review.rating} size={16} />
        <ThemedText style={[styles.reviewDate, { color: theme.textSecondary }]}>
          {review.date}
        </ThemedText>
      </View>
      {review.comment.length > 0 && (
        <ThemedText style={[styles.reviewComment, { color: theme.text }]}>
          {review.comment}
        </ThemedText>
      )}
    </View>
  );
}

function QuestionItem({
  question,
  checked,
  onToggle,
}: {
  question: string;
  checked: boolean;
  onToggle: () => void;
}) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onToggle}
      style={[styles.questionItem, { borderColor: theme.border ?? theme.backgroundDefault }]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={question}
    >
      <View
        style={[
          styles.checkbox,
          {
            borderColor: checked ? BRAND_COLOR : theme.textSecondary,
            backgroundColor: checked ? BRAND_COLOR : "transparent",
          },
        ]}
      >
        {checked && <Feather name="check" size={12} color="#fff" />}
      </View>
      <ThemedText
        style={[
          styles.questionText,
          { color: checked ? theme.text : theme.textSecondary },
        ]}
      >
        {question}
      </ThemedText>
    </Pressable>
  );
}

/* ─── main screen ─── */

export default function SCIProviderDetailScreen() {
  const route = useRoute<RouteProp<MainStackParamList, "SCIProviderDetail">>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { agency } = route.params;

  const STORAGE_KEY = `sci_reviews_${agency.id}`;

  /* state */
  const [reviews, setReviews] = useState<Review[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [draftRating, setDraftRating] = useState(0);
  const [draftComment, setDraftComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checkedQuestions, setCheckedQuestions] = useState<boolean[]>(
    INTERVIEW_QUESTIONS.map(() => false),
  );

  /* load reviews */
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((json) => {
      if (json) setReviews(JSON.parse(json) as Review[]);
    });
  }, [STORAGE_KEY]);

  /* derived */
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;

  /* handlers */
  const openModal = useCallback(() => {
    setDraftRating(0);
    setDraftComment("");
    setModalVisible(true);
  }, []);

  const submitReview = useCallback(async () => {
    if (draftRating === 0) {
      Alert.alert("Rating required", "Please select a star rating before submitting.");
      return;
    }
    setSubmitting(true);
    const newReview: Review = {
      id: Date.now().toString(),
      rating: draftRating,
      comment: draftComment.trim(),
      date: new Date().toLocaleDateString("en-NZ", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    };
    const updated = [newReview, ...reviews];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setReviews(updated);
    setSubmitting(false);
    setModalVisible(false);
  }, [draftRating, draftComment, reviews, STORAGE_KEY]);

  const toggleQuestion = useCallback((index: number) => {
    setCheckedQuestions((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  }, []);

  const callProvider = useCallback(() => {
    Linking.openURL(`tel:${agency.phone.replace(/\s/g, "")}`);
  }, [agency.phone]);

  const openWebsite = useCallback(() => {
    Linking.openURL(agency.website);
  }, [agency.website]);

  /* render */
  return (
    <ThemedView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.md,
          paddingBottom: insets.bottom + Spacing.xl,
          paddingHorizontal: Spacing.lg,
          gap: Spacing.lg,
        }}
      >
        {/* ── Header ── */}
        <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
          <View style={[styles.accentBar, { backgroundColor: BRAND_COLOR }]} />
          <View style={styles.cardContent}>
            <View style={[styles.iconBg, { backgroundColor: "rgba(124,58,237,0.12)" }]}>
              <Feather name="user-check" size={26} color={BRAND_COLOR} />
            </View>
            <ThemedText style={[styles.agencyName, { color: theme.text }]}>
              {agency.name}
            </ThemedText>
            <View style={styles.regionsRow}>
              <Feather name="map-pin" size={14} color={theme.textSecondary} />
              <ThemedText style={[styles.regionText, { color: theme.textSecondary }]}>
                {agency.regions.includes("All") ? "Nationwide" : agency.regions.join(" · ")}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* ── Capabilities ── */}
        <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.cardContent}>
            <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
              Capabilities
            </ThemedText>
            <View style={styles.capabilitiesList}>
              <CapabilityRow label="SCI Experienced" enabled={agency.sciExperienced} />
              <CapabilityRow label="Vent Support" enabled={agency.ventSupport} />
              <CapabilityRow label="Overnight Care" enabled={agency.overnightCare} />
              <CapabilityRow label="Bowel Routine Care" enabled={agency.bowelRoutineCare} />
            </View>
          </View>
        </View>

        {/* ── Rating summary ── */}
        <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.cardContent}>
            <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
              Community Rating
            </ThemedText>
            {avgRating !== null ? (
              <View style={styles.ratingRow}>
                <Feather name="star" size={28} color={STAR_COLOR} />
                <ThemedText style={[styles.ratingNumber, { color: theme.text }]}>
                  {avgRating.toFixed(1)}
                </ThemedText>
                <ThemedText style={[styles.ratingCount, { color: theme.textSecondary }]}>
                  average · {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                </ThemedText>
              </View>
            ) : (
              <ThemedText style={[styles.noReviews, { color: theme.textSecondary }]}>
                No reviews yet — be the first to review this provider.
              </ThemedText>
            )}
          </View>
        </View>

        {/* ── Interview questions ── */}
        <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.cardContent}>
            <View style={styles.sectionHeaderRow}>
              <Feather name="help-circle" size={20} color={BRAND_COLOR} />
              <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
                Questions to Ask This Provider
              </ThemedText>
            </View>
            <ThemedText style={[styles.questionSubtitle, { color: theme.textSecondary }]}>
              Tap each question to check it off as you work through them.
            </ThemedText>
            <View style={{ gap: Spacing.sm, marginTop: Spacing.md }}>
              {INTERVIEW_QUESTIONS.map((q, i) => (
                <QuestionItem
                  key={i}
                  question={q}
                  checked={checkedQuestions[i]}
                  onToggle={() => toggleQuestion(i)}
                />
              ))}
            </View>
          </View>
        </View>

        {/* ── Action buttons ── */}
        <Pressable
          onPress={callProvider}
          style={({ pressed }) => [
            styles.actionButton,
            { backgroundColor: CHECK_COLOR, opacity: pressed ? 0.85 : 1 },
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Call ${agency.name}`}
        >
          <Feather name="phone" size={22} color="#fff" />
          <ThemedText style={styles.actionButtonText}>Call Now</ThemedText>
        </Pressable>

        <Pressable
          onPress={openWebsite}
          style={({ pressed }) => [
            styles.actionButton,
            styles.actionButtonOutline,
            { borderColor: BRAND_COLOR, opacity: pressed ? 0.85 : 1 },
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Visit ${agency.name} website`}
        >
          <Feather name="external-link" size={22} color={BRAND_COLOR} />
          <ThemedText style={[styles.actionButtonText, { color: BRAND_COLOR }]}>
            Visit Website
          </ThemedText>
        </Pressable>

        <Pressable
          onPress={openModal}
          style={({ pressed }) => [
            styles.actionButton,
            styles.actionButtonOutline,
            { borderColor: STAR_COLOR, opacity: pressed ? 0.85 : 1 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Leave a review"
        >
          <Feather name="star" size={22} color={STAR_COLOR} />
          <ThemedText style={[styles.actionButtonText, { color: STAR_COLOR }]}>
            Leave Review
          </ThemedText>
        </Pressable>

        {/* ── Reviews list ── */}
        {reviews.length > 0 && (
          <View style={{ gap: Spacing.sm }}>
            <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
              Reviews
            </ThemedText>
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </View>
        )}
      </ScrollView>

      {/* ── Review modal ── */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalSheet, { backgroundColor: theme.backgroundDefault }]}>
            {/* Modal header */}
            <View style={styles.modalHeader}>
              <ThemedText style={[styles.modalTitle, { color: theme.text }]}>
                Leave a Review
              </ThemedText>
              <Pressable
                onPress={() => setModalVisible(false)}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Feather name="x" size={24} color={theme.textSecondary} />
              </Pressable>
            </View>

            {/* Star picker */}
            <ThemedText style={[styles.modalLabel, { color: theme.textSecondary }]}>
              Your rating
            </ThemedText>
            <StarRow rating={draftRating} size={36} onSelect={setDraftRating} />

            {/* Comment input */}
            <ThemedText
              style={[styles.modalLabel, { color: theme.textSecondary, marginTop: Spacing.lg }]}
            >
              Comment (optional)
            </ThemedText>
            <TextInput
              value={draftComment}
              onChangeText={setDraftComment}
              placeholder="Share your experience with this provider…"
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={4}
              style={[
                styles.textInput,
                {
                  color: theme.text,
                  borderColor: theme.border ?? theme.backgroundDefault,
                  backgroundColor: theme.background ?? theme.backgroundDefault,
                },
              ]}
              accessibilityLabel="Review comment"
            />

            {/* Submit */}
            <Pressable
              onPress={submitReview}
              disabled={submitting}
              style={({ pressed }) => [
                styles.submitButton,
                {
                  backgroundColor: draftRating > 0 ? BRAND_COLOR : theme.textSecondary,
                  opacity: pressed || submitting ? 0.75 : 1,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Submit review"
            >
              <ThemedText style={styles.submitButtonText}>
                {submitting ? "Saving…" : "Submit Review"}
              </ThemedText>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  /* cards */
  card: {
    borderRadius: BorderRadius.medium,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  accentBar: { height: 4, width: "100%" },
  cardContent: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },

  /* header */
  iconBg: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  agencyName: {
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 28,
  },
  regionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  regionText: {
    fontSize: 15,
  },

  /* section */
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },

  /* capabilities */
  capabilitiesList: {
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  capabilityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  capabilityLabel: {
    fontSize: 16,
    fontWeight: "500",
  },

  /* action buttons */
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
    paddingVertical: 18,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.medium,
    minHeight: 60,
  },
  actionButtonOutline: {
    backgroundColor: "transparent",
    borderWidth: 2,
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },

  /* rating */
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  ratingNumber: {
    fontSize: 28,
    fontWeight: "700",
  },
  ratingCount: {
    fontSize: 15,
  },
  noReviews: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: Spacing.xs,
  },

  /* star row */
  starRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },

  /* review card */
  reviewCard: {
    borderRadius: BorderRadius.medium,
    padding: Spacing.md,
    gap: Spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reviewDate: {
    fontSize: 13,
  },
  reviewComment: {
    fontSize: 15,
    lineHeight: 22,
  },

  /* interview questions */
  questionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  questionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
    flexShrink: 0,
  },
  questionText: {
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
  },

  /* modal */
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.medium,
    padding: Spacing.md,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
    marginTop: Spacing.xs,
  },
  submitButton: {
    marginTop: Spacing.lg,
    paddingVertical: 18,
    borderRadius: BorderRadius.medium,
    alignItems: "center",
    minHeight: 60,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
});
