import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useTheme, type ThemeColors } from "../context/ThemeContext";
import { SITE_URL } from "../lib/env";
import { supabase } from "../lib/supabase";
import { formatCents } from "../lib/format";
import type { RootStackParamList } from "../navigation/types";

const FREE_SHIPPING_THRESHOLD = 5000;
const SHIPPING_CENTS = 599;

type FormState = {
  email: string;
  customerName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export function CheckoutScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "Checkout">) {
  const { items, subtotalCents, clear } = useCart();
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [form, setForm] = useState<FormState>({
    email: "",
    customerName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "United States",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.email) {
      setForm((f) => (f.email ? f : { ...f, email: user.email! }));
    }
  }, [user]);

  const shippingCents =
    subtotalCents >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_CENTS;
  const totalCents = subtotalCents + shippingCents;

  function update(field: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`${SITE_URL}/api/checkout`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          ...form,
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");
      clear();
      setOrderId(data.orderId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (orderId) {
    return (
      <View style={styles.center}>
        <Text style={styles.successTitle}>Order placed!</Text>
        <Text style={styles.sub}>
          Order number:{" "}
          <Text style={styles.orderId}>{orderId.slice(0, 8).toUpperCase()}</Text>
        </Text>
        <Pressable
          onPress={() => navigation.navigate("Home")}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>Continue shopping</Text>
        </Pressable>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.successTitle}>Nothing to check out</Text>
        <Text style={styles.sub}>Your cart is empty.</Text>
        <Pressable
          onPress={() => navigation.navigate("Home")}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>Browse products</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.sectionTitle}>Contact</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={colors.placeholder}
        keyboardType="email-address"
        autoCapitalize="none"
        value={form.email}
        onChangeText={(t) => update("email", t)}
      />

      <Text style={styles.sectionTitle}>Shipping address</Text>
      <TextInput
        style={styles.input}
        placeholder="Full name"
        placeholderTextColor={colors.placeholder}
        value={form.customerName}
        onChangeText={(t) => update("customerName", t)}
      />
      <TextInput
        style={styles.input}
        placeholder="Address line 1"
        placeholderTextColor={colors.placeholder}
        value={form.addressLine1}
        onChangeText={(t) => update("addressLine1", t)}
      />
      <TextInput
        style={styles.input}
        placeholder="Address line 2 (optional)"
        placeholderTextColor={colors.placeholder}
        value={form.addressLine2}
        onChangeText={(t) => update("addressLine2", t)}
      />
      <TextInput
        style={styles.input}
        placeholder="City"
        placeholderTextColor={colors.placeholder}
        value={form.city}
        onChangeText={(t) => update("city", t)}
      />
      <TextInput
        style={styles.input}
        placeholder="State"
        placeholderTextColor={colors.placeholder}
        value={form.state}
        onChangeText={(t) => update("state", t)}
      />
      <TextInput
        style={styles.input}
        placeholder="ZIP / Postal code"
        placeholderTextColor={colors.placeholder}
        value={form.postalCode}
        onChangeText={(t) => update("postalCode", t)}
      />
      <TextInput
        style={styles.input}
        placeholder="Country"
        placeholderTextColor={colors.placeholder}
        value={form.country}
        onChangeText={(t) => update("country", t)}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>{formatCents(subtotalCents)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Shipping</Text>
          <Text style={styles.summaryValue}>
            {shippingCents === 0 ? "Free" : formatCents(shippingCents)}
          </Text>
        </View>
        <View style={[styles.summaryRow, styles.summaryTotal]}>
          <Text style={styles.summaryTotalLabel}>Total</Text>
          <Text style={styles.summaryTotalValue}>{formatCents(totalCents)}</Text>
        </View>
      </View>

      <Pressable
        onPress={() => void handleSubmit()}
        disabled={submitting}
        style={[styles.primaryButton, submitting && styles.disabled]}
      >
        <Text style={styles.primaryButtonText}>
          {submitting ? "Placing order…" : "Place order"}
        </Text>
      </Pressable>
      <Text style={styles.disclaimer}>
        Demo checkout — no real payment is processed.
      </Text>
    </ScrollView>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    container: {
      padding: 16,
      paddingBottom: 40,
    },
    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    },
    sectionTitle: {
      marginTop: 16,
      marginBottom: 8,
      fontSize: 15,
      fontWeight: "700",
      color: c.text,
    },
    input: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 15,
      marginBottom: 8,
      backgroundColor: c.card,
      color: c.text,
    },
    error: {
      color: c.danger,
      marginTop: 8,
    },
    summary: {
      marginTop: 16,
      borderTopWidth: 1,
      borderTopColor: c.borderLight,
      paddingTop: 12,
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    summaryLabel: {
      color: c.textSubtle,
    },
    summaryValue: {
      color: c.text,
    },
    summaryTotal: {
      borderTopWidth: 1,
      borderTopColor: c.borderLight,
      paddingTop: 8,
    },
    summaryTotalLabel: {
      fontWeight: "700",
      color: c.text,
    },
    summaryTotalValue: {
      fontWeight: "700",
      color: c.text,
    },
    primaryButton: {
      marginTop: 8,
      height: 46,
      borderRadius: 999,
      backgroundColor: c.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    primaryButtonText: {
      color: c.onAccent,
      fontWeight: "600",
    },
    disabled: {
      opacity: 0.6,
    },
    disclaimer: {
      marginTop: 12,
      textAlign: "center",
      color: c.textFaint,
      fontSize: 12,
    },
    successTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: c.text,
    },
    sub: {
      marginTop: 8,
      textAlign: "center",
      color: c.textSubtle,
    },
    orderId: {
      fontWeight: "700",
      color: c.text,
    },
  });
