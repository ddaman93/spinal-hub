import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, FlatList, Pressable, TextInput, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { storage, Appointment, generateId, formatDate } from "@/lib/storage";

const APPOINTMENT_TYPES = [
  { key: "doctor", label: "Doctor Visit", icon: "user" as const },
  { key: "therapy", label: "Therapy", icon: "activity" as const },
  { key: "equipment", label: "Equipment", icon: "tool" as const },
  { key: "other", label: "Other", icon: "calendar" as const },
];

export default function AppointmentSchedulerScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [selectedType, setSelectedType] = useState<"doctor" | "therapy" | "equipment" | "other">("doctor");
  const [date, setDate] = useState(formatDate(new Date()));
  const [time, setTime] = useState("9:00 AM");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  const loadData = useCallback(async () => {
    const data = await storage.appointments.getUpcoming();
    setAppointments(data || []);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async () => {
    const appointment: Appointment = {
      id: generateId(),
      title,
      type: selectedType,
      date,
      time,
      location: location || undefined,
      notes: notes || undefined,
      reminder: true,
    };
    await storage.appointments.add(appointment);
    await loadData();
    setModalVisible(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle("");
    setSelectedType("doctor");
    setDate(formatDate(new Date()));
    setTime("9:00 AM");
    setLocation("");
    setNotes("");
  };

  const handleDelete = async (id: string) => {
    await storage.appointments.delete(id);
    await loadData();
  };

  const getTypeInfo = (type: string) => {
    return APPOINTMENT_TYPES.find((t) => t.key === type) || APPOINTMENT_TYPES[3];
  };

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { 
      weekday: "short", 
      month: "short", 
      day: "numeric" 
    });
  };

  const isToday = (dateStr: string) => {
    return dateStr === formatDate(new Date());
  };

  const isTomorrow = (dateStr: string) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return dateStr === formatDate(tomorrow);
  };

  const renderAppointment = ({ item }: { item: Appointment }) => {
    const typeInfo = getTypeInfo(item.type);
    const dateLabel = isToday(item.date) 
      ? "Today" 
      : isTomorrow(item.date) 
        ? "Tomorrow" 
        : formatDisplayDate(item.date);

    return (
      <View style={[styles.appointmentCard, { backgroundColor: theme.backgroundDefault }]}>
        <View style={[styles.typeIcon, { backgroundColor: theme.primary + "20" }]}>
          <Feather name={typeInfo.icon} size={24} color={theme.primary} />
        </View>
        <View style={styles.appointmentContent}>
          <ThemedText type="h4">{item.title}</ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {typeInfo.label}
          </ThemedText>
          <View style={styles.appointmentDetails}>
            <View style={styles.detailRow}>
              <Feather name="calendar" size={14} color={theme.textSecondary} />
              <ThemedText type="small" style={{ color: theme.primary }}>
                {dateLabel}
              </ThemedText>
            </View>
            <View style={styles.detailRow}>
              <Feather name="clock" size={14} color={theme.textSecondary} />
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {item.time}
              </ThemedText>
            </View>
          </View>
          {item.location ? (
            <View style={styles.detailRow}>
              <Feather name="map-pin" size={14} color={theme.textSecondary} />
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {item.location}
              </ThemedText>
            </View>
          ) : null}
        </View>
        <Pressable
          onPress={() => handleDelete(item.id)}
          style={[styles.deleteButton, { backgroundColor: theme.error + "20" }]}
          accessible
          accessibilityLabel={`Delete ${item.title} appointment`}
          accessibilityRole="button"
        >
          <Feather name="trash-2" size={18} color={theme.error} />
        </Pressable>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={appointments}
        renderItem={renderAppointment}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="calendar" size={48} color={theme.textSecondary} />
            <ThemedText type="body" style={{ textAlign: "center", marginTop: Spacing.md }}>
              No upcoming appointments.{"\n"}Tap below to schedule one.
            </ThemedText>
          </View>
        }
      />

      <View style={[styles.fabContainer, { bottom: insets.bottom + Spacing.xl }]}>
        <Pressable
          onPress={() => setModalVisible(true)}
          style={[styles.fab, { backgroundColor: theme.primary }]}
          accessible
          accessibilityLabel="Add appointment"
          accessibilityRole="button"
        >
          <ThemedText type="h3" style={{ color: "#FFFFFF" }}>+</ThemedText>
        </Pressable>
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.backgroundRoot }]}>
          <View style={styles.modalHeader}>
            <ThemedText type="h3">New Appointment</ThemedText>
            <Pressable onPress={() => setModalVisible(false)}>
              <ThemedText type="body" style={{ color: theme.primary }}>Cancel</ThemedText>
            </Pressable>
          </View>

          <KeyboardAwareScrollViewCompat
            style={styles.modalScroll}
            contentContainerStyle={styles.modalScrollContent}
          >
            <View style={styles.formGroup}>
              <ThemedText type="body" style={styles.label}>Title</ThemedText>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="e.g., Dr. Smith checkup"
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { backgroundColor: theme.backgroundDefault, color: theme.text }]}
                accessible
                accessibilityLabel="Appointment title"
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText type="body" style={styles.label}>Type</ThemedText>
              <View style={styles.typeSelector}>
                {APPOINTMENT_TYPES.map((type) => (
                  <Pressable
                    key={type.key}
                    onPress={() => setSelectedType(type.key as typeof selectedType)}
                    style={[
                      styles.typeButton,
                      { backgroundColor: selectedType === type.key ? theme.primary : theme.backgroundDefault },
                    ]}
                    accessible
                    accessibilityLabel={type.label}
                    accessibilityState={{ selected: selectedType === type.key }}
                  >
                    <Feather
                      name={type.icon}
                      size={20}
                      color={selectedType === type.key ? "#FFFFFF" : theme.text}
                    />
                    <ThemedText
                      type="small"
                      style={{ color: selectedType === type.key ? "#FFFFFF" : theme.text }}
                    >
                      {type.label}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <ThemedText type="body" style={styles.label}>Date</ThemedText>
                <TextInput
                  value={date}
                  onChangeText={setDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={theme.textSecondary}
                  style={[styles.input, { backgroundColor: theme.backgroundDefault, color: theme.text }]}
                  accessible
                  accessibilityLabel="Date"
                />
              </View>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <ThemedText type="body" style={styles.label}>Time</ThemedText>
                <TextInput
                  value={time}
                  onChangeText={setTime}
                  placeholder="9:00 AM"
                  placeholderTextColor={theme.textSecondary}
                  style={[styles.input, { backgroundColor: theme.backgroundDefault, color: theme.text }]}
                  accessible
                  accessibilityLabel="Time"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <ThemedText type="body" style={styles.label}>Location (optional)</ThemedText>
              <TextInput
                value={location}
                onChangeText={setLocation}
                placeholder="e.g., Medical Center, Room 201"
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { backgroundColor: theme.backgroundDefault, color: theme.text }]}
                accessible
                accessibilityLabel="Location"
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText type="body" style={styles.label}>Notes (optional)</ThemedText>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Any additional notes..."
                placeholderTextColor={theme.textSecondary}
                multiline
                style={[styles.input, styles.notesInput, { backgroundColor: theme.backgroundDefault, color: theme.text }]}
                accessible
                accessibilityLabel="Notes"
              />
            </View>

            <Button onPress={handleSave} style={styles.saveButton}>
              Save Appointment
            </Button>
          </KeyboardAwareScrollViewCompat>
        </View>
      </Modal>
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
  appointmentCard: {
    flexDirection: "row",
    padding: Spacing.lg,
    borderRadius: BorderRadius.medium,
    gap: Spacing.md,
    alignItems: "flex-start",
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  appointmentContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  appointmentDetails: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    paddingTop: Spacing.xxl,
    alignItems: "center",
  },
  fabContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  fab: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    paddingTop: Spacing.xxl,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  formGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    marginBottom: Spacing.sm,
  },
  input: {
    height: 56,
    borderRadius: BorderRadius.medium,
    paddingHorizontal: Spacing.md,
    fontSize: 18,
  },
  notesInput: {
    height: 80,
    paddingTop: Spacing.md,
    textAlignVertical: "top",
  },
  typeSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  typeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.medium,
    minHeight: 48,
  },
  row: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  saveButton: {
    marginTop: Spacing.lg,
  },
});
