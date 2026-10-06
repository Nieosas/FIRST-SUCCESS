import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ProductCard } from "../components/ProductCard";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { supabase } from "../lib/supabase";
import { isSupabaseConfigured } from "../lib/env";
import { demoProducts } from "../lib/demo-products";
import type { Product } from "../lib/types";
import type { RootStackParamList } from "../navigation/types";

export function HomeScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "Home">) {
  const { user, loading: authLoading, configured, signInWithGoogle, signOut } =
    useAuth();
  const { totalCount } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (isSupabaseConfigured()) {
      const { data } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      setProducts(data ?? []);
    } else {
      setProducts(demoProducts);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => navigation.navigate("Cart")}
          style={styles.cartButton}
          hitSlop={8}
        >
          <Text style={styles.cartButtonText}>Cart</Text>
          {totalCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{totalCount}</Text>
            </View>
          )}
        </Pressable>
      ),
    });
  }, [navigation, totalCount]);

  return (
    <FlatList
      data={products}
      keyExtractor={(p) => p.id}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.list}
      onRefresh={load}
      refreshing={loading}
      ListHeaderComponent={
        <View style={styles.account}>
          {!configured ? (
            <Text style={styles.accountText}>
              Demo mode — set EXPO_PUBLIC_SUPABASE_URL to enable sync.
            </Text>
          ) : authLoading ? (
            <ActivityIndicator color="#4f46e5" />
          ) : user ? (
            <View style={styles.signedInRow}>
              <View style={styles.signedInTextWrap}>
                <Text style={styles.accountText} numberOfLines={1}>
                  {user.email}
                </Text>
              </View>
              <Pressable
                onPress={() => navigation.navigate("Orders")}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>Orders</Text>
              </Pressable>
              <Pressable onPress={() => void signOut()} style={styles.linkButton}>
                <Text style={styles.linkButtonText}>Sign out</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={() => void signInWithGoogle().catch(() => {})}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>Sign in with Google</Text>
            </Pressable>
          )}
        </View>
      }
      renderItem={({ item }) => <ProductCard product={item} />}
      ListEmptyComponent={
        !loading ? (
          <Text style={styles.empty}>No products yet.</Text>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 12,
  },
  row: {
    justifyContent: "space-between",
  },
  account: {
    marginBottom: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#eef2ff",
    alignItems: "center",
  },
  accountText: {
    fontSize: 13,
    color: "#3730a3",
    textAlign: "center",
  },
  signedInRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  signedInTextWrap: {
    flex: 1,
  },
  primaryButton: {
    backgroundColor: "#4f46e5",
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#c7d2fe",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  secondaryButtonText: {
    color: "#3730a3",
    fontWeight: "600",
  },
  linkButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  linkButtonText: {
    color: "#dc2626",
    fontWeight: "600",
  },
  cartButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  cartButtonText: {
    fontSize: 16,
    color: "#4f46e5",
    fontWeight: "600",
  },
  badge: {
    marginLeft: 6,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#4f46e5",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  empty: {
    textAlign: "center",
    color: "#71717a",
    marginTop: 24,
  },
});
