import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, setTokens, clearTokens, getAccessToken } from "../lib/api";
import { supabase } from "../lib/supabase";
import { apiErrorMessage, errorCode } from "../lib/publishing";
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

// Campos de identidad de GET/PATCH /profile ↔ claves que usa la app en user_metadata
const PROFILE_FIELDS = {
  accountType: "account_type", documentType: "document_type", documentNumber: "document_number",
  dui: "dui", nit: "nit", nrc: "nrc",
  companyName: "company_name", companyAddress: "company_address", companyPhone: "company_phone",
};

// Datos de la app → body de PATCH /profile (role, verified y blocked nunca se envían)
const toProfilePatch = (meta) => {
  const body = {};
  if (meta.full_name) body.fullName = meta.full_name;
  if (meta.phone) body.phone = meta.phone;
  Object.entries(PROFILE_FIELDS).forEach(([key, metaKey]) => {
    if (meta[metaKey] !== undefined) body[key] = meta[metaKey];
  });
  return body;
};

// Rol, teléfono, identidad y verificación viven en la base (profiles) y los expone
// el backend. user_metadata de Supabase lo edita el propio usuario: solo es respaldo.
// Una cuenta bloqueada recibe 403 en todo endpoint autenticado.
const fetchProfile = async () => {
  try { return { profile: (await api.get("/profile"))?.data || null, blocked: false }; }
  catch (err) { return { profile: null, blocked: err?.status === 403 }; }
};

const withProfile = (u, p) => {
  if (!p) return u;
  const meta = {
    ...u.user_metadata,
    full_name: p.fullName || u.user_metadata.full_name,
    phone:     u.user_metadata.phone || p.phone || null,
  };
  Object.entries(PROFILE_FIELDS).forEach(([key, metaKey]) => {
    if (p[key]) meta[metaKey] = p[key];
  });
  return { ...u, ...(p.role ? { role: p.role } : {}), verified: !!p.verified, user_metadata: meta };
};

// Cuentas viejas: la identidad quedó en user_metadata. Se copia una vez al perfil.
const migrateIdentity = async (u, p) => {
  const meta = u.user_metadata || {};
  if (!p || p.accountType || p.verified || !meta.account_type) return p;
  const { fullName: _fn, phone: _ph, ...identity } = toProfilePatch(meta);
  try { return (await api.patch("/profile", identity))?.data || { ...p, ...identity }; }
  catch { return p; }
};

const resolveRole = async (u) => {
  const { profile } = await fetchProfile();
  return withProfile(u, await migrateIdentity(u, profile));
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

// Datos extra del registro (tipo de cuenta, documento, NIT) que /auth/register
// no recibe: se guardan con PATCH /profile apenas hay sesión.
const PENDING_META_KEY = (email) => `mv_pending_meta_${(email || "").toLowerCase()}`;

const applyPendingMetadata = async (email) => {
  try {
    const raw = localStorage.getItem(PENDING_META_KEY(email));
    if (!raw) return;
    await api.patch("/profile", toProfilePatch(JSON.parse(raw)));
    localStorage.removeItem(PENDING_META_KEY(email));
  } catch { /* se reintenta en el próximo login */ }
};

// Sesión de Supabase recién iniciada: rechaza cuentas bloqueadas y arma el usuario
const startSession = async (session) => {
  setTokens(session.access_token, session.refresh_token);
  const { blocked } = await fetchProfile();
  if (blocked) {
    clearTokens();
    await supabase.auth.signOut().catch(() => {});
    return null;
  }
  await applyPendingMetadata(session.user.email);
  return resolveRole(normalizeSupabase(session.user));
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
            const u = session ? await startSession(session) : null;
            if (u) {
              persistUser(u);
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
      const u = await startSession(session);
      if (u) persistUser(u);
    }).finally(() => setLoading(false));
  }, []);

  // Listen for Supabase auth state changes (OAuth callback fires here)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session && !getAccessToken()) {
        // Login con Google/Apple: mismo chequeo de bloqueo que con contraseña
        (async () => {
          const u = await startSession(session);
          if (u) persistUser(u);
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

      const u = await startSession(data.session);
      if (!u) return { data: null, error: BLOCKED_ERROR };
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
        const u = await startSession(loginData.session);
        if (!u) return { data: null, error: BLOCKED_ERROR };
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

  // Guarda datos de la cuenta (nombre, teléfono, tipo, documento, empresa) con PATCH /profile.
  // Con la cuenta verificada la identidad queda bloqueada (409 IDENTITY_LOCKED).
  const updateProfile = async (meta) => {
    if (user?.id?.startsWith("mock-")) {
      persistUser({ ...user, user_metadata: { ...user.user_metadata, ...meta } });
      return { error: null };
    }
    try {
      const res  = await api.patch("/profile", toProfilePatch(meta));
      const base = meta.phone ? { ...user, user_metadata: { ...user.user_metadata, phone: meta.phone } } : user;
      persistUser(res?.data ? withProfile(base, res.data) : await resolveRole(base));
      return { error: null };
    } catch (err) {
      return { error: { message: apiErrorMessage(err, "No se pudieron guardar los datos."), code: errorCode(err) } };
    }
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
