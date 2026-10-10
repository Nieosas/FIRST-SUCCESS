import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import { useTheme, type ThemeColors } from "../context/ThemeContext";
import type { RootStackParamList } from "../navigation/types";

export function AuthScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "Auth">) {
  const { configured, signInWithGoogle, signInWithEmail, signUpWithEmail } =
    useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function reset() {
    setError(null);
    setNotice(null);
  }

  async function handleEmail() {
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    reset();
    setBusy(true);
    try {
      if (mode === "signin") {
        await signInWithEmail(email.trim(), password);
        navigation.goBack();
      } else {
        const { needsConfirmation } = await signUpWithEmail(
          email.trim(),
          password
        );
        if (needsConfirmation) {
          setNotice("Account created — check your email to confirm it.");
        } else {
          navigation.goBack();
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    reset();
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>
          {mode === "signin" ? "Sign in" : "Create account"}
        </Text>
        <Text style={styles.sub}>
          {configured
            ? "Use the same account as the website to sync your cart."
            : "Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in mobile/.env to enable sign-in."}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.placeholder}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder={mode === "signup" ? "Password (min. 6 characters)" : "Password"}
          placeholderTextColor={colors.placeholder}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {error && <Text style={styles.error}>{error}</Text>}
        {notice && <Text style={styles.notice}>{notice}</Text>}

        <Pressable
          onPress={() => void handleEmail()}
          disabled={busy}
          style={[styles.primaryButton, busy && styles.disabled]}
        >
          {busy ? (
            <ActivityIndicator color={colors.onAccent} />
          ) : (
            <Text style={styles.primaryButtonText}>
              {mode === "signin" ? "Sign in" : "Create account"}
            </Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => {
            reset();
            setMode((m) => (m === "signin" ? "signup" : "signin"));
          }}
          style={styles.linkButton}
        >
          <Text style={styles.linkButtonText}>
            {mode === "signin"
              ? "New here? Create an account"
              : "Already have an account? Sign in"}
          </Text>
        </Pressable>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <Pressable
          onPress={() => void handleGoogle()}
          disabled={busy}
          style={[styles.secondaryButton, busy && styles.disabled]}
        >
          <Text style={styles.secondaryButtonText}>Continue with Google</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    flex: {
      flex: 1,
      backgroundColor: c.background,
    },
    container: {
      padding: 24,
      paddingTop: 40,
    },
    title: {
      fontSize: 26,
      fontWeight: "700",
      color: c.text,
    },
    sub: {
      marginTop: 6,
      fontSize: 14,
      color: c.textSubtle,
      marginBottom: 20,
    },
    input: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontSize: 15,
      marginBottom: 10,
      backgroundColor: c.card,
      color: c.text,
    },
    error: {
      color: c.danger,
      marginBottom: 10,
    },
    notice: {
      color: c.success,
      marginBottom: 10,
    },
    primaryButton: {
      marginTop: 6,
      height: 48,
      borderRadius: 999,
      backgroundColor: c.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    primaryButtonText: {
      color: c.onAccent,
      fontWeight: "600",
      fontSize: 16,
    },
    linkButton: {
      marginTop: 14,
      alignItems: "center",
    },
    linkButtonText: {
      color: c.accent,
      fontWeight: "600",
    },
    divider: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 24,
      marginBottom: 16,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: c.borderLight,
    },
    dividerText: {
      marginHorizontal: 12,
      color: c.textFaint,
    },
    secondaryButton: {
      height: 48,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: "center",
      justifyContent: "center",
    },
    secondaryButtonText: {
      color: c.textMuted,
      fontWeight: "600",
    },
    disabled: {
      opacity: 0.6,
    },
  });
