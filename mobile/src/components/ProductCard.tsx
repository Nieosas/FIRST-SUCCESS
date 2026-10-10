import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCart } from "../context/CartContext";
import { useTheme, type ThemeColors } from "../context/ThemeContext";
import { formatCents } from "../lib/format";
import type { Product } from "../lib/types";
import type { RootStackParamList } from "../navigation/types";

export function ProductCard({ product }: { product: Product }) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { addItem } = useCart();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  function handleAdd() {
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      priceCents: product.price_cents,
      imageUrl: product.image_url,
    });
  }

  return (
    <View style={styles.card}>
      <Pressable
        onPress={() =>
          navigation.navigate("Product", { productId: product.id })
        }
      >
        {product.image_url ? (
          <Image source={{ uri: product.image_url }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]} />
        )}
        <View style={styles.body}>
          <Text style={styles.category}>{product.category}</Text>
          <Text style={styles.name} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={styles.price}>{formatCents(product.price_cents)}</Text>
        </View>
      </Pressable>

      <Pressable style={styles.addButton} onPress={handleAdd}>
        <Text style={styles.addButtonText}>Add to cart</Text>
      </Pressable>
    </View>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    card: {
      width: "48%",
      marginBottom: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.borderLight,
      backgroundColor: c.card,
      overflow: "hidden",
    },
    image: {
      width: "100%",
      aspectRatio: 1,
      backgroundColor: c.surface,
    },
    imagePlaceholder: {
      backgroundColor: c.surface,
    },
    body: {
      padding: 12,
    },
    category: {
      fontSize: 11,
      fontWeight: "600",
      textTransform: "uppercase",
      color: c.accent,
    },
    name: {
      marginTop: 4,
      fontSize: 14,
      fontWeight: "500",
      color: c.text,
    },
    price: {
      marginTop: 6,
      fontSize: 15,
      fontWeight: "700",
      color: c.text,
    },
    addButton: {
      marginHorizontal: 12,
      marginBottom: 12,
      borderRadius: 999,
      backgroundColor: c.accent,
      paddingVertical: 8,
      alignItems: "center",
    },
    addButtonText: {
      color: c.onAccent,
      fontWeight: "600",
      fontSize: 13,
    },
  });
