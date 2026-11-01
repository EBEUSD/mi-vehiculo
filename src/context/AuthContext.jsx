import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, setTokens, clearTokens, getAccessToken } from "../lib/api";
import { supabase } from "../lib/supabase";
import PageLoader from "../components/PageLoader/PageLoader";

const AuthContext = createContext(null);

const normalizeSupabase = (u) => ({
  id:             u.id,
  email:          u.email,
  // Nunca leer el rol de user_metadata: el propio usuario lo puede editar.
  // app_metadata es solo un valor inicial; el definitivo viene de /profile (resolveRole).
  role:           u.app_metadata?.role || "SELLER",
  emailConfirmed: !!u.email_confirmed_at,
  user_metadata:  {
    full_name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split("@")[0] || "",
    phone:     u.user_metadata?.phone || null,
    dui:             u.user_metadata?.dui             || null,
    account_type:    u.user_metadata?.account_type    || null,
    document_type:   u.user_metadata?.document_type   || (u.user_metadata?.dui ? "DUI" : null),
    document_number: u.user_metadata?.document_number || u.user_metadata?.dui || null,
    nit:             u.user_metadata?.nit             || null,
    company_name:    u.user_metadata?.company_name    || null,
    company_address: u.user_metadata?.company_address || null,
    company_phone:   u.user_metadata?.company_phone   || null,
    nrc:             u.user_metadata?.nrc             || null,
  },
});

// El rol real vive en la base (profiles.role) y lo expone el backend.
// El teléfono del registro también: /auth/register lo guarda en el perfil, no en user_metadata.
const resolveRole = async (u) => {
  try {
    const res = await api.get("/profile");
    const role  = res?.data?.role;
    const phone = u.user_metadata?.phone || res?.data?.phone || null;
    return { ...u, ...(role ? { role } : {}), user_metadata: { ...u.user_metadata, phone } };
  } catch { return u; }
};

// Bloqueo de cuenta. El backend también debe rechazar a los bloqueados:
// este chequeo solo evita mostrar la app a una cuenta suspendida.
const isBlocked = async (userId) => {
  try {
    const { data } = await supabase.from("profiles").select("blocked").eq("id", userId).single();
    return !!data?.blocked;
  } catch { return false; }
};

const BLOCKED_ERROR = { message: "Tu cuenta fue suspendida. Contactá al soporte para más información." };

// Datos locales que no deben sobrevivir a un cierre de sesión
const clearLocalSession = () => {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith("mv_pending_meta_") || k.startsWith("miVehiculo_publicar"))
      .forEach((k) => localStorage.removeItem(k));
    sessionStorage.removeItem("mv_pending_payment");
  } catch { /* storage bloqueado */ }
  if ("caches" in window) caches.delete("api-cache").catch(() => {});
};

// Metadata extra del registro (tipo de cuenta, documento, NIT) que /auth/register
// no recibe: se guarda en user_metadata de Supabase apenas hay sesión.
const PENDING_META_KEY = (email) => `mv_pending_meta_${(email || "").toLowerCase()}`;

const applyPendingMetadata = async (email) => {
  try {
    const raw = localStorage.getItem(PENDING_META_KEY(email));
    if (!raw) return null;
    const { data, error } = await supabase.auth.updateUser({ data: JSON.parse(raw) });
    if (error) return null;
    localStorage.removeItem(PENDING_META_KEY(email));
    return data.user;
  } catch { return null; }
};

