"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/config";

export default function LoginPage() {
  const configured = isSupabaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(configured);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!configured) {
      setChecking(false);
      return;
    }
    const supabase = createClient();
    supabase.auth
      .getUser()
      .then(({ data }) => setUser(data.user ?? null))
      .finally(() => setChecking(false));
  }, [configured]);

  async function signInWithGoogle() {
    setBusy(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/profile`,
        },
      });
      if (error) console.error(error);
    } finally {
      setBusy(false);
    }
  }

  if (!configured) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="mt-2 text-zinc-600">
          Google sign-in requires Supabase. Add your keys in{" "}
          <code className="font-mono">.env.local</code> and run{" "}
          <code className="font-mono">supabase/schema.sql</code>.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-indigo-600 px-6 font-medium text-white hover:bg-indigo-700"
        >
          Back to shop
        </Link>
      </div>
    );
  }

  if (checking) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center sm:px-6">
        <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-indigo-600" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-semibold">You are already signed in</h1>
        <p className="mt-2 text-zinc-600">{user.email}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/profile"
            className="inline-flex h-11 items-center justify-center rounded-full bg-indigo-600 px-6 font-medium text-white hover:bg-indigo-700"
          >
            View profile
          </Link>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-300 px-6 font-medium text-zinc-800 hover:bg-zinc-50"
          >
            Back to shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-24 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
      <p className="mt-2 text-zinc-600">
        Sign in to sync your cart, track orders and manage your profile.
      </p>

      <div className="mt-8 rounded-2xl border border-zinc-200 p-6">
        <button
          onClick={signInWithGoogle}
          disabled={busy}
          className="flex h-12 w-full items-center justify-center gap-3 rounded-full border border-zinc-300 text-sm font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-60"
        >
          <GoogleIcon />
          {busy ? "Redirecting…" : "Continue with Google"}
        </button>
        <p className="mt-4 text-center text-xs text-zinc-400">
          By signing in you agree to our demo terms.
        </p>
      </div>

      <p className="mt-6 text-center text-sm text-zinc-500">
        <Link href="/" className="font-medium text-indigo-600 hover:underline">
          Continue browsing without an account
        </Link>
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52Z"
      />
    </svg>
  );
}
