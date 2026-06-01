import React, { useCallback, useState } from "react";
import {
  View, StyleSheet, ScrollView, Pressable, Image, Alert,
  ActivityIndicator, Modal, TextInput, Platform, ActionSheetIOS,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getToken, getUserIdFromToken } from "@/lib/auth";

type Category = "discharge" | "test" | "prescription" | "letter" | "imaging" | "other";

type DocMeta = {
  id: string;
  displayName: string;
  category: Category;
  addedAt: string;
  uri: string;
  mimeType: string;
  sizeBytes: number;
};

const CATEGORY_LABEL: Record<Category, string> = {
  discharge: "Discharge letter",
  test: "Test result",
  prescription: "Prescription",
  letter: "Letter / referral",
  imaging: "Imaging / scan",
  other: "Other",
};

const CATEGORY_COLOR: Record<Category, string> = {
  discharge: "#FF6B6B",
  test: "#4A90D9",
  prescription: "#9C27B0",
  letter: "#FF9800",
  imaging: "#26A69A",
  other: "#5C6BC0",
};

const CATEGORY_ICON: Record<Category, keyof typeof Feather.glyphMap> = {
  discharge: "file-text",
  test: "activity",
  prescription: "package",
  letter: "mail",
  imaging: "image",
  other: "file",
};

const STORAGE_KEY_PREFIX = "my_documents_v1:";
function storageKey(userId: string) { return `${STORAGE_KEY_PREFIX}${userId || "self"}`; }

