"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/cart-context";
import { PhoneGlyph } from "@/components/PhoneGlyph";
import { formatCents } from "@/lib/format";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      priceCents: product.price_cents,
      imageUrl: product.image_url,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-shadow hover:shadow-md">
      <Link
        href={`/products/${product.id}`}
        className="relative block aspect-square overflow-hidden bg-zinc-100"
      >
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-300">
            <PhoneGlyph className="h-16 w-16" />
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">
          {product.category}
        </p>
        <Link
          href={`/products/${product.id}`}
          className="mt-1 line-clamp-2 font-medium text-zinc-900 hover:underline"
        >
          {product.name}
        </Link>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="font-semibold">{formatCents(product.price_cents)}</span>
          <button
            onClick={handleAdd}
            className="rounded-full bg-indigo-600 px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            {added ? "Added" : "Add to cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
