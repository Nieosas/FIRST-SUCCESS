import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function WelcomePage() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      redirect("/shop");
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
        Welcome to PhoneDeck
      </p>
      <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
        Gear up your phone.
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-600">
        Create a free account to sync your cart across devices, track your
        orders and keep your profile in one place.
      </p>

      <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href="/signup"
          className="inline-flex h-12 items-center justify-center rounded-full bg-indigo-600 px-8 font-medium text-white hover:bg-indigo-700"
        >
          Create your account
        </Link>
        <Link
          href="/login"
          className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-300 px-8 font-medium text-zinc-800 hover:bg-zinc-50"
        >
          Sign in
        </Link>
      </div>

      <p className="mt-10 text-sm text-zinc-500">
        <Link href="/shop" className="font-medium text-indigo-600 hover:underline">
          Browse the shop without an account
        </Link>
      </p>
    </div>
  );
}
