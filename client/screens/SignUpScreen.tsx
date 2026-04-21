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
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import * as Google from "expo-auth-session/providers/google";
import * as Facebook from "expo-auth-session/providers/facebook";
import * as WebBrowser from "expo-web-browser";
import * as AppleAuthentication from "expo-apple-authentication";

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
  orb1: "rgba(0, 90, 35, 0.14)",
  orb2: "rgba(0, 120, 50, 0.12)",
  dividerLine: "rgba(0, 230, 100, 0.2)",
  strengthStrong: "#00E676",
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
  strengthStrong: "#00C853",
  error: "#DC2626",
  blurTint: "light" as const,
};

type Colors = typeof DARK;

// ---------------------------------------------------------------------------
// OAuth sub-components
// ---------------------------------------------------------------------------
type OAuthHandler = (provider: "google" | "facebook", accessToken: string) => Promise<void>;

function GoogleButton({ onOAuth, C }: { onOAuth: OAuthHandler; C: Colors }) {
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
    <Pressable onPress={handlePress} style={({ pressed }) => [oauthBtn(C), { opacity: pressed ? 0.6 : 1 }]}>
      <FontAwesome5 name="google" size={16} color="#4285F4" />
      <ThemedText type="body" style={{ color: C.text, fontSize: 14, fontWeight: "500" }}>Google</ThemedText>
    </Pressable>
  );
}

function FacebookButton({ onOAuth, C }: { onOAuth: OAuthHandler; C: Colors }) {
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
    <Pressable onPress={handlePress} style={({ pressed }) => [oauthBtn(C), { opacity: pressed ? 0.6 : 1 }]}>
      <FontAwesome5 name="facebook-f" size={16} color="#1877F2" />
      <ThemedText type="body" style={{ color: C.text, fontSize: 14, fontWeight: "500" }}>Facebook</ThemedText>
    </Pressable>
  );
}

function UnconfiguredOAuthButton({ label, icon, alertTitle, alertMessage, C }: {
  label: string; icon: "google" | "facebook-f"; alertTitle: string; alertMessage: string; C: Colors;
}) {
  const iconColor = icon === "google" ? "#4285F4" : "#1877F2";
  return (
    <Pressable onPress={() => Alert.alert(alertTitle, alertMessage)} style={({ pressed }) => [oauthBtn(C), { opacity: pressed ? 0.6 : 1 }]}>
      <FontAwesome5 name={icon} size={16} color={iconColor} />
      <ThemedText type="body" style={{ color: C.text, fontSize: 14, fontWeight: "500" }}>{label}</ThemedText>
    </Pressable>
  );
}

function oauthBtn(C: Colors): object {
  return {
    flex: 1, height: 48, borderRadius: 12, borderWidth: 1,
    borderColor: C.cardBorder, backgroundColor: C.input,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  };
}

