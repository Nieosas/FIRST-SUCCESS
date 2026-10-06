import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { isSupabaseConfigured } from "../lib/env";
import { useAuth } from "./AuthContext";

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  priceCents: number;
  imageUrl: string | null;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  totalCount: number;
  subtotalCents: number;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "phoendeck-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const configured = isSupabaseConfigured();
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);

  const userRef = useRef(user);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const reloadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const readLocalCart = useCallback(async (): Promise<CartItem[]> => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  }, []);

  const writeLocalCart = useCallback(async (next: CartItem[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore storage errors
    }
  }, []);

  const loadServerCart = useCallback(
    async (uid: string): Promise<CartItem[]> => {
      const { data: rows } = await supabase
        .from("cart_items")
        .select("product_id, quantity")
        .eq("user_id", uid);

      if (!rows || rows.length === 0) return [];

      const { data: products } = await supabase
        .from("products")
        .select("id, name, slug, price_cents, image_url")
        .in(
          "id",
          rows.map((r) => r.product_id)
        );

      const map = new Map((products ?? []).map((p) => [p.id, p]));
      return rows
        .filter((r) => map.has(r.product_id))
        .map((r) => {
          const p = map.get(r.product_id)!;
          return {
            productId: p.id,
            name: p.name,
            slug: p.slug,
            priceCents: p.price_cents,
            imageUrl: p.image_url,
            quantity: r.quantity,
          };
        });
    },
    []
  );

  const reloadServerCart = useCallback(
    (uid: string) => {
      if (reloadTimerRef.current) clearTimeout(reloadTimerRef.current);
      reloadTimerRef.current = setTimeout(async () => {
        const next = await loadServerCart(uid);
        if (userRef.current?.id === uid) setItems(next);
      }, 120);
    },
    [loadServerCart]
  );

  useEffect(() => {
    if (!configured) {
      readLocalCart().then(setItems);
      return;
    }

    let cancelled = false;

    async function syncForUser(uid: string | null, mergeGuest: boolean) {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }

      if (uid) {
        if (mergeGuest) {
          const guest = await readLocalCart();
          if (guest.length > 0) {
            for (const item of guest) {
              await supabase.rpc("add_cart_item", {
                p_product_id: item.productId,
                p_quantity: item.quantity,
              });
            }
            await writeLocalCart([]);
          }
        }

        const serverItems = await loadServerCart(uid);
        if (!cancelled) setItems(serverItems);

        const channel = supabase
          .channel(`cart-sync-${uid}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "cart_items",
              filter: `user_id=eq.${uid}`,
            },
            () => reloadServerCart(uid)
          )
          .subscribe();
        channelRef.current = channel;
      } else {
        const local = await readLocalCart();
        if (!cancelled) setItems(local);
      }
    }

    if (user) {
      void syncForUser(user.id, true);
    } else {
      readLocalCart().then((local) => {
        if (!cancelled) setItems(local);
      });
    }

    return () => {
      cancelled = true;
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [
    configured,
    user,
    readLocalCart,
    writeLocalCart,
    loadServerCart,
    reloadServerCart,
  ]);

  function addItem(item: Omit<CartItem, "quantity">, quantity = 1) {
    if (configured && userRef.current) {
      setItems((prev) => {
        const existing = prev.find((i) => i.productId === item.productId);
        if (existing) {
          return prev.map((i) =>
            i.productId === item.productId
              ? { ...i, quantity: i.quantity + quantity }
              : i
          );
        }
        return [...prev, { ...item, quantity }];
      });
      supabase
        .rpc("add_cart_item", {
          p_product_id: item.productId,
          p_quantity: quantity,
        })
        .then(({ error }) => {
          if (error) console.error(error);
        });
      return;
    }

    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      const next = existing
        ? prev.map((i) =>
            i.productId === item.productId
              ? { ...i, quantity: i.quantity + quantity }
              : i
          )
        : [...prev, { ...item, quantity }];
      void writeLocalCart(next);
      return next;
    });
  }

  function removeItem(productId: string) {
    if (configured && userRef.current) {
      setItems((prev) => prev.filter((i) => i.productId !== productId));
      supabase
        .rpc("remove_cart_item", { p_product_id: productId })
        .then(({ error }) => {
          if (error) console.error(error);
        });
      return;
    }

    setItems((prev) => {
      const next = prev.filter((i) => i.productId !== productId);
      void writeLocalCart(next);
      return next;
    });
  }

  function setQuantity(productId: string, quantity: number) {
    if (configured && userRef.current) {
      if (quantity <= 0) {
        setItems((prev) => prev.filter((i) => i.productId !== productId));
      } else {
        setItems((prev) =>
          prev.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          )
        );
      }
      supabase
        .rpc("set_cart_quantity", {
          p_product_id: productId,
          p_quantity: quantity,
        })
        .then(({ error }) => {
          if (error) console.error(error);
        });
      return;
    }

    if (quantity <= 0) {
      setItems((prev) => {
        const next = prev.filter((i) => i.productId !== productId);
        void writeLocalCart(next);
        return next;
      });
      return;
    }
    setItems((prev) => {
      const next = prev.map((i) =>
        i.productId === productId ? { ...i, quantity } : i
      );
      void writeLocalCart(next);
      return next;
    });
  }

  function clear() {
    if (configured && userRef.current) {
      setItems([]);
      supabase.rpc("clear_cart").then(({ error }) => {
        if (error) console.error(error);
      });
      return;
    }

    setItems([]);
    void writeLocalCart([]);
  }

  const value = useMemo<CartContextValue>(() => {
    const totalCount = items.reduce((n, i) => n + i.quantity, 0);
    const subtotalCents = items.reduce(
      (n, i) => n + i.quantity * i.priceCents,
      0
    );
    return {
      items,
      addItem,
      removeItem,
      setQuantity,
      clear,
      totalCount,
      subtotalCents,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
