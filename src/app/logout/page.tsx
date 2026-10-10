"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/config";

export default function LogoutPage() {
  const configured = isSupabaseConfigured();
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!configured) {
      setDone(true);
      return;
    }
    const supabase = createClient();
    supabase.auth
      .signOut()
      .catch(() => {})
      .finally(() => setDone(true));
  }, [configured]);

  if (!configured) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-semibold">Sign out</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Sign-in is handled by Supabase. Add your keys in{" "}
          <code className="font-mono">.env.local</code> to enable it.
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

  if (!done) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center sm:px-6">
        <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-indigo-600 dark:border-zinc-700" />
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">Signing you out…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        You have been signed out
      </h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">Thanks for visiting PhoneDeck.</p>
      <div className="mt-6 flex justify-center gap-3">
        <Link
          href="/login"
          className="inline-flex h-11 items-center justify-center rounded-full bg-indigo-600 px-6 font-medium text-white hover:bg-indigo-700"
        >
          Sign in again
        </Link>
        <Link
          href="/shop"
          className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-300 px-6 font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          Back to shop
        </Link>
      </div>
    </div>
  );
}
