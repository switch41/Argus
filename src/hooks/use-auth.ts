import { useSupabase } from "@/components/auth/SupabaseProvider";
import { useEffect, useState } from "react";

export function useAuth() {
  const { supabase, user: supabaseUser, isLoading: isAuthLoading, session } = useSupabase();
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    async function fetchUserData() {
      if (supabaseUser) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', supabaseUser.id)
          .maybeSingle();

        if (!error && data) {
          setUserData(data);
        } else {
          const fallbackUser = {
            id: supabaseUser.id,
            email: supabaseUser.email ?? null,
            name:
              (supabaseUser.user_metadata?.name as string | undefined) ??
              (supabaseUser.email ? supabaseUser.email.split("@")[0] : "User"),
            role: "tourist",
          };
          setUserData(fallbackUser);

          // Best-effort bootstrap so role-based pages can query profiles safely.
          await supabase.from("profiles").upsert(
            {
              id: supabaseUser.id,
              email: supabaseUser.email ?? null,
              name: fallbackUser.name,
              role: "tourist",
            },
            { onConflict: "id" }
          );
        }
      } else {
        setUserData(null);
      }
      if (!isAuthLoading) {
        setIsLoading(false);
      }
    }
    fetchUserData();
  }, [isAuthLoading, supabaseUser, supabase]);

  const signIn = async (type: "email-otp" | "anonymous" | "password", options: any = {}) => {
    if (type === "email-otp") {
      if (options instanceof FormData) {
        const email = options.get("email") as string;
        const code = options.get("code") as string;
        if (code) {
          const { data, error } = await supabase.auth.verifyOtp({ email, token: code, type: "email" });
          if (error) throw error;
          return data;
        } else {
          const { data, error } = await supabase.auth.signInWithOtp({
            email,
            options: {
              shouldCreateUser: true,
            },
          });
          if (error) throw error;
          return data;
        }
      }
      const { data, error } = await supabase.auth.verifyOtp({
        email: options.email,
        token: options.code,
        type: "email",
      });
      if (error) throw error;
      return data;
    }

    if (type === "anonymous") {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      return data;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: options.email,
      password: options.password,
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    return await supabase.auth.signOut();
  };

  const isAnonymous =
    !!supabaseUser?.is_anonymous || supabaseUser?.app_metadata?.provider === "anonymous";

  return {
    isLoading: isLoading || isAuthLoading,
    isAuthenticated: !!session,
    isAnonymous,
    user: userData ? { ...userData, _id: userData.id } : null,
    signIn,
    signOut,
  };
}
