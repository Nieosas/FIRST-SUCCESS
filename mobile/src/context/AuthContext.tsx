import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { isSupabaseConfigured } from "../lib/env";

WebBrowser.maybeCompleteAuthSession();

const redirectTo = AuthSession.makeRedirectUri({
  scheme: "phoendeck",
  path: "auth/callback",
});

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  configured: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isSupabaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(configured);

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return;
      setUser(data.user ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;
      setUser(session?.user ?? null);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [configured]);

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });
    if (error) throw error;
    if (!data.url) throw new Error("No OAuth URL returned");

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type !== "success") return;

    const code = new URL(result.url).searchParams.get("code");
    if (code) {
      const { error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code);
      if (exchangeError) throw exchangeError;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, configured, signInWithGoogle, signOut }),
    [user, loading, configured]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
