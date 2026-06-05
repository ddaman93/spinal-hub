import React, { useState, useCallback } from "react";
import {
  View, StyleSheet, ScrollView, Pressable, Alert,
  TextInput, Modal, ActivityIndicator, Clipboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import { getToken } from "@/lib/auth";

type ApiKey = {
  id: string;
  label: string;
  lastUsedAt: string | null;
  createdAt: string;
};

export default function ApiKeysScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [createVisible, setCreateVisible] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [creating, setCreating] = useState(false);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${getApiUrl()}/api/auth/api-keys`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setKeys(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleCreate = async () => {
    const label = newLabel.trim() || "My API Key";
    setCreating(true);
    try {
      const token = await getToken();
      const res = await fetch(`${getApiUrl()}/api/auth/api-keys`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ label }),
      });
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setCreateVisible(false);
      setNewLabel("");
      setRevealedKey(data.key);
      await load();
    } catch {
      Alert.alert("Error", "Could not create API key.");
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = (key: ApiKey) => {
    Alert.alert("Revoke key", `Revoke "${key.label}"? Any integrations using it will stop working.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Revoke", style: "destructive",
        onPress: async () => {
          const token = await getToken();
          await fetch(`${getApiUrl()}/api/auth/api-keys/${key.id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          setKeys((prev) => prev.filter((k) => k.id !== key.id));
        },
      },
    ]);
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + Spacing.lg,
          paddingHorizontal: Spacing.lg,
        }}
      >
        {/* Explainer */}
        <View style={[styles.infoCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <Feather name="info" size={16} color={theme.primary} style={{ marginTop: 2 }} />
          <ThemedText type="small" style={[styles.infoText, { color: theme.textSecondary }]}>
            API keys let external tools (like an AI assistant) log health data to Spinal Hub on your behalf. Treat keys like passwords — anyone with the key can write data to your account.
          </ThemedText>
        </View>

        {/* Generate button */}
        <Pressable
          onPress={() => setCreateVisible(true)}
          style={({ pressed }) => [styles.generateBtn, { backgroundColor: theme.primary, opacity: pressed ? 0.8 : 1 }]}
        >
          <Feather name="plus" size={18} color="#fff" />
          <ThemedText type="body" style={{ fontWeight: "600", color: "#fff", marginLeft: 8 }}>Generate new key</ThemedText>
        </Pressable>

        {/* Key list */}
        {loading ? (
          <ActivityIndicator color={theme.primary} style={{ marginTop: 40 }} />
        ) : keys.length === 0 ? (
          <ThemedText type="small" style={[styles.empty, { color: theme.textSecondary }]}>No API keys yet.</ThemedText>
        ) : (
          <View style={styles.keyList}>
            {keys.map((key) => (
              <View key={key.id} style={[styles.keyRow, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
                <View style={[styles.keyIcon, { backgroundColor: "#5856D620" }]}>
                  <Feather name="key" size={18} color="#5856D6" />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText type="body" style={{ fontWeight: "600" }}>{key.label}</ThemedText>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    Created {formatDate(key.createdAt)}
                    {key.lastUsedAt ? `  ·  Last used ${formatDate(key.lastUsedAt)}` : "  ·  Never used"}
                  </ThemedText>
                </View>
                <Pressable
                  onPress={() => handleRevoke(key)}
                  hitSlop={12}
                  style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
                >
                  <Feather name="trash-2" size={18} color="#D32F2F" />
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {/* Endpoint reference */}
        <ThemedText type="small" style={[styles.sectionLabel, { color: theme.textSecondary }]}>AVAILABLE ENDPOINTS</ThemedText>
        <View style={[styles.endpointCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <ThemedText type="small" style={[styles.endpointText, { color: theme.textSecondary }]}>
            Use your key as a Bearer token:{"\n"}
            <ThemedText type="small" style={{ color: theme.primary }}>Authorization: Bearer sh_...</ThemedText>
          </ThemedText>
          {[
            ["POST", "/api/health/vitals", "type, value (+ systolic/diastolic for BP)"],
            ["POST", "/api/health/bladder-logs", "type, bagType, volumeMl"],
            ["POST", "/api/health/bowel-logs", "type, notes"],
            ["POST", "/api/health/pain-entries", "level (1–10), location"],
            ["POST", "/api/health/hydration-logs", "amount, unit (ml/oz)"],
          ].map(([method, path, params]) => (
            <View key={path} style={styles.endpoint}>
              <ThemedText type="small" style={[styles.method, { color: theme.primary }]}>{method}</ThemedText>
              <View style={{ flex: 1 }}>
                <ThemedText type="small" style={{ color: theme.text, fontFamily: "monospace" }}>{path}</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>{params}</ThemedText>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Create key modal */}
      <Modal visible={createVisible} transparent animationType="fade" onRequestClose={() => setCreateVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setCreateVisible(false)}>
          <Pressable style={[styles.dialog, { backgroundColor: theme.backgroundDefault }]} onPress={() => {}}>
            <ThemedText type="h3" style={{ marginBottom: Spacing.sm }}>Name this key</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.md }}>
              Give it a name so you remember what it's for (e.g. "Pablo AI").
            </ThemedText>
            <TextInput
              value={newLabel}
              onChangeText={setNewLabel}
              placeholder="Pablo AI"
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.backgroundRoot }]}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleCreate}
            />
            <View style={styles.dialogButtons}>
              <Pressable onPress={() => setCreateVisible(false)} style={[styles.dialogBtn, { borderColor: theme.border }]}>
                <ThemedText type="body" style={{ fontWeight: "600" }}>Cancel</ThemedText>
              </Pressable>
              <Pressable
                onPress={handleCreate}
                disabled={creating}
                style={[styles.dialogBtn, { backgroundColor: theme.primary, borderColor: theme.primary }]}
              >
                {creating
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <ThemedText type="body" style={{ fontWeight: "600", color: "#fff" }}>Generate</ThemedText>}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Key reveal modal */}
      <Modal visible={!!revealedKey} transparent animationType="fade" onRequestClose={() => setRevealedKey(null)}>
        <Pressable style={styles.overlay} onPress={() => setRevealedKey(null)}>
          <Pressable style={[styles.dialog, { backgroundColor: theme.backgroundDefault }]} onPress={() => {}}>
            <View style={[styles.warningBadge, { backgroundColor: "#FF6F0020" }]}>
              <Feather name="alert-triangle" size={16} color="#FF6F00" />
              <ThemedText type="small" style={{ color: "#FF6F00", marginLeft: 6, fontWeight: "600" }}>Copy now — shown once only</ThemedText>
            </View>
            <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.md, marginTop: Spacing.sm }}>
              This key will not be shown again. Store it somewhere safe and give it to your integration.
            </ThemedText>
            <Pressable
              onPress={() => {
                if (revealedKey) {
                  Clipboard.setString(revealedKey);
                  Alert.alert("Copied", "API key copied to clipboard.");
                }
              }}
              style={[styles.keyBox, { backgroundColor: theme.backgroundRoot, borderColor: theme.primary }]}
            >
              <ThemedText
                type="small"
                style={{ color: theme.primary, fontFamily: "monospace", flex: 1, flexWrap: "wrap" }}
                selectable
              >
                {revealedKey}
              </ThemedText>
              <Feather name="copy" size={16} color={theme.primary} style={{ marginLeft: 8 }} />
            </Pressable>
            <Pressable
              onPress={() => setRevealedKey(null)}
              style={[styles.dialogBtn, { backgroundColor: theme.primary, borderColor: theme.primary, alignSelf: "stretch", marginTop: Spacing.md }]}
            >
              <ThemedText type="body" style={{ fontWeight: "600", color: "#fff" }}>Done</ThemedText>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  infoCard: {
    flexDirection: "row", gap: Spacing.sm, padding: Spacing.md,
    borderRadius: BorderRadius.medium, borderWidth: 1, marginBottom: Spacing.md,
  },
  infoText: { flex: 1, lineHeight: 20 },
  generateBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    padding: Spacing.md, borderRadius: BorderRadius.medium, marginBottom: Spacing.lg,
  },
  empty: { textAlign: "center", marginTop: 40 },
  keyList: { gap: Spacing.sm },
  keyRow: {
    flexDirection: "row", alignItems: "center", gap: Spacing.md,
    padding: Spacing.md, borderRadius: BorderRadius.medium, borderWidth: 1,
  },
  keyIcon: {
    width: 40, height: 40, borderRadius: BorderRadius.small,
    justifyContent: "center", alignItems: "center",
  },
  sectionLabel: {
    fontWeight: "600", letterSpacing: 0.8,
    marginTop: Spacing.xl, marginBottom: Spacing.sm, marginLeft: 4,
  },
  endpointCard: {
    padding: Spacing.md, borderRadius: BorderRadius.medium, borderWidth: 1, gap: Spacing.sm,
  },
  endpointText: { lineHeight: 20, marginBottom: Spacing.xs },
  endpoint: { flexDirection: "row", gap: Spacing.sm, paddingVertical: 4 },
  method: { fontWeight: "700", width: 36 },
  overlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center", alignItems: "center", padding: Spacing.lg,
  },
  dialog: {
    width: "100%", borderRadius: BorderRadius.large,
    padding: Spacing.lg, maxWidth: 400,
  },
  input: {
    borderWidth: 1, borderRadius: BorderRadius.small,
    padding: Spacing.md, fontSize: 16, marginBottom: Spacing.md,
  },
  dialogButtons: { flexDirection: "row", gap: Spacing.sm },
  dialogBtn: {
    flex: 1, borderWidth: 1, borderRadius: BorderRadius.small,
    padding: Spacing.md, alignItems: "center",
  },
  warningBadge: {
    flexDirection: "row", alignItems: "center",
    padding: Spacing.sm, borderRadius: BorderRadius.small, marginBottom: Spacing.xs,
  },
  keyBox: {
    flexDirection: "row", alignItems: "flex-start",
    borderWidth: 1.5, borderRadius: BorderRadius.small,
    padding: Spacing.md,
  },
});
