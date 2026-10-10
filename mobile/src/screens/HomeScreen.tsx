import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
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
import { useTheme, type ThemeColors } from "../context/ThemeContext";
import { supabase } from "../lib/supabase";
import { isSupabaseConfigured } from "../lib/env";
import { demoProducts } from "../lib/demo-products";
import type { Product } from "../lib/types";
import type { RootStackParamList } from "../navigation/types";

export function HomeScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "Home">) {
  const { user, loading: authLoading, configured, signOut } = useAuth();
  const { totalCount } = useCart();
  const { colors, dark, toggleTheme } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

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
        <View style={styles.headerActions}>
          <Pressable
            onPress={toggleTheme}
            style={styles.themeButton}
            hitSlop={8}
          >
            <Text style={styles.themeButtonText}>
              {dark ? "Light" : "Dark"}
            </Text>
          </Pressable>
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
        </View>
      ),
    });
  }, [navigation, totalCount, styles, dark, toggleTheme]);

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
            <ActivityIndicator color={colors.accent} />
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
              onPress={() => navigation.navigate("Auth")}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>Sign in / Create account</Text>
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

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    list: {
      padding: 12,
    },
    row: {
      justifyContent: "space-between",
    },
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
    },
    themeButton: {
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    themeButtonText: {
      fontSize: 15,
      color: c.accent,
      fontWeight: "600",
    },
    account: {
      marginBottom: 12,
      padding: 14,
      borderRadius: 16,
      backgroundColor: c.accentSoft,
      alignItems: "center",
    },
    accountText: {
      fontSize: 13,
      color: c.accentText,
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
      backgroundColor: c.accent,
      borderRadius: 999,
      paddingVertical: 10,
      paddingHorizontal: 18,
    },
    primaryButtonText: {
      color: c.onAccent,
      fontWeight: "600",
    },
    secondaryButton: {
      borderWidth: 1,
      borderColor: c.accentBorder,
      borderRadius: 999,
      paddingVertical: 8,
      paddingHorizontal: 14,
    },
    secondaryButtonText: {
      color: c.accentText,
      fontWeight: "600",
    },
    linkButton: {
      paddingVertical: 8,
      paddingHorizontal: 4,
    },
    linkButtonText: {
      color: c.danger,
      fontWeight: "600",
    },
    cartButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 4,
    },
    cartButtonText: {
      fontSize: 16,
      color: c.accent,
      fontWeight: "600",
    },
    badge: {
      marginLeft: 6,
      minWidth: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: c.accent,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 5,
    },
    badgeText: {
      color: c.onAccent,
      fontSize: 12,
      fontWeight: "700",
    },
    empty: {
      textAlign: "center",
      color: c.textSubtle,
      marginTop: 24,
    },
  });
