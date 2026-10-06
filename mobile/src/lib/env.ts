const env = process.env as Record<string, string | undefined>;

export const SUPABASE_URL = env.EXPO_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const SITE_URL =
  env.EXPO_PUBLIC_SITE_URL ?? "http://localhost:3000";

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}
