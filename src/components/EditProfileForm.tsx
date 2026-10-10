"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const inputClass =
  "w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

export function EditProfileForm({
  email,
  initialName,
  initialAvatarUrl,
}: {
  email: string;
  initialName: string;
  initialAvatarUrl: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setBusy(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: name.trim(),
          avatar_url: avatarUrl.trim(),
        },
      });
      if (error) {
        setError(error.message);
        return;
      }
      setSaved(true);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Link
        href="/profile"
        className="text-sm font-medium text-indigo-600 hover:underline"
      >
        &larr; Back to profile
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Edit profile</h1>

      <form
        onSubmit={onSubmit}
        className="mt-6 rounded-2xl border border-zinc-200 p-6"
      >
        <label className="block text-sm font-medium text-zinc-700">
          Email
          <input
            type="email"
            value={email}
            disabled
            className={`${inputClass} mt-1 bg-zinc-100 text-zinc-500`}
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-zinc-700">
          Full name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className={`${inputClass} mt-1`}
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-zinc-700">
          Avatar URL
          <input
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://…"
            className={`${inputClass} mt-1`}
          />
        </label>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        {saved && (
          <p className="mt-4 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">
            Profile updated.
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-indigo-600 px-8 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
