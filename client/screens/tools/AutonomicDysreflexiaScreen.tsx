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
import { Feather } from "@expo/vector-icons";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

const AD_RED = "#D32F2F";
const AD_ORANGE = "#E64A19";

const SYMPTOMS = [
  "Sudden, severe pounding headache",
  "Sweating above the level of injury",
  "Flushed, blotchy, or red skin above injury level",
  "Pale, cold, or 'goosebump' skin below injury level",
  "Stuffy or runny nose",
  "Blurred vision or spots",
  "Slow heart rate (bradycardia)",
  "Feeling anxious or uneasy",
  "High blood pressure (often 20–40 mmHg above normal)",
];

const TRIGGERS = [
  { icon: "droplet" as const, label: "Bladder issues", detail: "Full bladder, blocked catheter, UTI (most common)" },
  { icon: "activity" as const, label: "Bowel problems", detail: "Constipation, impaction, gas distension" },
  { icon: "shield" as const, label: "Skin pressure", detail: "Pressure injury, ingrown nail, tight clothing or straps" },
  { icon: "thermometer" as const, label: "Temperature extremes", detail: "Burns, sunburn, extreme cold" },
  { icon: "scissors" as const, label: "Procedures", detail: "Surgical, dental, or medical procedures" },
  { icon: "zap" as const, label: "Other", detail: "Sexual activity, menstruation, kidney stones, fractures" },
];

const STEPS = [
  {
    step: "1",
    title: "Sit upright immediately",
    detail: "Raise the head of the bed or wheelchair to 90°. This alone can help lower blood pressure.",
  },
  {
    step: "2",
    title: "Loosen everything",
    detail: "Remove or loosen tight clothing, shoes, leg straps, abdominal binders, and anything constrictive.",
  },
  {
    step: "3",
    title: "Check the bladder first",
    detail: "Check catheter tubing for kinks, blockages, or a full leg bag. If no catheter, insert one. This resolves most episodes.",
  },
  {
    step: "4",
    title: "Check the bowel",
    detail: "If bladder is clear, check for bowel distension or impaction. Apply anaesthetic gel before any digital examination.",
  },
  {
    step: "5",
    title: "Check skin and pressure areas",
    detail: "Look for pressure injuries, ingrown toenails, tight footwear, or anything causing pain or irritation below injury level.",
  },
  {
    step: "6",
    title: "Monitor blood pressure",
    detail: "Check every 2–5 minutes. If BP stays high (>150 mmHg systolic) or symptoms worsen — call emergency services.",
  },
];

function SectionHeader({ icon, title, color = AD_RED }: { icon: keyof typeof Feather.glyphMap; title: string; color?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionIconWrap, { backgroundColor: color + "20" }]}>
        <Feather name={icon} size={16} color={color} />
      </View>
      <ThemedText style={[styles.sectionTitle, { color }]}>{title}</ThemedText>
    </View>
  );
}

export default function AutonomicDysreflexiaScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const callEmergency = () => {
    Alert.alert(
      "Call Emergency Services",
      "Call 111 (NZ) or your local emergency number?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Call 111", onPress: () => Linking.openURL("tel:111") },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xl,
          paddingHorizontal: Spacing.lg,
          gap: Spacing.lg,
        }}
      >
        {/* ── ALERT BANNER ── */}
        <View style={[styles.alertBanner, { backgroundColor: AD_RED }]}>
          <Feather name="alert-triangle" size={20} color="#fff" />
          <ThemedText style={styles.alertText}>
            AD is a medical emergency. If BP is very high or symptoms are severe — call 111 immediately.
          </ThemedText>
        </View>

        {/* ── WHAT IS AD ── */}
        <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
          <SectionHeader icon="info" title="What is Autonomic Dysreflexia?" color={AD_ORANGE} />
          <ThemedText style={[styles.body, { color: theme.textSecondary }]}>
            AD is an overreaction of the autonomic nervous system to a stimulus below the level of spinal cord injury.
            It primarily affects people with injuries at{" "}
            <ThemedText style={[styles.body, styles.bold, { color: theme.text }]}>T6 and above</ThemedText>,
            causing a sudden dangerous spike in blood pressure that can lead to stroke or death if not treated quickly.
          </ThemedText>
        </View>

        {/* ── SYMPTOMS ── */}
        <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
          <SectionHeader icon="alert-circle" title="Warning Signs" />
          {SYMPTOMS.map((s, i) => (
            <View key={i} style={styles.bulletRow}>
              <View style={[styles.bullet, { backgroundColor: AD_RED }]} />
              <ThemedText style={[styles.bulletText, { color: theme.textSecondary }]}>{s}</ThemedText>
            </View>
          ))}
        </View>

        {/* ── IMMEDIATE STEPS ── */}
        <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
          <SectionHeader icon="list" title="Immediate Response Steps" />
          {STEPS.map((item) => (
            <View key={item.step} style={[styles.stepRow, { borderLeftColor: AD_RED }]}>
              <View style={[styles.stepNumber, { backgroundColor: AD_RED }]}>
                <ThemedText style={styles.stepNumText}>{item.step}</ThemedText>
              </View>
              <View style={styles.stepContent}>
                <ThemedText style={[styles.stepTitle, { color: theme.text }]}>{item.title}</ThemedText>
                <ThemedText style={[styles.stepDetail, { color: theme.textSecondary }]}>{item.detail}</ThemedText>
              </View>
            </View>
          ))}
        </View>

        {/* ── TRIGGERS ── */}
        <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
          <SectionHeader icon="zap" title="Common Triggers" color={AD_ORANGE} />
          {TRIGGERS.map((t, i) => (
            <View
              key={i}
              style={[
                styles.triggerRow,
                i < TRIGGERS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border },
              ]}
            >
              <View style={[styles.triggerIcon, { backgroundColor: AD_ORANGE + "18" }]}>
                <Feather name={t.icon} size={15} color={AD_ORANGE} />
              </View>
              <View style={styles.triggerText}>
                <ThemedText style={[styles.triggerLabel, { color: theme.text }]}>{t.label}</ThemedText>
                <ThemedText style={[styles.triggerDetail, { color: theme.textSecondary }]}>{t.detail}</ThemedText>
              </View>
            </View>
          ))}
        </View>

        {/* ── EMERGENCY BUTTON ── */}
        <Pressable
          onPress={callEmergency}
          style={({ pressed }) => [styles.emergencyBtn, { opacity: pressed ? 0.8 : 1 }]}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Call emergency services"
        >
          <Feather name="phone-call" size={20} color="#fff" />
          <ThemedText style={styles.emergencyBtnText}>Call Emergency Services (111)</ThemedText>
        </Pressable>

        {/* ── DISCLAIMER ── */}
        <ThemedText style={[styles.disclaimer, { color: theme.textSecondary }]}>
          This guide is for informational purposes only and does not replace professional medical advice. Always follow guidance from your healthcare team.
        </ThemedText>

        {/* ── SOURCES ── */}
        <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText style={[styles.sourcesHeading, { color: theme.textSecondary }]}>SOURCES</ThemedText>
          {[
            { label: "Model Systems Knowledge Translation Center — Autonomic Dysreflexia", url: "https://msktc.org/sci/factsheets/autonomic-dysreflexia" },
            { label: "Paralyzed Veterans of America — Clinical Practice Guidelines", url: "https://www.pva.org/research-resources/publications/clinical-practice-guidelines" },
          ].map(({ label, url }) => (
            <Pressable key={url} onPress={() => Linking.openURL(url)}>
              <ThemedText style={styles.sourceLink}>{label}</ThemedText>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  alertBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    borderRadius: BorderRadius.medium,
    padding: Spacing.md,
  },
  alertText: {
    flex: 1,
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
  },

  card: {
    borderRadius: BorderRadius.large,
    padding: Spacing.md,
    gap: Spacing.sm,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: 4,
  },
  sectionIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  body: {
    fontSize: 14,
    lineHeight: 22,
  },
  bold: {
    fontWeight: "700",
  },

  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingVertical: 3,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
    flexShrink: 0,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
  },

  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    borderLeftWidth: 2,
    paddingLeft: Spacing.sm,
    paddingVertical: 4,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  stepNumText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  stepContent: {
    flex: 1,
    gap: 2,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  stepDetail: {
    fontSize: 13,
    lineHeight: 19,
  },

  triggerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  triggerIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  triggerText: { flex: 1 },
  triggerLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  triggerDetail: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 1,
  },

  emergencyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: AD_RED,
    borderRadius: BorderRadius.medium,
    padding: Spacing.md,
  },
  emergencyBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  disclaimer: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
    opacity: 0.6,
  },
  sourcesHeading: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  sourceLink: {
    fontSize: 13,
    color: "#007AFF",
    textDecorationLine: "underline",
    lineHeight: 22,
  },
});
