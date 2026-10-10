"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { GoogleIcon } from "@/components/icons";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/config";

const inputClass =
  "w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

export default function SignupPage() {
  const router = useRouter();
  const configured = isSupabaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(configured);
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

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

  async function signUpWithGoogle() {
    setBusy(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/shop`,
        },
      });
      if (error) setError(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function signUpWithEmail(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNeedsConfirmation(false);
    setBusy(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/shop`,
        },
      });
      if (error) {
        setError(error.message);
        return;
      }
      if (data.session) {
        router.push("/shop");
        router.refresh();
      } else {
        setNeedsConfirmation(true);
      }
    } finally {
      setBusy(false);
    }
  }

  if (!configured) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-semibold">Create an account</h1>
        <p className="mt-2 text-zinc-600">
          Sign-up requires Supabase. Add your keys in{" "}
          <code className="font-mono">.env.local</code> and run{" "}
          <code className="font-mono">supabase/schema.sql</code>.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-indigo-600 px-6 font-medium text-white hover:bg-indigo-700"
        >
          Continue without an account
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
            href="/shop"
            className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-300 px-6 font-medium text-zinc-800 hover:bg-zinc-50"
          >
            Back to shop
          </Link>
        </div>
      </div>
    );
  }

  if (needsConfirmation) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-semibold">Check your email</h1>
        <p className="mt-2 text-zinc-600">
          We sent a confirmation link to{" "}
          <span className="font-medium text-zinc-900">{email}</span>. Click it to
          activate your account.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-indigo-600 px-6 font-medium text-white hover:bg-indigo-700"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-24 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
      <p className="mt-2 text-zinc-600">
        Sign up to sync your cart across devices, track orders and manage your
        profile.
      </p>

      <div className="mt-8 rounded-2xl border border-zinc-200 p-6">
        <button
          onClick={signUpWithGoogle}
          disabled={busy}
          className="flex h-12 w-full items-center justify-center gap-3 rounded-full border border-zinc-300 text-sm font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-60"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <div className="my-4 flex items-center gap-3 text-xs text-zinc-400">
          <span className="h-px flex-1 bg-zinc-200" />
          or sign up with email
          <span className="h-px flex-1 bg-zinc-200" />
        </div>

        <form onSubmit={signUpWithEmail} className="space-y-3">
          <input
            required
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
          <input
            required
            type="password"
            minLength={6}
            placeholder="Password (min. 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="h-12 w-full rounded-full bg-indigo-600 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {busy ? "Creating account…" : "Create account"}
          </button>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-zinc-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-indigo-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
