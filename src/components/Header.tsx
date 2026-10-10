"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { useCart } from "@/components/cart-context";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/config";

export function Header() {
  const { totalCount } = useCart();
  const configured = isSupabaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(configured);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!configured) return;
    const supabase = createClient();
    supabase.auth
      .getUser()
      .then(({ data }) => setUser(data.user ?? null))
      .finally(() => setLoading(false));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => sub.subscription.unsubscribe();
  }, [configured]);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Phone<span className="text-indigo-600">Deck</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-zinc-600 sm:flex">
          <Link href="/" className="hover:text-zinc-900">
            Shop
          </Link>
          <Link href="/orders" className="hover:text-zinc-900">
            Orders
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/cart"
            className="relative rounded-full p-2 text-zinc-700 hover:bg-zinc-100"
            aria-label="Cart"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {totalCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
                {totalCount}
              </span>
            )}
          </Link>

          {!configured ? (
            <span className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-500">
              Demo mode
            </span>
          ) : loading ? (
            <span className="h-9 w-9 rounded-full bg-zinc-200" />
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white"
              >
                {user.user_metadata?.name?.[0] ?? user.email?.[0] ?? "U"}
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg border border-zinc-200 bg-white p-1 shadow-lg">
                  <div className="truncate px-3 py-2 text-sm text-zinc-500">
                    {user.email}
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/orders"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
                  >
                    My orders
                  </Link>
                  <Link
                    href="/logout"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-md px-3 py-2 text-sm text-red-600 hover:bg-zinc-100"
                  >
                    Sign out
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
            >
              <GoogleIcon />
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
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
