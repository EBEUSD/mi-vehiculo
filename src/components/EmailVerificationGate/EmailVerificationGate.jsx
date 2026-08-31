import { useState } from "react";
import { Mail, RefreshCw, CheckCircle } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

export default function EmailVerificationGate({ children }) {
  const { user, refreshUser } = useAuth();
  const [resent, setResent]   = useState(false);
  const [checking, setChecking] = useState(false);

  if (!user || user.emailConfirmed) return children;

  const handleResend = async () => {
    await supabase.auth.resend({ type: "signup", email: user.email });
    setResent(true);
  };

  const handleCheck = async () => {
    setChecking(true);
    await refreshUser();
    setChecking(false);
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center",
      minHeight: "calc(100vh - 64px)",
      padding: "2rem", textAlign: "center", gap: "1rem",
      background: "var(--bg, #f9fafb)",
    }}>
      <div style={{
        background: "#eff6ff", borderRadius: "50%", width: 80, height: 80,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Mail size={36} color="#3b82f6" />
      </div>

      <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700, color: "#111827" }}>
        Confirmá tu email para publicar
      </h2>
      <p style={{ margin: 0, color: "#6b7280", maxWidth: 420, lineHeight: 1.6 }}>
        Enviamos un link de confirmación a <strong>{user.email}</strong>.
        Hacé clic en el enlace del email para activar tu cuenta y poder publicar.
      </p>

      {resent && (
        <p style={{ color: "#16a34a", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
          <CheckCircle size={16} /> Email reenviado. Revisá tu bandeja (y el spam).
        </p>
      )}

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={handleCheck}
          disabled={checking}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "0.6rem 1.25rem", background: "#2563eb", color: "#fff",
            border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: "0.9rem",
          }}
        >
          <RefreshCw size={15} className={checking ? "spin" : ""} />
          {checking ? "Verificando…" : "Ya confirmé mi email"}
        </button>

        {!resent && (
          <button
            onClick={handleResend}
            style={{
              padding: "0.6rem 1.25rem", background: "transparent", color: "#2563eb",
              border: "1.5px solid #2563eb", borderRadius: 8, fontWeight: 600,
              cursor: "pointer", fontSize: "0.9rem",
            }}
          >
            Reenviar email
          </button>
        )}
      </div>
    </div>
  );
}