// Mock users — solo disponibles en desarrollo, excluidos del bundle de producción
const MOCKS = import.meta.env.PROD ? {} : {
  admin: {
    cred: { password: "12345678" },
    user: { id: "mock-admin-001", email: "admin", role: "ADMIN", emailConfirmed: true,
            user_metadata: { full_name: "Admin Demo", phone: "+503 7100-1234" } },
  },
  vendedor: {
    cred: { password: "123456" },
    user: { id: "mock-vendedor-001", email: "vendedor@test.com", role: "SELLER", emailConfirmed: true,
            user_metadata: { full_name: "Carlos Mendoza", phone: "+503 7200-8891", account_type: "PARTICULAR" } },
  },
  usuario: {
    cred: { password: "123456" },
    user: { id: "mock-usuario-001", email: "usuario@test.com", role: "USER", emailConfirmed: true,
            user_metadata: { full_name: "Laura Gómez", phone: "+503 7300-5432", account_type: "PARTICULAR" } },
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
      (async () => {
        try {
          const u = JSON.parse(stored);
          if (!import.meta.env.PROD && u?.id?.startsWith("mock-")) {
            setUser(u);
          } else {
            // Validate the Supabase session — catches expired tokens
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
              setTokens(session.access_token, session.refresh_token);
              persistUser(await resolveRole(normalizeSupabase(session.user)));
            } else {
              clearTokens();
              localStorage.removeItem("mv_user");
            }
          }
        } catch {
          clearTokens();
          localStorage.removeItem("mv_user");
        }
        setLoading(false);
      })();
      return;
    }

    // No backend session: check for a pending Supabase OAuth session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      if (await isBlocked(session.user.id)) {
        await supabase.auth.signOut().catch(() => {});
        return;
      }
      setTokens(session.access_token, session.refresh_token);
      const updated = await applyPendingMetadata(session.user.email);
      persistUser(await resolveRole(normalizeSupabase(updated || session.user)));
    }).finally(() => setLoading(false));
  }, []);

  // Listen for Supabase auth state changes (OAuth callback fires here)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session && !getAccessToken()) {
        // Login con Google/Apple: mismo chequeo de bloqueo que con contraseña
        (async () => {
          if (await isBlocked(session.user.id)) {
            await supabase.auth.signOut().catch(() => {});
            return;
          }
          setTokens(session.access_token, session.refresh_token);
          const updated = await applyPendingMetadata(session.user.email);
          persistUser(await resolveRole(normalizeSupabase(updated || session.user)));
        })();
      }
      if (event === "TOKEN_REFRESHED" && session) {
        setTokens(session.access_token, session.refresh_token);
      }
      // Sesión cerrada en otra pestaña o refresh vencido
      if (event === "SIGNED_OUT") {
        clearTokens();
        clearLocalSession();
        setUser((prev) => (prev?.id?.startsWith("mock-") ? prev : null));
        localStorage.removeItem("mv_user");
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    // Mock shortcuts
    const mock = import.meta.env.PROD ? null : MOCKS[email] || Object.values(MOCKS).find((m) => m.user.email === email);
    if (mock && mock.cred.password === password) {
      persistUser(mock.user);
      return { data: { user: mock.user }, error: null };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      if (await isBlocked(data.user.id)) {
        await supabase.auth.signOut();
        return { data: null, error: BLOCKED_ERROR };
      }

      setTokens(data.session.access_token, data.session.refresh_token);
      const updated = await applyPendingMetadata(email);
      const u = await resolveRole(normalizeSupabase(updated || data.user));
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
        redirectTo: `${window.location.origin}/oauth-landing`,
      },
    });
    return { error };
  };

  const signInWithApple = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: {
        redirectTo: `${window.location.origin}/oauth-landing`,
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

      const { full_name: _fn, ...extraMeta } = metadata;
      if (Object.keys(extraMeta).length) {
        localStorage.setItem(PENDING_META_KEY(email), JSON.stringify(extraMeta));
      }

      // Intentar login inmediato — funciona cuando la confirmación de email
      // está desactivada o el backend auto-confirmó en modo development.
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (!loginError && loginData?.session) {
        setTokens(loginData.session.access_token, loginData.session.refresh_token);
        const updated = await applyPendingMetadata(email);
        const u = await resolveRole(normalizeSupabase(updated || loginData.user));
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
    try { await api.post("/auth/logout"); } catch (err) { console.warn("[logout]", err?.message); }
    await supabase.auth.signOut().catch(() => {});
    clearTokens();
    clearLocalSession();
    persistUser(null);
    return { error: null };
  };

  const refreshUser = async () => {
    const { data: { user: u } } = await supabase.auth.getUser();
    if (u) persistUser(await resolveRole(normalizeSupabase(u)));
  };

  // Guarda datos de la cuenta (tipo, teléfono, documento, empresa) en user_metadata.
  // Nombre y teléfono además se sincronizan con el perfil del backend.
  const updateProfile = async (meta) => {
    if (user?.id?.startsWith("mock-")) {
      persistUser({ ...user, user_metadata: { ...user.user_metadata, ...meta } });
      return { error: null };
    }
    const { data, error } = await supabase.auth.updateUser({ data: meta });
    if (error) return { error };
    const patch = {
      ...(meta.full_name ? { fullName: meta.full_name } : {}),
      ...(meta.phone ? { phone: meta.phone } : {}),
    };
    if (Object.keys(patch).length) {
      try { await api.patch("/profile", patch); } catch (err) { console.warn("[profile]", err?.message); }
    }
    persistUser(await resolveRole(normalizeSupabase(data.user)));
    return { error: null };
  };

  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { error };
    } catch (err) {
      return { error: err };
    }
  };

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

  // Las funciones dependen solo de user (signOut) — se recalcula cuando cambia la sesión
  const value = useMemo(
    () => ({ user, loading, signIn, signInWithGoogle, signInWithApple, signUp, signOut, resetPassword, refreshSession, refreshUser, updateProfile }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {loading ? <PageLoader /> : children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
