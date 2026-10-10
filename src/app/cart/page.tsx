"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart-context";
import { PhoneGlyph } from "@/components/PhoneGlyph";
import { formatCents } from "@/lib/format";

export default function CartPage() {
  const { items, removeItem, setQuantity, subtotalCents } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-semibold">Your cart is empty</h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          Add a few accessories to get started.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex h-11 items-center rounded-full bg-indigo-600 px-6 font-medium text-white hover:bg-indigo-700"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Your cart</h1>

      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <div
            key={item.productId}
            className="flex items-center gap-4 rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800"
          >
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-zinc-300 dark:text-zinc-700">
                  <PhoneGlyph className="h-6 w-6" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <Link
                href={`/products/${item.productId}`}
                className="block truncate font-medium hover:underline"
              >
                {item.name}
              </Link>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {formatCents(item.priceCents)} each
              </p>
            </div>

            <div className="flex items-center rounded-full border border-zinc-300 dark:border-zinc-700">
              <button
                onClick={() => setQuantity(item.productId, item.quantity - 1)}
                className="h-8 w-8 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="w-8 text-center text-sm font-medium">
                {item.quantity}
              </span>
              <button
                onClick={() => setQuantity(item.productId, item.quantity + 1)}
                className="h-8 w-8 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <div className="w-20 text-right font-medium">
              {formatCents(item.priceCents * item.quantity)}
            </div>

            <button
              onClick={() => removeItem(item.productId)}
              className="text-sm text-zinc-400 hover:text-red-600 dark:text-zinc-500"
              aria-label="Remove item"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-end gap-4">
        <div className="text-right">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Subtotal</p>
          <p className="text-2xl font-semibold">{formatCents(subtotalCents)}</p>
        </div>
        <Link
          href="/checkout"
          className="inline-flex h-12 items-center rounded-full bg-indigo-600 px-8 font-medium text-white hover:bg-indigo-700"
        >
          Proceed to checkout
        </Link>
      </div>
    </div>
  );
}
