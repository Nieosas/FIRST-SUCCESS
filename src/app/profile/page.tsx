import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-semibold">Your profile</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Profiles and Google sign-in require Supabase. Add your keys in{" "}
          <code className="font-mono">.env.local</code> and run{" "}
          <code className="font-mono">supabase/schema.sql</code>.
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

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const name =
    user.user_metadata?.full_name ?? user.user_metadata?.name ?? null;
  const avatarUrl =
    typeof user.user_metadata?.avatar_url === "string"
      ? user.user_metadata.avatar_url
      : null;
  const provider =
    typeof user.app_metadata?.provider === "string"
      ? user.app_metadata.provider
      : null;
  const initial = (name ?? user.email ?? "U").charAt(0).toUpperCase();
  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Your profile</h1>

      <div className="mt-6 rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={name ?? "Profile picture"}
              width={64}
              height={64}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600 text-xl font-semibold text-white">
              {initial}
            </div>
          )}

          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {name ?? "No name provided"}
            </p>
            <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">{user.email}</p>
          </div>
        </div>

        <dl className="mt-6 space-y-3 border-t border-zinc-200 pt-5 text-sm dark:border-zinc-800">
          {name && (
            <div className="flex justify-between">
              <dt className="text-zinc-500 dark:text-zinc-400">Name</dt>
              <dd className="font-medium text-zinc-900 dark:text-zinc-100">{name}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-zinc-500 dark:text-zinc-400">Email</dt>
            <dd className="font-medium text-zinc-900 dark:text-zinc-100">{user.email}</dd>
          </div>
          {provider && (
            <div className="flex justify-between">
              <dt className="text-zinc-500 dark:text-zinc-400">Sign-in method</dt>
              <dd className="font-medium capitalize text-zinc-900 dark:text-zinc-100">
                {provider}
              </dd>
            </div>
          )}
          {memberSince && (
            <div className="flex justify-between">
              <dt className="text-zinc-500 dark:text-zinc-400">Member since</dt>
              <dd className="font-medium text-zinc-900 dark:text-zinc-100">{memberSince}</dd>
            </div>
          )}
        </dl>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/profile/edit"
            className="inline-flex h-11 items-center justify-center rounded-full bg-indigo-600 px-6 font-medium text-white hover:bg-indigo-700"
          >
            Edit profile
          </Link>
          <Link
            href="/orders"
            className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-300 px-6 font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            My orders
          </Link>
          <Link
            href="/logout"
            className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-300 px-6 font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Sign out
          </Link>
        </div>
      </div>
    </div>
  );
}