// ---------------------------------------------------------------------------
// Focused input
// ---------------------------------------------------------------------------
function FocusInput(props: React.ComponentProps<typeof TextInput> & { icon: React.ComponentProps<typeof Feather>["name"]; C: Colors }) {
  const [focused, setFocused] = useState(false);
  const { icon, C, ...rest } = props;
  return (
    <View style={{
      flexDirection: "row", alignItems: "center",
      backgroundColor: focused ? C.inputFocusBg : C.input,
      borderWidth: 1,
      borderColor: focused ? C.inputFocusBorder : C.inputBorder,
      borderRadius: 14, height: 52, paddingHorizontal: 14,
    }}>
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

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------
export default function SignUpScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { isDark } = useTheme();
  const C = DARK;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
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

  async function handleRegister() {
    setError(null);
    if (!name.trim()) { setError("Please enter your full name."); return; }
    if (!email.trim()) { setError("Please enter your email address."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    if (!agreedToTerms) { setError("Please agree to the Terms of Service and Privacy Policy."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${getApiUrl()}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Registration failed. Please try again."); return; }
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
      if (!res.ok) { setError(data.message || "OAuth sign-up failed."); return; }
      await saveToken(data.token);
      triggerLogin();
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAppleSignIn() {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!credential.identityToken) { setError("Apple sign-in failed. Please try again."); return; }
      const fullName = [credential.fullName?.givenName, credential.fullName?.familyName].filter(Boolean).join(" ") || undefined;
      setLoading(true);
      const res = await fetch(`${getApiUrl()}/api/auth/oauth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: "apple", accessToken: credential.identityToken, fullName }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Apple sign-in failed."); return; }
      await saveToken(data.token);
      triggerLogin();
    } catch (e: any) {
      if (e.code !== "ERR_REQUEST_CANCELED") setError("Apple sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const strength = password.length === 0 ? 0 : password.length < 8 ? 1 : password.length < 12 ? 2 : 3;
  const strengthColors = ["transparent", "#FF6B6B", "#FFD166", C.strengthStrong];
  const strengthLabels = ["", "Weak", "Good", "Strong"];

  return (
    <View style={[styles.root, { backgroundColor: C.bg }]}>
      {isDark && <LinearGradient colors={C.gradColors} style={StyleSheet.absoluteFill} />}

      {isDark && (
        <>
          <View style={[styles.orb, styles.orb1, { backgroundColor: C.orb1 }]} />
          <View style={[styles.orb, styles.orb2, { backgroundColor: C.orb2 }]} />
        </>
      )}

      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

              {/* Back button */}
              <Pressable
                onPress={() => navigation.goBack()}
                style={({ pressed }) => [{
                  alignSelf: "flex-start", width: 40, height: 40, borderRadius: 12,
                  backgroundColor: isDark ? "rgba(0, 230, 100, 0.08)" : "#F3F4F6",
                  borderWidth: 1,
                  borderColor: isDark ? "rgba(0, 230, 100, 0.15)" : "#E5E7EB",
                  alignItems: "center", justifyContent: "center", marginBottom: 12,
                  opacity: pressed ? 0.6 : 1,
                }]}
              >
                <Feather name="arrow-left" size={20} color={C.text} />
              </Pressable>

              {/* Header */}
              <View style={styles.hero}>
                <Image
                  source={require("../../assets/images/icon.png")}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
                <ThemedText type="h1" style={[styles.appName, { color: C.text }]}>Create Account</ThemedText>
                <ThemedText type="body" style={[styles.tagline, { color: C.textMuted }]}>Join the Spinal Hub community</ThemedText>
              </View>

              {/* Card */}
              <BlurView intensity={isDark ? 18 : 0} tint={C.blurTint} style={[styles.card, { borderColor: C.cardBorder, backgroundColor: isDark ? undefined : C.card }]}>
                <View style={styles.cardInner}>
                  <View style={styles.fields}>
                    <FocusInput icon="user" placeholder="Full name" autoCapitalize="words" value={name} onChangeText={setName} C={C} />
                    <FocusInput icon="mail" placeholder="Email address" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} value={email} onChangeText={setEmail} C={C} />
                    <View>
                      <FocusInput icon="lock" placeholder="Password (min 8 characters)" secureTextEntry value={password} onChangeText={setPassword} C={C} />
                      {password.length > 0 && (
                        <View style={styles.strengthRow}>
                          {[1, 2, 3].map((i) => (
                            <View key={i} style={[styles.strengthBar, { backgroundColor: i <= strength ? strengthColors[strength] : C.cardBorder }]} />
                          ))}
                          <ThemedText type="small" style={[styles.strengthLabel, { color: strengthColors[strength] }]}>
                            {strengthLabels[strength]}
                          </ThemedText>
                        </View>
                      )}
                    </View>
                    <FocusInput icon="check-circle" placeholder="Confirm password" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} C={C} />
                  </View>

                  {error && (
                    <View style={styles.errorRow}>
                      <Feather name="alert-circle" size={13} color={C.error} />
                      <ThemedText type="small" style={[styles.errorText, { color: C.error }]}>{error}</ThemedText>
                    </View>
                  )}

                  {/* T&C checkbox */}
                  <Pressable onPress={() => setAgreedToTerms(v => !v)} style={styles.termsRow} accessibilityRole="checkbox" accessibilityState={{ checked: agreedToTerms }}>
                    <View style={[styles.checkbox, { borderColor: agreedToTerms ? C.inputFocusBorder : C.inputBorder, backgroundColor: agreedToTerms ? C.inputFocusBorder : "transparent" }]}>
                      {agreedToTerms && <Feather name="check" size={12} color="#fff" />}
                    </View>
                    <ThemedText type="small" style={[styles.termsText, { color: C.textMuted }]}>
                      {"I agree to the "}
                      <ThemedText type="small" style={{ color: C.inputFocusBorder }} onPress={() => Linking.openURL("https://imaginative-tiramisu-f84d2c.netlify.app/privacy")}>Privacy Policy</ThemedText>
                    </ThemedText>
                  </Pressable>

                  <Pressable onPress={handleRegister} disabled={loading} style={({ pressed }) => [{ opacity: pressed || loading ? 0.8 : 1 }]}>
                    <LinearGradient colors={C.primaryGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.primaryBtn, isDark && styles.primaryBtnShadow]}>
                      {loading ? <ActivityIndicator color="#fff" /> : (
                        <>
                          <ThemedText type="body" style={styles.primaryBtnText}>Create Account</ThemedText>
                          <Feather name="arrow-right" size={18} color="#fff" />
                        </>
                      )}
                    </LinearGradient>
                  </Pressable>

                  <View style={styles.divider}>
                    <View style={[styles.dividerLine, { backgroundColor: C.dividerLine }]} />
                    <ThemedText type="small" style={[styles.dividerText, { color: C.textDim }]}>or sign up with</ThemedText>
                    <View style={[styles.dividerLine, { backgroundColor: C.dividerLine }]} />
                  </View>

                  <View style={styles.oauthRow}>
                    {hasGoogle ? <GoogleButton onOAuth={handleOAuth} C={C} /> : <UnconfiguredOAuthButton label="Google" icon="google" alertTitle="Google Sign-In Not Configured" alertMessage="Add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID to your .env file." C={C} />}
                  </View>

                  {Platform.OS === "ios" && (
                    <AppleAuthentication.AppleAuthenticationButton
                      buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP}
                      buttonStyle={isDark
                        ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
                        : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                      cornerRadius={12}
                      style={styles.appleBtn}
                      onPress={handleAppleSignIn}
                    />
                  )}
                </View>
              </BlurView>

              <View style={styles.footer}>
                <ThemedText type="small" style={[styles.footerText, { color: C.textMuted }]}>Already have an account? </ThemedText>
                <Pressable onPress={() => navigation.goBack()} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
                  <ThemedText type="small" style={[styles.footerLink, { color: C.primary }]}>Sign In</ThemedText>
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
  orb1: { width: SCREEN_W * 0.85, height: SCREEN_W * 0.85, bottom: SCREEN_H * 0.05, left: -SCREEN_W * 0.3 },
  orb2: { width: SCREEN_W * 0.7, height: SCREEN_W * 0.7, top: -SCREEN_W * 0.2, right: -SCREEN_W * 0.25 },

  hero: { alignItems: "center", marginBottom: 28 },
  logoGradient: { width: 68, height: 68, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  logoShadow: { shadowColor: "#00E676", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.7, shadowRadius: 22, elevation: 10 },
  logoImage: { width: 120, height: 120, marginBottom: 14 },
  termsRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 14 },
  checkbox: { width: 20, height: 20, borderRadius: 5, borderWidth: 1.5, alignItems: "center", justifyContent: "center", marginTop: 1, flexShrink: 0 },
  termsText: { flex: 1, lineHeight: 18 },
  appName: { fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
  tagline: { marginTop: 4, fontSize: 14 },

  card: { width: "100%", borderRadius: 24, overflow: "hidden", borderWidth: 1 },
  cardInner: { padding: 24 },

  fields: { gap: 12, marginBottom: 8 },

  strengthRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8, paddingHorizontal: 2 },
  strengthBar: { flex: 1, height: 3, borderRadius: 4 },
  strengthLabel: { fontSize: 11, fontWeight: "600", minWidth: 40, textAlign: "right" },

  errorRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12, marginTop: 4 },
  errorText: { fontSize: 13, flex: 1 },

  primaryBtn: { height: 54, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 16 },
  primaryBtnShadow: { shadowColor: "#00E676", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 18, elevation: 8 },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  divider: { flexDirection: "row", alignItems: "center", marginVertical: 20, gap: 10 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 12 },

  oauthRow: { flexDirection: "row", gap: 10, width: "100%" },
  appleBtn: { width: "100%", height: 48, marginTop: 10 },

  footer: { flexDirection: "row", alignItems: "center", marginTop: 24 },
  footerText: { fontSize: 14 },
  footerLink: { fontWeight: "600", fontSize: 14 },
});
