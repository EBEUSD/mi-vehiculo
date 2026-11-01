import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, AlertTriangle, Clock } from "lucide-react";
import Navbar from "../../components/Navbar/Navbar";
import { api } from "../../lib/api";
import { verifyTransaction } from "../../lib/wompi";
import { DRAFT_KEYS, clearDraft } from "../../lib/publishDrafts";
import { useAuth } from "../../context/AuthContext";
import styles from "./PagoResultado.module.css";

const STATUS = {
  loading:    { icon: Loader2,       color: "#1d4ed8", spin: true,  title: "Verificando pago…",               sub: "Estamos confirmando tu transacción con WOMPI." },
  pending:    { icon: Loader2,       color: "#1d4ed8", spin: true,  title: "Procesando pago…",                sub: "Wompi todavía está procesando tu pago. Esto puede tardar unos segundos; no cierres esta página." },
  stillpending: { icon: Clock,       color: "#d97706", spin: false, title: "Tu pago sigue en proceso",        sub: "Wompi aún no confirmó la transacción. Cuando se apruebe, tu publicación se activará automáticamente. Revisá tu panel en unos minutos." },
  success:    { icon: CheckCircle,   color: "#059669", spin: false, title: "¡Pago exitoso!",                   sub: "Tu publicación quedó activa. Te redirigimos al panel en unos segundos." },
  declined:   { icon: XCircle,       color: "#dc2626", spin: false, title: "Pago rechazado",                   sub: "La transacción no fue aprobada. Podés intentar de nuevo." },
  notapproved:{ icon: XCircle,       color: "#dc2626", spin: false, title: "Pago no confirmado",               sub: "El pago fue procesado pero no pudo confirmarse con Wompi. Si se debitó el monto, contactate con soporte." },
  wrongitem:  { icon: XCircle,       color: "#dc2626", spin: false, title: "Referencia incorrecta",            sub: "El pago corresponde a otra publicación y no puede usarse para esta. Contactate con soporte." },
  planinvalid:{ icon: AlertTriangle,  color: "#d97706", spin: false, title: "Plan inválido",                   sub: "Hubo un problema con el plan seleccionado. Volvé atrás e intentá de nuevo." },
  error:      { icon: AlertTriangle,  color: "#d97706", spin: false, title: "Algo salió mal",                  sub: "No pudimos verificar el pago. Contactate con nosotros si el monto fue debitado." },
  networkerror: { icon: AlertTriangle, color: "#d97706", spin: false, title: "Sin conexión",                   sub: "No pudimos comunicarnos con el servidor. Revisá tu conexión e intentá recargar. Si ya se debitó el monto, contactate con soporte." },
  noref:      { icon: AlertTriangle,  color: "#d97706", spin: false, title: "Referencia inválida",             sub: "No encontramos información de pago. Si ya pagaste, contactate con soporte." },
};

// Estados finales que muestran "Volver atrás / Ir al panel"
const WITH_ACTIONS = ["declined", "error", "networkerror", "noref", "notapproved", "wrongitem", "planinvalid", "stillpending"];

// Reintentos mientras Wompi devuelve PENDING: 2s, 4s, 8s, 15s, 15s, 15s (~1 min)
const POLL_DELAYS = [2000, 4000, 8000, 15000, 15000, 15000];

const PagoResultado = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const transactionId = searchParams.get("id");
  const isMock = !!user?.id?.startsWith("mock-");

  const [status, setStatus] = useState(transactionId ? "loading" : "noref");
  const [txData, setTxData] = useState(null);

  useEffect(() => {
    if (!transactionId) return;

    let cancelled = false;
    let timer = null;
    const wait = (ms) => new Promise((resolve) => { timer = setTimeout(resolve, ms); });

    const verify = async () => {
      try {
        let tx = await verifyTransaction(transactionId);
        if (cancelled) return;
        setTxData(tx);

        // PENDING → seguir consultando con backoff
        for (let i = 0; tx.status === "PENDING" && i < POLL_DELAYS.length; i++) {
          setStatus("pending");
          await wait(POLL_DELAYS[i]);
          if (cancelled) return;
          tx = await verifyTransaction(transactionId);
          if (cancelled) return;
          setTxData(tx);
        }

        if (tx.status === "PENDING") { setStatus("stillpending"); return; }
        if (tx.status !== "APPROVED") { setStatus("declined"); return; }

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
            if (cancelled) return;
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
        if (cancelled) return;

        sessionStorage.removeItem("mv_pending_payment");
        // Pago confirmado: el borrador de ese formulario ya no sirve
        const draftKey = DRAFT_KEYS[pending.itemType];
        if (draftKey) clearDraft(draftKey);

        setStatus("success");
        timer = setTimeout(() => navigate("/vendedor?tab=publicaciones&success=1"), 2500);
      } catch (err) {
        if (cancelled) return;
        const isNetwork = err instanceof TypeError || !err?.status;
        setStatus(isNetwork ? "networkerror" : "error");
      }
    };

    verify();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [transactionId, navigate, isMock]);

  const { icon: Icon, color, spin, title, sub } = STATUS[status];

  return (
    <div className={styles.page}>
      <title>Resultado del pago | Mi Vehículo</title>
      <Navbar />

      <main className={styles.main}>
        <div className={styles.card} aria-live="polite">
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

          {WITH_ACTIONS.includes(status) && (
            <div className={styles.actions}>
              {status !== "stillpending" && (
                <button
                  className={styles.retryBtn}
                  onClick={() => navigate(-1)}
                >
                  Volver atrás
                </button>
              )}
              <button
                className={styles.dashboardBtn}
                onClick={() => navigate("/vendedor?tab=publicaciones")}
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
