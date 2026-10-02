import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductPurchase } from "@/components/ProductPurchase";
import { PhoneGlyph } from "@/components/PhoneGlyph";
import { formatCents } from "@/lib/format";
import { isSupabaseConfigured } from "@/lib/config";
import { demoProducts } from "@/lib/demo-products";
import type { Product } from "@/lib/types";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let product: Product | null = null;

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();
    product = data ?? null;
  } else {
    product = demoProducts.find((p) => p.id === id) ?? null;
  }

  if (!product) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link
        href="/"
        className="text-sm font-medium text-indigo-600 hover:underline"
      >
        &larr; Back to shop
      </Link>

      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-zinc-300">
              <PhoneGlyph className="h-24 w-24" />
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <p className="text-sm font-medium uppercase tracking-wide text-indigo-600">
            {product.category}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            {product.name}
          </h1>
          <p className="mt-4 text-2xl font-semibold">
            {formatCents(product.price_cents)}
          </p>
          <p className="mt-4 leading-relaxed text-zinc-600">
            {product.description ?? "No description provided."}
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </p>

          <div className="mt-8">
            <ProductPurchase product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
