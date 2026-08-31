import { createContext, useContext, useEffect, useState } from "react";
import { api, setTokens, clearTokens, getAccessToken } from "../lib/api";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

const normalize = (u) => ({
  id:            u.id,
  email:         u.email,
  role:          u.role,
  user_metadata: { full_name: u.fullName, phone: u.phone || null },
});

const normalizeSupabase = (u) => ({
  id:             u.id,
  email:          u.email,
  role:           u.user_metadata?.role || u.app_metadata?.role || "SELLER",
  emailConfirmed: !!u.email_confirmed_at,
  user_metadata:  {
    full_name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split("@")[0] || "",
    phone:     u.user_metadata?.phone || null,
    dui:       u.user_metadata?.dui   || null,
  },
});

// Mock users for offline/demo — never hit the backend
const MOCKS = {
  admin: {
    cred: { password: "12345678" },
    user: { id: "mock-admin-001", email: "admin", role: "ADMIN",
            user_metadata: { full_name: "Admin Demo", phone: "+503 7100-1234" } },
  },
  vendedor: {
    cred: { password: "123456" },
    user: { id: "mock-vendedor-001", email: "vendedor@test.com", role: "SELLER",
            user_metadata: { full_name: "Carlos Mendoza", phone: "+503 7200-8891" } },
  },
  usuario: {
    cred: { password: "123456" },
    user: { id: "mock-usuario-001", email: "usuario@test.com", role: "USER",
            user_metadata: { full_name: "Laura Gómez", phone: "+503 7300-5432" } },
  },
};

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  const persistUser = (u) => {
    setUser(u);
    if (u) localStorage.setItem("mv_user", JSON.stringify(u));
    else    localStorage.removeItem("mv_user");
  };

  // Restore session on mount
  useEffect(() => {
    const token  = getAccessToken();
    const stored = localStorage.getItem("mv_user");

    if (token && stored) {
      // Existing backend/mock session — restore and skip Supabase check
      try { setUser(JSON.parse(stored)); } catch {}
      setLoading(false);
      return;
    }

    // No backend session: check for a pending Supabase OAuth session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setTokens(session.access_token, session.refresh_token);
        persistUser(normalizeSupabase(session.user));
      }
    }).finally(() => setLoading(false));
  }, []);

  // Listen for Supabase auth state changes (OAuth callback fires here)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session && !getAccessToken()) {
        setTokens(session.access_token, session.refresh_token);
        persistUser(normalizeSupabase(session.user));
      }
      if (event === "TOKEN_REFRESHED" && session) {
        setTokens(session.access_token, session.refresh_token);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    // Mock shortcuts
    const mock = MOCKS[email] || Object.values(MOCKS).find((m) => m.user.email === email);
    if (mock && mock.cred.password === password) {
      persistUser(mock.user);
      return { data: { user: mock.user }, error: null };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // Verificar si la cuenta está bloqueada
      const { data: profile } = await supabase
        .from("profiles")
        .select("blocked")
        .eq("id", data.user.id)
        .single();
      if (profile?.blocked) {
        await supabase.auth.signOut();
        throw new Error("Tu cuenta fue suspendida. Contactá al soporte para más información.");
      }

      setTokens(data.session.access_token, data.session.refresh_token);
      const u = normalizeSupabase(data.user);
      persistUser(u);
      return { data: { user: u }, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/vendedor`,
      },
    });
    return { error };
  };

  const signUp = async (email, password, metadata = {}) => {
    try {
      await api.post("/auth/register", {
        email,
        password,
        fullName: metadata.full_name || "",
        phone:    metadata.phone     || "",
      });

      // Intentar login inmediato — funciona cuando la confirmación de email
      // está desactivada o el backend auto-confirmó en modo development.
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (!loginError && loginData?.session) {
        setTokens(loginData.session.access_token, loginData.session.refresh_token);
        const u = normalizeSupabase(loginData.user);
        persistUser(u);
        return { data: { user: u, session: loginData.session }, error: null };
      }

      // Email confirmation required (prod) — mostrar pantalla de confirmación
      return { data: { user: null, session: null }, error: null };
    } catch (err) {
      return { data: null, error: { message: err.message } };
    }
  };

  const signOut = async () => {
    if (user?.id?.startsWith("mock-")) {
      persistUser(null);
      return { error: null };
    }
    try { await api.post("/auth/logout"); } catch {}
    await supabase.auth.signOut().catch(() => {});
    clearTokens();
    persistUser(null);
    return { error: null };
  };

  const refreshUser = async () => {
    const { data: { user: u } } = await supabase.auth.getUser();
    if (u) persistUser(normalizeSupabase(u));
  };

  const resetPassword = async (_email) => ({ error: null });

  const refreshSession = async () => {
    const refresh = localStorage.getItem("mv_refresh");
    if (!refresh) return;
    try {
      const res  = await api.post("/auth/refresh", { refreshToken: refresh });
      const data = res.data;
      setTokens(data.accessToken, data.refreshToken);
    } catch {
      clearTokens();
      persistUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signInWithGoogle, signUp, signOut, resetPassword, refreshSession, refreshUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
