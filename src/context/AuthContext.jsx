import { createContext, useContext, useEffect, useState } from "react";
import { api, setTokens, clearTokens, getAccessToken } from "../lib/api";

const AuthContext = createContext(null);

// Normalize backend user shape to match what the rest of the app expects
const normalize = (u) => ({
  id:            u.id,
  email:         u.email,
  role:          u.role,
  user_metadata: { full_name: u.fullName, phone: u.phone || null },
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

  // Restore session from localStorage on mount
  useEffect(() => {
    const token = getAccessToken();
    const stored = localStorage.getItem("mv_user");
    if (token && stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
    setLoading(false);
  }, []);

  const persistUser = (u) => {
    setUser(u);
    if (u) localStorage.setItem("mv_user", JSON.stringify(u));
    else    localStorage.removeItem("mv_user");
  };

  const signIn = async (email, password) => {
    // Mock shortcuts (dev / demo) — match by key ("vendedor") OR by stored email
    const mock = MOCKS[email] || Object.values(MOCKS).find((m) => m.user.email === email);
    if (mock && mock.cred.password === password) {
      persistUser(mock.user);
      return { data: { user: mock.user }, error: null };
    }

    try {
      const res  = await api.post("/auth/login", { email, password });
      const data = res.data;
      setTokens(data.accessToken, data.refreshToken);
      const u = normalize(data.user);
      persistUser(u);
      return { data: { user: u }, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  };

  const signUp = async (email, password, metadata = {}) => {
    try {
      const res = await api.post("/auth/register", {
        email,
        password,
        fullName: metadata.full_name || "",
        phone:    metadata.phone     || "",
      });
      return { data: res.data, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  };

  const signOut = async () => {
    // Mock users — just clear local state
    if (user?.id?.startsWith("mock-")) {
      persistUser(null);
      return { error: null };
    }
    try {
      await api.post("/auth/logout");
    } catch {}
    clearTokens();
    persistUser(null);
    return { error: null };
  };

  // Backend doesn't expose a password-reset endpoint yet — stub returns success so the UI flow works
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
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, resetPassword, refreshSession }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
