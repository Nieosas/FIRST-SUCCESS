import { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCart } from "../context/CartContext";
import { supabase } from "../lib/supabase";
import { isSupabaseConfigured } from "../lib/env";
import { demoProducts } from "../lib/demo-products";
import { formatCents } from "../lib/format";
import type { Product } from "../lib/types";
import type { RootStackParamList } from "../navigation/types";

export function ProductScreen({
  route,
}: NativeStackScreenProps<RootStackParamList, "Product">) {
  const { productId } = route.params;
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    (async () => {
      if (isSupabaseConfigured()) {
        const { data } = await supabase
          .from("products")
          .select("*")
          .eq("id", productId)
          .single();
        setProduct(data ?? null);
      } else {
        setProduct(demoProducts.find((p) => p.id === productId) ?? null);
      }
    })();
  }, [productId]);

  if (!product) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Loading…</Text>
      </View>
    );
  }

  function handleAdd() {
    addItem(
      {
        productId: product!.id,
        name: product!.name,
        slug: product!.slug,
        priceCents: product!.price_cents,
        imageUrl: product!.image_url,
      },
      qty
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  const outOfStock = product.stock <= 0;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {product.image_url ? (
        <Image source={{ uri: product.image_url }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]} />
      )}

      <Text style={styles.category}>{product.category}</Text>
      <Text style={styles.title}>{product.name}</Text>
      <Text style={styles.price}>{formatCents(product.price_cents)}</Text>
      <Text style={styles.description}>
        {product.description ?? "No description provided."}
      </Text>
      <Text style={styles.stock}>
        {outOfStock ? "Out of stock" : `${product.stock} in stock`}
      </Text>

      <View style={styles.actions}>
        <View style={styles.stepper}>
          <Pressable
            onPress={() => setQty((q) => Math.max(1, q - 1))}
            style={styles.stepButton}
          >
            <Text style={styles.stepText}>-</Text>
          </Pressable>
          <Text style={styles.qty}>{qty}</Text>
          <Pressable
            onPress={() => setQty((q) => Math.min(99, q + 1))}
            style={styles.stepButton}
          >
            <Text style={styles.stepText}>+</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={handleAdd}
          disabled={outOfStock}
          style={[styles.addButton, outOfStock && styles.disabled]}
        >
          <Text style={styles.addButtonText}>
            {added
              ? "Added to cart"
              : outOfStock
                ? "Out of stock"
                : "Add to cart"}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  muted: {
    color: "#71717a",
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  image: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: "#f4f4f5",
  },
  imagePlaceholder: {
    backgroundColor: "#f4f4f5",
  },
  category: {
    marginTop: 16,
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    color: "#4f46e5",
  },
  title: {
    marginTop: 6,
    fontSize: 26,
    fontWeight: "700",
    color: "#18181b",
  },
  price: {
    marginTop: 10,
    fontSize: 22,
    fontWeight: "700",
    color: "#18181b",
  },
  description: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 22,
    color: "#52525b",
  },
  stock: {
    marginTop: 8,
    fontSize: 13,
    color: "#71717a",
  },
  actions: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d4d4d8",
    borderRadius: 999,
  },
  stepButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  stepText: {
    fontSize: 20,
    color: "#52525b",
  },
  qty: {
    minWidth: 32,
    textAlign: "center",
    fontWeight: "600",
    color: "#18181b",
  },
  addButton: {
    flex: 1,
    height: 44,
    borderRadius: 999,
    backgroundColor: "#4f46e5",
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.5,
  },
});
