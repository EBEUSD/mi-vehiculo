import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    if (email === "admin" && password === "12345678") {
      const mockUser = {
        id: "mock-admin-001",
        email: "admin",
        user_metadata: { full_name: "Admin Demo", phone: "+503 7100-1234" },
      };
      setUser(mockUser);
      sessionStorage.setItem("adminAuth", "true");
      return { data: { user: mockUser }, error: null };
    }
    if (email === "vendedor" && password === "123456") {
      const mockUser = {
        id: "mock-vendedor-001",
        email: "vendedor@test.com",
        user_metadata: { full_name: "Carlos Mendoza", phone: "+503 7200-8891" },
      };
      setUser(mockUser);
      return { data: { user: mockUser }, error: null };
    }
    if (email === "usuario" && password === "123456") {
      const mockUser = {
        id: "mock-usuario-001",
        email: "usuario@test.com",
        user_metadata: { full_name: "Laura Gómez", phone: "+503 7300-5432" },
      };
      setUser(mockUser);
      return { data: { user: mockUser }, error: null };
    }
    return supabase.auth.signInWithPassword({ email, password });
  };

  const signUp = (email, password, metadata = {}) =>
    supabase.auth.signUp({ email, password, options: { data: metadata } });

  const signOut = async () => {
    if (user?.id === "mock-admin-001") {
      sessionStorage.removeItem("adminAuth");
      setUser(null);
      return { error: null };
    }
    if (user?.id === "mock-vendedor-001" || user?.id === "mock-usuario-001") {
      setUser(null);
      return { error: null };
    }
    return supabase.auth.signOut();
  };

  const resetPassword = (email) =>
    supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, resetPassword }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
