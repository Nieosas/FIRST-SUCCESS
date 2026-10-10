"use client";

import { useState } from "react";
import { useCart } from "@/components/cart-context";
import type { Product } from "@/lib/types";

export function ProductPurchase({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem(
      {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        priceCents: product.price_cents,
        imageUrl: product.image_url,
      },
      qty
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="inline-flex items-center rounded-full border border-zinc-300 dark:border-zinc-700">
        <button
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="h-11 w-11 text-lg text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          aria-label="Decrease quantity"
        >
          -
        </button>
        <span className="w-10 text-center font-medium">{qty}</span>
        <button
          onClick={() => setQty((q) => Math.min(99, q + 1))}
          className="h-11 w-11 text-lg text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>

      <button
        onClick={handleAdd}
        disabled={product.stock <= 0}
        className="h-11 rounded-full bg-indigo-600 px-8 font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
      >
        {added ? "Added to cart" : product.stock > 0 ? "Add to cart" : "Out of stock"}
      </button>
    </div>
  );
}
