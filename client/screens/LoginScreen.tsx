import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Image,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import * as Google from "expo-auth-session/providers/google";
import * as Facebook from "expo-auth-session/providers/facebook";
import * as WebBrowser from "expo-web-browser";

import { ThemedText } from "@/components/ThemedText";
import { AuthStackParamList, triggerLogin } from "@/navigation/AuthStack";
import { saveToken } from "@/lib/auth";
import { getApiUrl } from "@/lib/query-client";
import { useTheme } from "@/hooks/useTheme";

WebBrowser.maybeCompleteAuthSession();

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const DARK = {
  bg: "#060E08",
  gradColors: ["#060E08", "#0C1C0E", "#060E08"] as const,
  card: "rgba(0, 230, 100, 0.05)",
  cardBorder: "rgba(0, 230, 100, 0.2)",
  input: "rgba(0, 230, 100, 0.06)",
  inputBorder: "rgba(0, 230, 100, 0.14)",
  inputFocusBorder: "#00E676",
  inputFocusBg: "rgba(0, 230, 100, 0.09)",
  text: "#FFFFFF",
  textMuted: "rgba(255,255,255,0.5)",
  textDim: "rgba(255,255,255,0.35)",
  primary: "#00E676",
  primaryGrad: ["#00E676", "#00C853"] as const,
  orb1: "rgba(0, 120, 50, 0.18)",
  orb2: "rgba(0, 90, 35, 0.12)",
  dividerLine: "rgba(0, 230, 100, 0.2)",
  error: "#FF6B6B",
  blurTint: "dark" as const,
};

const LIGHT = {
  bg: "#FFFFFF",
  gradColors: ["#FFFFFF", "#FFFFFF", "#FFFFFF"] as const,
  card: "#FFFFFF",
  cardBorder: "#E5E7EB",
  input: "#F3F4F6",
  inputBorder: "#D1D5DB",
  inputFocusBorder: "#00C853",
  inputFocusBg: "#F0FDF4",
  text: "#111827",
  textMuted: "rgba(0,0,0,0.5)",
  textDim: "rgba(0,0,0,0.35)",
  primary: "#123524",
  primaryGrad: ["#00E676", "#00C853"] as const,
  orb1: "transparent",
  orb2: "transparent",
  dividerLine: "#E5E7EB",
  error: "#DC2626",
  blurTint: "light" as const,
};

// ---------------------------------------------------------------------------
// OAuth sub-components
// ---------------------------------------------------------------------------
type OAuthHandler = (provider: "google" | "facebook", accessToken: string) => Promise<void>;
type Colors = typeof DARK;

function GoogleButton({ onOAuth, style, C }: { onOAuth: OAuthHandler; style?: object; C: Colors }) {
  const [, , promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID!,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || undefined,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || undefined,
  });
  async function handlePress() {
    const result = await promptAsync();
    if (result.type === "success" && result.authentication?.accessToken) {
      await onOAuth("google", result.authentication.accessToken);
    }
  }
  return (
    <Pressable onPress={handlePress} style={({ pressed }) => [oauthStyle(C).btn, style, { opacity: pressed ? 0.6 : 1 }]}>
      <Feather name="globe" size={17} color={C.text} />
      <ThemedText type="body" style={{ color: C.text, fontSize: 14, fontWeight: "500" }}>Continue with Google</ThemedText>
    </Pressable>
  );
}

function FacebookButton({ onOAuth, style, C }: { onOAuth: OAuthHandler; style?: object; C: Colors }) {
  const [, , promptAsync] = Facebook.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID!,
  });
  async function handlePress() {
    const result = await promptAsync();
    if (result.type === "success" && result.authentication?.accessToken) {
      await onOAuth("facebook", result.authentication.accessToken);
    }
  }
  return (
    <Pressable onPress={handlePress} style={({ pressed }) => [oauthStyle(C).btn, style, { opacity: pressed ? 0.6 : 1 }]}>
      <Feather name="facebook" size={17} color={C.text} />
      <ThemedText type="body" style={{ color: C.text, fontSize: 14, fontWeight: "500" }}>Continue with Facebook</ThemedText>
    </Pressable>
  );
}