async function ensureDocsDir(): Promise<string> {
  const dir = `${FileSystem.documentDirectory}my_documents/`;
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
  return dir;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" });
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function MyDocumentsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme, isDark } = useTheme();

  const [userId, setUserId] = useState<string>("self");
  const [docs, setDocs] = useState<DocMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewDoc, setPreviewDoc] = useState<DocMeta | null>(null);
  const [editingDoc, setEditingDoc] = useState<DocMeta | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState<Category>("other");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const tok = await getToken();
      const uid = tok ? getUserIdFromToken(tok) ?? "self" : "self";
      setUserId(uid);
      const raw = await AsyncStorage.getItem(storageKey(uid));
      const list: DocMeta[] = raw ? JSON.parse(raw) : [];
      // Sort newest first
      list.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
      setDocs(list);
    } catch {
      setDocs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const persistDocs = async (next: DocMeta[]) => {
    next.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
    await AsyncStorage.setItem(storageKey(userId), JSON.stringify(next));
    setDocs(next);
  };

  async function pickPhoto(useCamera: boolean) {
    const permFn = useCamera
      ? ImagePicker.requestCameraPermissionsAsync
      : ImagePicker.requestMediaLibraryPermissionsAsync;
    const { status } = await permFn();
    if (status !== "granted") {
      Alert.alert("Permission needed", useCamera ? "Camera access is required." : "Photo library access is required.");
      return;
    }
    const launchFn = useCamera
      ? ImagePicker.launchCameraAsync
      : ImagePicker.launchImageLibraryAsync;
    const result = await launchFn({
      mediaTypes: "images",
      quality: 0.85,
      allowsEditing: true,
    });
    if (result.canceled || !result.assets[0]?.uri) return;

    try {
      const asset = result.assets[0];
      const dir = await ensureDocsDir();
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const ext = (asset.uri.split(".").pop() || "jpg").toLowerCase();
      const newUri = `${dir}${id}.${ext}`;
      await FileSystem.copyAsync({ from: asset.uri, to: newUri });
      const info = await FileSystem.getInfoAsync(newUri);
      const sizeBytes = info.exists && "size" in info && typeof info.size === "number" ? info.size : 0;

      const meta: DocMeta = {
        id,
        displayName: `Document ${new Date().toLocaleDateString("en-NZ")}`,
        category: "discharge",
        addedAt: new Date().toISOString(),
        uri: newUri,
        mimeType: ext === "png" ? "image/png" : "image/jpeg",
        sizeBytes,
      };
      const next = [meta, ...docs];
      await persistDocs(next);
      // Open edit modal so user names it + sets category
      setEditingDoc(meta);
      setEditName(meta.displayName);
      setEditCategory(meta.category);
    } catch (err) {
      console.error(err);
      Alert.alert("Could not save", "Failed to save the image.");
    }
  }

  function showAddSource() {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ["Take Photo", "Choose from Library", "Cancel"], cancelButtonIndex: 2, title: "Add Document" },
        (index) => {
          if (index === 0) pickPhoto(true);
          if (index === 1) pickPhoto(false);
        }
      );
    } else {
      Alert.alert("Add Document", "Choose source", [
        { text: "Take Photo", onPress: () => pickPhoto(true) },
        { text: "Choose from Library", onPress: () => pickPhoto(false) },
        { text: "Cancel", style: "cancel" },
      ]);
    }
  }

  async function shareDoc(doc: DocMeta) {
    try {
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        Alert.alert("Not supported", "Sharing is not available on this device.");
        return;
      }
      await Sharing.shareAsync(doc.uri, {
        mimeType: doc.mimeType,
        dialogTitle: doc.displayName,
        UTI: doc.mimeType === "image/png" ? "public.png" : "public.jpeg",
      });
    } catch {}
  }

  async function deleteDoc(doc: DocMeta) {
    Alert.alert("Delete document?", `${doc.displayName} will be removed from your device.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive", onPress: async () => {
          try { await FileSystem.deleteAsync(doc.uri, { idempotent: true }); } catch {}
          const next = docs.filter((d) => d.id !== doc.id);
          await persistDocs(next);
          if (previewDoc?.id === doc.id) setPreviewDoc(null);
        }
      },
    ]);
  }

  async function saveEdit() {
    if (!editingDoc) return;
    const trimmed = editName.trim();
    if (!trimmed) { Alert.alert("Missing", "Enter a name."); return; }
    const next = docs.map((d) =>
      d.id === editingDoc.id ? { ...d, displayName: trimmed, category: editCategory } : d
    );
    await persistDocs(next);
    setEditingDoc(null);
  }

  // Group by category
  const groups = (Object.keys(CATEGORY_LABEL) as Category[]).map((cat) => ({
    category: cat,
    items: docs.filter((d) => d.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: headerHeight + Spacing.md, paddingBottom: insets.bottom + 100, paddingHorizontal: Spacing.lg }}
      >
        <ThemedText type="body" style={[styles.intro, { color: theme.textSecondary }]}>
          Snap or upload photos of your medical documents — discharge letters, test results, prescriptions. Share with your GP or carers using the share button on each document.
        </ThemedText>

        {loading ? (
          <ActivityIndicator color={theme.primary} style={{ marginTop: Spacing.xl }} />
        ) : docs.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="file-text" size={48} color={theme.textSecondary} style={{ opacity: 0.3 }} />
            <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
              No documents yet.{"\n"}Tap "Add Document" to start.
            </ThemedText>
          </View>
        ) : (
          groups.map((g) => (
            <View key={g.category} style={styles.group}>
              <View style={styles.groupHeader}>
                <View style={[styles.groupDot, { backgroundColor: CATEGORY_COLOR[g.category] }]} />
                <ThemedText style={[styles.groupTitle, { color: theme.textSecondary }]}>
                  {CATEGORY_LABEL[g.category].toUpperCase()} · {g.items.length}
                </ThemedText>
              </View>
              {g.items.map((doc) => (
                <Pressable
                  key={doc.id}
                  onPress={() => setPreviewDoc(doc)}
                  style={[styles.docRow, { backgroundColor: theme.backgroundDefault }]}
                >
                  <Image source={{ uri: doc.uri }} style={styles.thumb} />
                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.docName} numberOfLines={1}>{doc.displayName}</ThemedText>
                    <ThemedText style={[styles.docMeta, { color: theme.textSecondary }]}>
                      {formatDate(doc.addedAt)} · {formatSize(doc.sizeBytes)}
                    </ThemedText>
                  </View>
                  <Pressable
                    onPress={() => shareDoc(doc)}
                    hitSlop={10}
                    style={[styles.iconBtn, { backgroundColor: theme.primary + "22" }]}
                  >
                    <Feather name="share" size={16} color={theme.primary} />
                  </Pressable>
                  <Pressable
                    onPress={() => { setEditingDoc(doc); setEditName(doc.displayName); setEditCategory(doc.category); }}
                    hitSlop={10}
                    style={[styles.iconBtn, { backgroundColor: theme.backgroundRoot }]}
                  >
                    <Feather name="edit-2" size={14} color={theme.textSecondary} />
                  </Pressable>
                  <Pressable
                    onPress={() => deleteDoc(doc)}
                    hitSlop={10}
                    style={[styles.iconBtn, { backgroundColor: theme.error + "18" }]}
                  >
                    <Feather name="trash-2" size={14} color={theme.error} />
                  </Pressable>
                </Pressable>
              ))}
            </View>
          ))
        )}

        <View style={[styles.tipCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.primary + "30" }]}>
          <Feather name="info" size={14} color={theme.primary} />
          <ThemedText style={[styles.tipText, { color: theme.textSecondary }]}>
            Documents are stored only on this device. PDF support and care team sharing are coming in a future update.
          </ThemedText>
        </View>
      </ScrollView>

      {/* Add bar */}
      <View style={[styles.addBarContainer, { paddingBottom: insets.bottom + Spacing.md, backgroundColor: theme.backgroundRoot, borderTopColor: theme.border }]}>
        <Pressable onPress={showAddSource} style={[styles.addBar, { backgroundColor: theme.primary }]}>
          <Feather name="plus" size={20} color="#fff" />
          <ThemedText style={styles.addBarText}>Add Document</ThemedText>
        </Pressable>
      </View>

      {/* Preview modal */}
      <Modal visible={previewDoc !== null} transparent animationType="fade" onRequestClose={() => setPreviewDoc(null)}>
        <View style={styles.previewBackdrop}>
          <View style={styles.previewHeader}>
            <Pressable onPress={() => setPreviewDoc(null)} hitSlop={10}>
              <Feather name="x" size={26} color="#fff" />
            </Pressable>
            <ThemedText style={styles.previewTitle} numberOfLines={1}>{previewDoc?.displayName}</ThemedText>
            <Pressable onPress={() => previewDoc && shareDoc(previewDoc)} hitSlop={10}>
              <Feather name="share" size={22} color="#fff" />
            </Pressable>
          </View>
          {previewDoc && (
            <ScrollView
              maximumZoomScale={4}
              minimumZoomScale={1}
              contentContainerStyle={styles.previewScroll}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
            >
              <Image source={{ uri: previewDoc.uri }} style={styles.previewImage} resizeMode="contain" />
            </ScrollView>
          )}
        </View>
      </Modal>

      {/* Edit modal */}
      <Modal visible={editingDoc !== null} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setEditingDoc(null)}>
        <View style={[styles.editContainer, { backgroundColor: theme.backgroundRoot }]}>
          <View style={styles.editHeader}>
            <ThemedText type="h3">Document details</ThemedText>
            <Pressable onPress={() => setEditingDoc(null)} hitSlop={8}>
              <ThemedText style={{ color: theme.primary, fontWeight: "600" }}>Done</ThemedText>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ padding: Spacing.lg, gap: Spacing.lg }}>
            {editingDoc && (
              <Image source={{ uri: editingDoc.uri }} style={styles.editThumb} resizeMode="cover" />
            )}

            <View>
              <ThemedText style={[styles.formLabel, { color: theme.textSecondary }]}>NAME</ThemedText>
              <TextInput
                value={editName}
                onChangeText={setEditName}
                placeholder="e.g. Burwood discharge letter"
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { backgroundColor: theme.backgroundDefault, color: theme.text }]}
                maxLength={80}
              />
            </View>

            <View>
              <ThemedText style={[styles.formLabel, { color: theme.textSecondary }]}>CATEGORY</ThemedText>
              <View style={styles.catGrid}>
                {(Object.keys(CATEGORY_LABEL) as Category[]).map((cat) => {
                  const selected = editCategory === cat;
                  return (
                    <Pressable
                      key={cat}
                      onPress={() => setEditCategory(cat)}
                      style={[
                        styles.catChip,
                        { backgroundColor: selected ? CATEGORY_COLOR[cat] : theme.backgroundDefault, borderColor: CATEGORY_COLOR[cat] + (selected ? "" : "55") },
                      ]}
                    >
                      <Feather name={CATEGORY_ICON[cat]} size={13} color={selected ? "#fff" : CATEGORY_COLOR[cat]} />
                      <ThemedText style={{ fontSize: 12, fontWeight: "600", color: selected ? "#fff" : theme.text }}>
                        {CATEGORY_LABEL[cat]}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <Button onPress={saveEdit}>Save</Button>
          </ScrollView>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  intro: { lineHeight: 20, marginBottom: Spacing.lg },

  emptyState: { alignItems: "center", padding: Spacing.xl * 2, gap: Spacing.md },
  emptyText: { textAlign: "center", lineHeight: 22, opacity: 0.7 },

  group: { marginBottom: Spacing.lg },
  groupHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: Spacing.sm },
  groupDot: { width: 8, height: 8, borderRadius: 4 },
  groupTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8 },

  docRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.medium,
    marginBottom: Spacing.sm,
  },
  thumb: { width: 48, height: 48, borderRadius: 8, backgroundColor: "#222" },
  docName: { fontSize: 14, fontWeight: "600" },
  docMeta: { fontSize: 11, marginTop: 2 },
  iconBtn: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },

  tipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: Spacing.md,
    borderRadius: BorderRadius.medium,
    borderWidth: 1,
    marginTop: Spacing.md,
  },
  tipText: { flex: 1, fontSize: 12, lineHeight: 17 },

  addBarContainer: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  addBar: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: BorderRadius.medium },
  addBarText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  previewBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.95)" },
  previewHeader: { flexDirection: "row", alignItems: "center", padding: Spacing.lg, paddingTop: 60, gap: Spacing.md },
  previewTitle: { flex: 1, color: "#fff", fontSize: 16, fontWeight: "600" },
  previewScroll: { flex: 1, justifyContent: "center", alignItems: "center" },
  previewImage: { width: "100%", height: "100%", minHeight: 400 },

  editContainer: { flex: 1 },
  editHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: Spacing.lg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "rgba(0,0,0,0.08)" },
  editThumb: { width: "100%", height: 180, borderRadius: BorderRadius.medium },
  formLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8, marginBottom: 8 },
  input: { borderRadius: BorderRadius.medium, padding: Spacing.md, fontSize: 16 },
  catGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  catChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
});
