import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { formatCents } from "../lib/format";
import type { Order, OrderItem } from "../lib/types";
import type { RootStackParamList } from "../navigation/types";

type OrderWithItems = Order & { items: OrderItem[] };

export function OrdersScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "Orders">) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderWithItems[] | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: orderList } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      const list = orderList ?? [];

      if (list.length === 0) {
        setOrders([]);
        return;
      }

      const { data: allItems } = await supabase
        .from("order_items")
        .select("*")
        .in(
          "order_id",
          list.map((o) => o.id)
        );

      const byOrder = new Map<string, OrderItem[]>();
      for (const item of allItems ?? []) {
        const arr = byOrder.get(item.order_id) ?? [];
        arr.push(item);
        byOrder.set(item.order_id, arr);
      }

      setOrders(list.map((o) => ({ ...o, items: byOrder.get(o.id) ?? [] })));
    })();
  }, [user]);

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Your orders</Text>
        <Text style={styles.sub}>Sign in to view your order history.</Text>
        <Pressable
          onPress={() => navigation.navigate("Auth")}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Sign in</Text>
        </Pressable>
      </View>
    );
  }

  if (orders === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#4f46e5" />
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.sub}>You have not placed any orders yet.</Text>
        <Pressable
          onPress={() => navigation.navigate("Home")}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Start shopping</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      data={orders}
      keyExtractor={(o) => o.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.orderId}>#{item.id.slice(0, 8).toUpperCase()}</Text>
              <Text style={styles.date}>
                {new Date(item.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </Text>
            </View>
            <View style={styles.cardHeaderRight}>
              <Text style={styles.total}>{formatCents(item.total_cents)}</Text>
              <Text style={styles.status}>{item.status}</Text>
            </View>
          </View>

          <View style={styles.items}>
            {item.items.map((i) => (
              <View key={i.id} style={styles.itemRow}>
                <Text style={styles.itemName}>
                  {i.product_name} <Text style={styles.qty}>x{i.quantity}</Text>
                </Text>
                <Text style={styles.itemPrice}>
                  {formatCents(i.unit_price_cents * i.quantity)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#18181b",
  },
  sub: {
    marginTop: 8,
    textAlign: "center",
    color: "#71717a",
  },
  button: {
    marginTop: 16,
    borderRadius: 999,
    backgroundColor: "#4f46e5",
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  list: {
    padding: 16,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e4e4e7",
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f4f4f5",
  },
  orderId: {
    fontWeight: "700",
    color: "#18181b",
  },
  date: {
    color: "#71717a",
    fontSize: 13,
  },
  cardHeaderRight: {
    alignItems: "flex-end",
  },
  total: {
    fontWeight: "700",
    color: "#18181b",
  },
  status: {
    textTransform: "capitalize",
    color: "#71717a",
    fontSize: 13,
  },
  items: {
    marginTop: 12,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  itemName: {
    flex: 1,
    color: "#3f3f46",
  },
  qty: {
    color: "#71717a",
  },
  itemPrice: {
    color: "#18181b",
  },
});
