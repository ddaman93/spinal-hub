import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, FlatList, Pressable, TextInput, Modal, Linking, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { storage, EmergencyContact, generateId } from "@/lib/storage";

export default function EmergencyContactsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [phone, setPhone] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);

  const loadData = useCallback(async () => {
    const data = await storage.emergencyContacts.getAll();
    const sorted = (data || []).sort((a, b) => {
      if (a.isPrimary && !b.isPrimary) return -1;
      if (!a.isPrimary && b.isPrimary) return 1;
      return 0;
    });
    setContacts(sorted);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async () => {
    const contact: EmergencyContact = {
      id: generateId(),
      name,
      relationship,
      phone,
      isPrimary,
    };
    await storage.emergencyContacts.add(contact);
    await loadData();
    setModalVisible(false);
    resetForm();
  };

  const resetForm = () => {
    setName("");
    setRelationship("");
    setPhone("");
    setIsPrimary(false);
  };

  const handleDelete = async (id: string) => {
    await storage.emergencyContacts.delete(id);
    await loadData();
  };

  const handleCall = (phoneNumber: string) => {
    const url = `tel:${phoneNumber}`;
    Linking.openURL(url).catch(() => {
      console.log("Could not open phone dialer");
    });
  };

  const renderContact = ({ item }: { item: EmergencyContact }) => (
    <View style={[styles.contactCard, { backgroundColor: theme.backgroundDefault }]}>
      <View style={styles.contactInfo}>
        <View style={styles.nameRow}>
          <ThemedText type="h4">{item.name}</ThemedText>
          {item.isPrimary ? (
            <View style={[styles.primaryBadge, { backgroundColor: theme.primary }]}>
              <ThemedText type="small" style={{ color: "#FFFFFF" }}>
                Primary
              </ThemedText>
            </View>
          ) : null}
        </View>
        <ThemedText type="body" style={{ color: theme.textSecondary }}>
          {item.relationship}
        </ThemedText>
        <ThemedText type="body" style={{ color: theme.primary }}>
          {item.phone}
        </ThemedText>
      </View>
      <View style={styles.contactActions}>
        <Pressable
          onPress={() => handleCall(item.phone)}
          style={[styles.callButton, { backgroundColor: theme.success }]}
          accessible
          accessibilityLabel={`Call ${item.name}`}
          accessibilityRole="button"
        >
          <Feather name="phone" size={24} color="#FFFFFF" />
        </Pressable>
        <Pressable
          onPress={() => handleDelete(item.id)}
          style={[styles.deleteButton, { backgroundColor: theme.error + "20" }]}
          accessible
          accessibilityLabel={`Delete ${item.name}`}
          accessibilityRole="button"
        >
          <Feather name="trash-2" size={18} color={theme.error} />
        </Pressable>
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={contacts}
        renderItem={renderContact}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="users" size={48} color={theme.textSecondary} />
            <ThemedText type="body" style={{ textAlign: "center", marginTop: Spacing.md }}>
              No emergency contacts added.{"\n"}Tap below to add your contacts.
            </ThemedText>
          </View>
        }
      />

      <View style={[styles.fabContainer, { bottom: insets.bottom + Spacing.xl }]}>
        <Pressable
          onPress={() => setModalVisible(true)}
          style={[styles.fab, { backgroundColor: theme.primary }]}
          accessible
          accessibilityLabel="Add emergency contact"
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
            <ThemedText type="h3">Add Contact</ThemedText>
            <Pressable onPress={() => setModalVisible(false)}>
              <ThemedText type="body" style={{ color: theme.primary }}>Cancel</ThemedText>
            </Pressable>
          </View>

          <KeyboardAwareScrollViewCompat
            style={styles.modalScroll}
            contentContainerStyle={styles.modalScrollContent}
          >
            <View style={styles.formGroup}>
              <ThemedText type="body" style={styles.label}>Name</ThemedText>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g., John Smith"
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { backgroundColor: theme.backgroundDefault, color: theme.text }]}
                accessible
                accessibilityLabel="Contact name"
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText type="body" style={styles.label}>Relationship</ThemedText>
              <TextInput
                value={relationship}
                onChangeText={setRelationship}
                placeholder="e.g., Caregiver, Spouse, Doctor"
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { backgroundColor: theme.backgroundDefault, color: theme.text }]}
                accessible
                accessibilityLabel="Relationship"
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText type="body" style={styles.label}>Phone Number</ThemedText>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="e.g., (555) 123-4567"
                placeholderTextColor={theme.textSecondary}
                keyboardType="phone-pad"
                style={[styles.input, { backgroundColor: theme.backgroundDefault, color: theme.text }]}
                accessible
                accessibilityLabel="Phone number"
              />
            </View>

            <Pressable
              onPress={() => setIsPrimary(!isPrimary)}
              style={styles.checkboxRow}
              accessible
              accessibilityLabel="Mark as primary contact"
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isPrimary }}
            >
              <View
                style={[
                  styles.checkbox,
                  { 
                    backgroundColor: isPrimary ? theme.primary : theme.backgroundDefault,
                    borderColor: isPrimary ? theme.primary : theme.textSecondary,
                  },
                ]}
              >
                {isPrimary ? (
                  <Feather name="check" size={18} color="#FFFFFF" />
                ) : null}
              </View>
              <ThemedText type="body">Mark as primary contact</ThemedText>
            </Pressable>

            <Button onPress={handleSave} style={styles.saveButton}>
              Save Contact
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
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.medium,
    gap: Spacing.md,
  },
  contactInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  primaryBadge: {
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.small,
  },
  contactActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  callButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
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
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
    minHeight: 48,
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButton: {
    marginTop: Spacing.lg,
  },
});
