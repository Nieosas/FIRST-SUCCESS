import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/ProductCard";
import { isSupabaseConfigured } from "@/lib/config";
import { demoProducts } from "@/lib/demo-products";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  let products: Product[] = [];

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    products = data ?? [];
  } else {
    products = demoProducts;
  }

  return (
    <div>
      {!isSupabaseConfigured() && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-800">
          Demo mode — running on sample data. Add your Supabase keys in{" "}
          <code className="font-mono">.env.local</code> to enable the database,
          Google sign-in, and order emails.
        </div>
      )}
      <section className="border-b border-zinc-200 bg-zinc-50">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            Gear up your phone.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-zinc-600">
            Cases, screen protectors, chargers, cables and more. Pick what you
            need and check out in seconds.
          </p>
          <a
            href="#catalog"
            className="mt-8 inline-flex h-12 items-center rounded-full bg-indigo-600 px-6 font-medium text-white transition-colors hover:bg-indigo-700"
          >
            Shop now
          </a>
        </div>
      </section>

      <section id="catalog" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="text-2xl font-semibold tracking-tight">All products</h2>
        {products && products.length > 0 ? (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="mt-6 text-zinc-500">
            No products yet. Run the SQL in <code>supabase/schema.sql</code> to
            seed the catalog.
          </p>
        )}
      </section>
    </div>
  );
}
