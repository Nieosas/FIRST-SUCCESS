"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart-context";
import { PhoneGlyph } from "@/components/PhoneGlyph";
import { createClient } from "@/lib/supabase/client";
import { formatCents } from "@/lib/format";
import { isSupabaseConfigured } from "@/lib/config";

const FREE_SHIPPING_THRESHOLD = 5000;
const SHIPPING_CENTS = 599;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotalCents, clear } = useCart();

  const [form, setForm] = useState({
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

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        setForm((f) => ({ ...f, email: data.user.email! }));
      }
    });
  }, []);

  const shippingCents =
    subtotalCents >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_CENTS;
  const totalCents = subtotalCents + shippingCents;

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Checkout failed");
      }

      clear();
      router.push(
        `/checkout/success?order_id=${encodeURIComponent(
          data.orderId
        )}&email=${encodeURIComponent(form.email)}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-semibold">Nothing to check out</h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">Your cart is empty.</p>
        <Link
          href="/shop"
          className="mt-6 inline-flex h-11 items-center rounded-full bg-indigo-600 px-6 font-medium text-white hover:bg-indigo-700"
        >
          Browse products
        </Link>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Checkout</h1>

      <form
        onSubmit={handleSubmit}
        className="mt-6 grid gap-10 lg:grid-cols-[1fr_360px]"
      >
        <div className="space-y-6">
          <section>
            <h2 className="font-semibold">Contact</h2>
            <div className="mt-3 grid gap-3">
              <input
                required
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className={inputClass}
              />
            </div>
          </section>

          <section>
            <h2 className="font-semibold">Shipping address</h2>
            <div className="mt-3 grid gap-3">
              <input
                required
                placeholder="Full name"
                value={form.customerName}
                onChange={(e) => update("customerName", e.target.value)}
                className={inputClass}
              />
              <input
                required
                placeholder="Address line 1"
                value={form.addressLine1}
                onChange={(e) => update("addressLine1", e.target.value)}
                className={inputClass}
              />
              <input
                placeholder="Address line 2 (optional)"
                value={form.addressLine2}
                onChange={(e) => update("addressLine2", e.target.value)}
                className={inputClass}
              />
              <div className="grid gap-3 sm:grid-cols-3">
                <input
                  required
                  placeholder="City"
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  className={inputClass}
                />
                <input
                  placeholder="State"
                  value={form.state}
                  onChange={(e) => update("state", e.target.value)}
                  className={inputClass}
                />
                <input
                  placeholder="ZIP / Postal code"
                  value={form.postalCode}
                  onChange={(e) => update("postalCode", e.target.value)}
                  className={inputClass}
                />
              </div>
              <input
                required
                placeholder="Country"
                value={form.country}
                onChange={(e) => update("country", e.target.value)}
                className={inputClass}
              />
            </div>
          </section>

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
              {error}
            </p>
          )}
        </div>

        <aside className="h-fit rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
          <h2 className="font-semibold">Order summary</h2>
          <ul className="mt-4 space-y-3">
            {items.map((item) => (
              <li key={item.productId} className="flex items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-zinc-300 dark:text-zinc-700">
                      <PhoneGlyph className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="truncate">{item.name}</p>
                  <p className="text-zinc-500 dark:text-zinc-400">x{item.quantity}</p>
                </div>
                <span className="text-sm font-medium">
                  {formatCents(item.priceCents * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-4 space-y-2 border-t border-zinc-200 pt-4 text-sm dark:border-zinc-800">
            <div className="flex justify-between">
              <span className="text-zinc-500 dark:text-zinc-400">Subtotal</span>
              <span>{formatCents(subtotalCents)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500 dark:text-zinc-400">Shipping</span>
              <span>
                {shippingCents === 0 ? "Free" : formatCents(shippingCents)}
              </span>
            </div>
            <div className="flex justify-between border-t border-zinc-200 pt-2 text-base font-semibold dark:border-zinc-800">
              <span>Total</span>
              <span>{formatCents(totalCents)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 h-12 w-full rounded-full bg-indigo-600 font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
          >
            {submitting ? "Placing order…" : "Place order"}
          </button>
          <p className="mt-3 text-center text-xs text-zinc-400 dark:text-zinc-500">
            Demo checkout — no real payment is processed.
          </p>
        </aside>
      </form>
    </div>
  );
}
