import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatCents } from "@/lib/format";
import { isSupabaseConfigured } from "@/lib/config";
import type { OrderItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-semibold">Your orders</h1>
        <p className="mt-2 text-zinc-600">
          Order history and Google sign-in require Supabase. Add your keys in{" "}
          <code className="font-mono">.env.local</code> and run{" "}
          <code className="font-mono">supabase/schema.sql</code>.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-indigo-600 px-6 font-medium text-white hover:bg-indigo-700"
        >
          Back to shop
        </Link>
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-semibold">Your orders</h1>
        <p className="mt-2 text-zinc-600">
          Sign in with Google to view your order history.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-indigo-600 px-6 font-medium text-white hover:bg-indigo-700"
        >
          Back to shop
        </Link>
      </div>
    );
  }

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  const orderList = orders ?? [];

  const { data: allItems } =
    orderList.length > 0
      ? await supabase
          .from("order_items")
          .select("*")
          .in(
            "order_id",
            orderList.map((o) => o.id)
          )
      : { data: [] };

  const itemsByOrder = new Map<string, OrderItem[]>();
  for (const item of allItems ?? []) {
    const list = itemsByOrder.get(item.order_id) ?? [];
    list.push(item);
    itemsByOrder.set(item.order_id, list);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Your orders</h1>

      {orderList.length === 0 ? (
        <p className="mt-4 text-zinc-500">You have not placed any orders yet.</p>
      ) : (
        <div className="mt-6 space-y-6">
          {orderList.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-zinc-200 p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 pb-3">
                <div>
                  <p className="font-mono text-sm font-medium text-zinc-800">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-sm text-zinc-500">
                    {new Date(order.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCents(order.total_cents)}</p>
                  <p className="text-sm capitalize text-zinc-500">
                    {order.status}
                  </p>
                </div>
              </div>

              <ul className="mt-3 space-y-1 text-sm">
                {(itemsByOrder.get(order.id) ?? []).map((item) => (
                  <li key={item.id} className="flex justify-between">
                    <span>
                      {item.product_name}{" "}
                      <span className="text-zinc-500">x{item.quantity}</span>
                    </span>
                    <span>{formatCents(item.unit_price_cents * item.quantity)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
