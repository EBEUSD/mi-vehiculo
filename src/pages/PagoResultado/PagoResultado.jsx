import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, AlertTriangle } from "lucide-react";
import Navbar from "../../components/Navbar/Navbar";
import { api } from "../../lib/api";
import { verifyTransaction } from "../../lib/wompi";
import { useAuth } from "../../context/AuthContext";
import styles from "./PagoResultado.module.css";

const STATUS = {
  loading:    { icon: Loader2,       color: "#2563eb", spin: true,  title: "Verificando pago…",               sub: "Estamos confirmando tu transacción con WOMPI." },
  success:    { icon: CheckCircle,   color: "#059669", spin: false, title: "¡Pago exitoso!",                   sub: "Tu publicación quedó activa. Te redirigimos al panel en unos segundos." },
  declined:   { icon: XCircle,       color: "#dc2626", spin: false, title: "Pago rechazado",                   sub: "La transacción no fue aprobada. Podés intentar de nuevo." },
  notapproved:{ icon: XCircle,       color: "#dc2626", spin: false, title: "Pago no confirmado",               sub: "El pago fue procesado pero no pudo confirmarse con Wompi. Si se debitó el monto, contactate con soporte." },
  wrongitem:  { icon: XCircle,       color: "#dc2626", spin: false, title: "Referencia incorrecta",            sub: "El pago corresponde a otra publicación y no puede usarse para esta. Contactate con soporte." },
  planinvalid:{ icon: AlertTriangle,  color: "#d97706", spin: false, title: "Plan inválido",                   sub: "Hubo un problema con el plan seleccionado. Volvé atrás e intentá de nuevo." },
  error:      { icon: AlertTriangle,  color: "#d97706", spin: false, title: "Algo salió mal",                  sub: "No pudimos verificar el pago. Contactate con nosotros si el monto fue debitado." },
  noref:      { icon: AlertTriangle,  color: "#d97706", spin: false, title: "Referencia inválida",             sub: "No encontramos información de pago. Si ya pagaste, contactate con soporte." },
};

const PagoResultado = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const transactionId = searchParams.get("id");
  const isMock = !!user?.id?.startsWith("mock-");

  const [status, setStatus] = useState("loading");
  const [txData, setTxData] = useState(null);

  useEffect(() => {
    if (!transactionId) { setStatus("noref"); return; }

    const verify = async () => {
      setStatus("loading");
      try {
        const tx = await verifyTransaction(transactionId);
        setTxData(tx);

        if (tx.status !== "APPROVED") {
          setStatus("declined");
          return;
        }

        // Recuperar contexto guardado antes de redirigir
        const raw = sessionStorage.getItem("mv_pending_payment");
        if (!raw) { setStatus("error"); return; }

        const pending = JSON.parse(raw);

        // Mock users: skip backend publish (no real vehicle was created)
        if (!isMock) {
          // Publicar el ítem via backend (ya pagado).
          // Si el webhook ya lo publicó primero → 409 → tratamos como éxito.
          const endpoint = pending.itemType === "vehicle"
            ? `/vehicles/${pending.itemId}/publish`
            : `/products/${pending.itemId}/publish`;

          const publishBody = {
            transactionId: transactionId,
            reference:     pending.reference,
            plan:          pending.plan,
          };

          try {
            await api.post(endpoint, publishBody);
          } catch (pubErr) {
            if (pubErr?.status === 409) {
              // Webhook ya publicó primero — tratar como éxito
            } else if (pubErr?.status === 402) {
              setStatus("notapproved");
              return;
            } else if (pubErr?.status === 403) {
              setStatus("wrongitem");
              return;
            } else if (pubErr?.status === 422) {
              setStatus("planinvalid");
              return;
            } else {
              throw pubErr;
            }
          }
        }

        sessionStorage.removeItem("mv_pending_payment");

        setStatus("success");
        setTimeout(() => navigate("/vendedor?tab=publicaciones&success=1"), 2500);
      } catch {
        setStatus("error");
      }
    };

    verify();
  }, [transactionId, navigate, isMock]);

  const { icon: Icon, color, spin, title, sub } = STATUS[status];

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.iconWrap} style={{ "--icon-color": color }}>
            <Icon size={56} className={spin ? styles.spin : ""} />
          </div>

          <h1 className={styles.title}>{title}</h1>
          <p className={styles.sub}>{sub}</p>

          {txData && (
            <div className={styles.txInfo}>
              <span>Ref. WOMPI</span>
              <strong>{txData.id || transactionId}</strong>
            </div>
          )}

          {(status === "declined" || status === "error" || status === "noref" || status === "notapproved" || status === "wrongitem" || status === "planinvalid") && (
            <div className={styles.actions}>
              <button
                className={styles.retryBtn}
                onClick={() => navigate(-1)}
              >
                Volver atrás
              </button>
              <button
                className={styles.dashboardBtn}
                onClick={() => navigate("/vendedor")}
              >
                Ir al panel
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PagoResultado;