function UnconfiguredOAuthButton({ label, icon, alertTitle, alertMessage, C }: {
  label: string; icon: "globe" | "facebook"; alertTitle: string; alertMessage: string; C: Colors;
}) {
  return (
    <Pressable
      onPress={() => Alert.alert(alertTitle, alertMessage)}
      style={({ pressed }) => [oauthStyle(C).btn, { opacity: pressed ? 0.6 : 1 }]}
    >
      <Feather name={icon} size={17} color={C.text} />
      <ThemedText type="body" style={{ color: C.text, fontSize: 14, fontWeight: "500" }}>{label}</ThemedText>
    </Pressable>
  );
}

function oauthStyle(C: Colors) {
  return StyleSheet.create({
    btn: {
      flex: 1,
      height: 48,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: C.cardBorder,
      backgroundColor: C.input,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
  });
}

// ---------------------------------------------------------------------------
// Focused input wrapper
// ---------------------------------------------------------------------------
function FocusInput(props: React.ComponentProps<typeof TextInput> & {
  icon: React.ComponentProps<typeof Feather>["name"];
  C: Colors;
}) {
  const [focused, setFocused] = useState(false);
  const { icon, C, ...rest } = props;
  return (
    <View style={[
      inputStyle(C).wrap,
      focused && inputStyle(C).wrapFocused,
    ]}>
      <Feather name={icon} size={16} color={focused ? C.inputFocusBorder : C.textDim} style={{ marginRight: 10 }} />
      <TextInput
        {...rest}
        style={{ flex: 1, color: C.text, fontSize: 15 }}
        placeholderTextColor={C.textDim}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </View>
  );
}

function inputStyle(C: Colors) {
  return StyleSheet.create({
    wrap: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: C.input,
      borderWidth: 1,
      borderColor: C.inputBorder,
      borderRadius: 14,
      height: 52,
      paddingHorizontal: 14,
    },
    wrapFocused: {
      borderColor: C.inputFocusBorder,
      backgroundColor: C.inputFocusBg,
    },
  });
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------
export default function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { isDark } = useTheme();
  const C = isDark ? DARK : LIGHT;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const hasGoogle = !!process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  const hasFacebook = !!process.env.EXPO_PUBLIC_FACEBOOK_APP_ID;


  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  async function handleLogin() {
    setError(null);
    if (!email.trim() || !password) { setError("Please enter your email and password."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${getApiUrl()}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Login failed. Please try again."); return; }
      await saveToken(data.token);
      triggerLogin();
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuth(provider: "google" | "facebook", accessToken: string) {
    setLoading(true);
    try {
      const res = await fetch(`${getApiUrl()}/api/auth/oauth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, accessToken }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "OAuth login failed."); return; }
      await saveToken(data.token);
      triggerLogin();
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.root, { backgroundColor: C.bg }]}>
      {/* Background — gradient in dark, plain in light */}
      {isDark && (
        <LinearGradient colors={C.gradColors} style={StyleSheet.absoluteFill} />
      )}

      {/* Green glow orbs — dark only */}
      {isDark && (
        <>
          <View style={[styles.orb, styles.orb1, { backgroundColor: C.orb1 }]} />
          <View style={[styles.orb, styles.orb2, { backgroundColor: C.orb2 }]} />
        </>
      )}

      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

              {/* Hero */}
              <View style={styles.hero}>
                <Image
                  source={require("../../assets/images/icon.png")}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
                <ThemedText type="h1" style={[styles.appName, { color: C.text }]}>Spinal Hub</ThemedText>
                <ThemedText type="body" style={[styles.tagline, { color: C.textMuted }]}>Your SCI companion</ThemedText>
              </View>

              {/* Card */}
              <BlurView intensity={isDark ? 18 : 0} tint={C.blurTint} style={[styles.card, { borderColor: C.cardBorder, backgroundColor: isDark ? undefined : C.card }]}>
                <View style={styles.cardInner}>
                  <ThemedText type="h3" style={[styles.cardTitle, { color: C.text }]}>Welcome back</ThemedText>
                  <ThemedText type="small" style={[styles.cardSub, { color: C.textMuted }]}>Sign in to continue</ThemedText>

                  <View style={styles.fields}>
                    <FocusInput icon="mail" placeholder="Email address" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} value={email} onChangeText={setEmail} C={C} />
                    <FocusInput icon="lock" placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} C={C} />
                  </View>

                  {error && (
                    <View style={styles.errorRow}>
                      <Feather name="alert-circle" size={13} color={C.error} />
                      <ThemedText type="small" style={[styles.errorText, { color: C.error }]}>{error}</ThemedText>
                    </View>
                  )}

                  <Pressable onPress={handleLogin} disabled={loading} style={({ pressed }) => [{ opacity: pressed || loading ? 0.8 : 1 }]}>
                    <LinearGradient colors={C.primaryGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.primaryBtn, isDark && styles.primaryBtnShadow]}>
                      {loading ? <ActivityIndicator color="#fff" /> : (
                        <>
                          <ThemedText type="body" style={styles.primaryBtnText}>Sign In</ThemedText>
                          <Feather name="arrow-right" size={18} color="#fff" />
                        </>
                      )}
                    </LinearGradient>
                  </Pressable>

                  <View style={styles.divider}>
                    <View style={[styles.dividerLine, { backgroundColor: C.dividerLine }]} />
                    <ThemedText type="small" style={[styles.dividerText, { color: C.textDim }]}>or continue with</ThemedText>
                    <View style={[styles.dividerLine, { backgroundColor: C.dividerLine }]} />
                  </View>

                  <View style={styles.oauthRow}>
                    {hasGoogle ? (
                      <GoogleButton onOAuth={handleOAuth} style={{ flex: 1 }} C={C} />
                    ) : (
                      <UnconfiguredOAuthButton label="Google" icon="globe" alertTitle="Google Sign-In Not Configured" alertMessage="Add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID to your .env file." C={C} />
                    )}
                    {hasFacebook ? (
                      <FacebookButton onOAuth={handleOAuth} style={{ flex: 1 }} C={C} />
                    ) : (
                      <UnconfiguredOAuthButton label="Facebook" icon="facebook" alertTitle="Facebook Sign-In Not Configured" alertMessage="Add EXPO_PUBLIC_FACEBOOK_APP_ID to your .env file." C={C} />
                    )}
                  </View>
                </View>
              </BlurView>

              <View style={styles.footer}>
                <ThemedText type="small" style={[styles.footerText, { color: C.textMuted }]}>Don't have an account? </ThemedText>
                <Pressable onPress={() => navigation.navigate("SignUp")} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
                  <ThemedText type="small" style={[styles.footerLink, { color: C.primary }]}>Create one</ThemedText>
                </Pressable>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 24, paddingBottom: 40 },
  content: { flex: 1, alignItems: "center" },

  orb: { position: "absolute", borderRadius: 999 },
  orb1: { width: SCREEN_W * 0.9, height: SCREEN_W * 0.9, top: -SCREEN_W * 0.35, left: -SCREEN_W * 0.25 },
  orb2: { width: SCREEN_W * 0.75, height: SCREEN_W * 0.75, bottom: SCREEN_H * 0.08, right: -SCREEN_W * 0.3 },

  hero: { alignItems: "center", marginBottom: 32, marginTop: 16 },
  logoGradient: { width: 72, height: 72, borderRadius: 22, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  logoShadow: { shadowColor: "#00E676", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.7, shadowRadius: 24, elevation: 12 },
  logoImage: { width: 120, height: 120, marginBottom: 16 },
  appName: { fontSize: 32, fontWeight: "800", letterSpacing: -0.5 },
  tagline: { marginTop: 4, fontSize: 15 },

  card: { width: "100%", borderRadius: 24, overflow: "hidden", borderWidth: 1 },
  cardInner: { padding: 24 },
  cardTitle: { fontSize: 20, fontWeight: "700", marginBottom: 2 },
  cardSub: { fontSize: 13, marginBottom: 24 },

  fields: { gap: 12, marginBottom: 8 },

  errorRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12, marginTop: 4 },
  errorText: { fontSize: 13, flex: 1 },

  primaryBtn: { height: 54, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 16 },
  primaryBtnShadow: { shadowColor: "#00E676", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 18, elevation: 8 },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  divider: { flexDirection: "row", alignItems: "center", marginVertical: 20, gap: 10 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 12 },

  oauthRow: { flexDirection: "row", gap: 10 },

  footer: { flexDirection: "row", alignItems: "center", marginTop: 24 },
  footerText: { fontSize: 14 },
  footerLink: { fontWeight: "600", fontSize: 14 },
});
