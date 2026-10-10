import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCart, type CartItem } from "../context/CartContext";
import { useTheme, type ThemeColors } from "../context/ThemeContext";
import { formatCents } from "../lib/format";
import type { RootStackParamList } from "../navigation/types";

export function CartScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "Cart">) {
  const { items, removeItem, setQuantity, subtotalCents } = useCart();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySub}>Add a few accessories to get started.</Text>
        <Pressable
          onPress={() => navigation.navigate("Home")}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>Browse products</Text>
        </Pressable>
      </View>
    );
  }

  function renderItem({ item }: { item: CartItem }) {
    return (
      <View style={styles.item}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.thumb} />
        ) : (
          <View style={[styles.thumb, styles.thumbPlaceholder]} />
        )}

        <View style={styles.itemBody}>
          <Text style={styles.itemName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.itemPrice}>{formatCents(item.priceCents)} each</Text>

          <View style={styles.itemRow}>
            <View style={styles.stepper}>
              <Pressable
                onPress={() => setQuantity(item.productId, item.quantity - 1)}
                style={styles.stepButton}
              >
                <Text style={styles.stepText}>-</Text>
              </Pressable>
              <Text style={styles.qty}>{item.quantity}</Text>
              <Pressable
                onPress={() => setQuantity(item.productId, item.quantity + 1)}
                style={styles.stepButton}
              >
                <Text style={styles.stepText}>+</Text>
              </Pressable>
            </View>

            <Pressable onPress={() => removeItem(item.productId)}>
              <Text style={styles.removeText}>Remove</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.lineTotal}>
          {formatCents(item.priceCents * item.quantity)}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(i) => i.productId}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />

      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <Text style={styles.footerLabel}>Subtotal</Text>
          <Text style={styles.footerTotal}>{formatCents(subtotalCents)}</Text>
        </View>
        <Pressable
          onPress={() => navigation.navigate("Checkout")}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>Proceed to checkout</Text>
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background,
    },
    list: {
      padding: 16,
    },
    empty: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: c.text,
    },
    emptySub: {
      marginTop: 6,
      color: c.textSubtle,
    },
    item: {
      flexDirection: "row",
      gap: 12,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: c.borderLight,
    },
    thumb: {
      width: 64,
      height: 64,
      borderRadius: 8,
      backgroundColor: c.surface,
    },
    thumbPlaceholder: {
      backgroundColor: c.surface,
    },
    itemBody: {
      flex: 1,
    },
    itemName: {
      fontSize: 15,
      fontWeight: "600",
      color: c.text,
    },
    itemPrice: {
      marginTop: 2,
      fontSize: 13,
      color: c.textSubtle,
    },
    itemRow: {
      marginTop: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    stepper: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 999,
    },
    stepButton: {
      width: 30,
      height: 30,
      alignItems: "center",
      justifyContent: "center",
    },
    stepText: {
      fontSize: 18,
      color: c.textMuted,
    },
    qty: {
      minWidth: 24,
      textAlign: "center",
      fontWeight: "600",
      color: c.text,
    },
    removeText: {
      color: c.danger,
      fontSize: 13,
    },
    lineTotal: {
      fontWeight: "700",
      color: c.text,
      alignSelf: "center",
    },
    footer: {
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: c.borderLight,
    },
    footerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    footerLabel: {
      color: c.textSubtle,
    },
    footerTotal: {
      fontSize: 20,
      fontWeight: "700",
      color: c.text,
    },
    primaryButton: {
      marginTop: 12,
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
  });
