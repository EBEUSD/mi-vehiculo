import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, AlertTriangle, Clock } from "lucide-react";
import Navbar from "../../components/Navbar/Navbar";
import { PENDING_PAYMENT_KEY } from "../../lib/wompi";
import { publishItem, featureItem, errorCode, apiErrorMessage } from "../../lib/publishing";
import { DRAFT_KEYS, clearDraft } from "../../lib/publishDrafts";
import { useAuth } from "../../context/AuthContext";
import styles from "./PagoResultado.module.css";

const STATUS = {
  loading:    { icon: Loader2,       color: "#1d4ed8", spin: true,  title: "Verificando pago…",               sub: "Estamos confirmando tu transacción con WOMPI. No cierres esta página." },
  processing: { icon: Clock,         color: "#d97706", spin: false, title: "Estamos procesando tu pago",      sub: "Cuando Wompi nos confirme el pago, tu publicación se activará automáticamente. Revisá tu panel en unos minutos." },
  success:    { icon: CheckCircle,   color: "#059669", spin: false, title: "¡Pago exitoso!",                   sub: "Tu publicación quedó activa. Te redirigimos al panel en unos segundos." },
  successpending: { icon: CheckCircle, color: "#059669", spin: false, title: "¡Pago exitoso!",                 sub: "Tu publicación quedó pendiente de aprobación: la revisamos y te avisamos cuando esté visible." },
  featured:   { icon: CheckCircle,   color: "#059669", spin: false, title: "¡Publicación destacada!",          sub: "El destaque ya está activo. Te redirigimos al panel en unos segundos." },
  mismatch:   { icon: XCircle,       color: "#dc2626", spin: false, title: "El pago no coincide",              sub: "El monto, la moneda o la referencia del pago no coinciden con la publicación. Contactate con soporte." },
  declined:   { icon: XCircle,       color: "#dc2626", spin: false, title: "Pago rechazado",                   sub: "La transacción no fue aprobada. Podés intentar de nuevo." },
  notapproved:{ icon: XCircle,       color: "#dc2626", spin: false, title: "Pago no confirmado",               sub: "Wompi no aprobó la transacción. Si se debitó el monto, contactate con soporte." },
  wrongitem:  { icon: XCircle,       color: "#dc2626", spin: false, title: "Referencia incorrecta",            sub: "El pago corresponde a otra publicación y no puede usarse para esta. Contactate con soporte." },
  planinvalid:{ icon: AlertTriangle,  color: "#d97706", spin: false, title: "Plan inválido",                   sub: "Hubo un problema con el plan seleccionado. Volvé atrás e intentá de nuevo." },
  error:      { icon: AlertTriangle,  color: "#d97706", spin: false, title: "Algo salió mal",                  sub: "No pudimos verificar el pago. Contactate con nosotros si el monto fue debitado." },
  networkerror: { icon: AlertTriangle, color: "#d97706", spin: false, title: "Sin conexión",                   sub: "No pudimos comunicarnos con el servidor. Revisá tu conexión e intentá recargar. Si ya se debitó el monto, contactate con soporte." },
  noref:      { icon: AlertTriangle,  color: "#d97706", spin: false, title: "Referencia inválida",             sub: "No encontramos información de pago. Si ya pagaste, contactate con soporte." },
};

// Estados finales que muestran "Volver atrás / Ir al panel"
// Respuestas de /publish y /feature que significan "el webhook ya aplicó este pago"
const APPLIED_CODES = ["PAYMENT_ALREADY_USED", "ALREADY_ACTIVE"];

const ERROR_STATUS = {
  PAYMENT_NOT_APPROVED:       "notapproved",
  PAYMENT_AMOUNT_MISMATCH:    "mismatch",
  PAYMENT_CURRENCY_MISMATCH:  "mismatch",
  PAYMENT_REFERENCE_MISMATCH: "mismatch",
  PAYMENT_ITEM_MISMATCH:      "wrongitem",
  INVALID_PLAN:               "planinvalid",
  INVALID_FEATURED_DAYS:      "planinvalid",
  // Wompi no respondió o no se pudo atar la transacción: el pago queda sin consumir y lo aplica el webhook
  WOMPI_ERROR:                "processing",
  PAYMENT_NOT_FOUND:          "processing",
};

const WITH_ACTIONS =["declined", "error", "networkerror", "noref", "notapproved", "wrongitem", "planinvalid", "processing"];

const PagoResultado = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  // Parámetros que agrega Wompi SV a la URL de redirect
  const transactionId  = searchParams.get("idTransaccion");
  const urlReference   = searchParams.get("identificadorEnlaceComercio");
  const hash           = searchParams.get("hash");
  const monto          = searchParams.get("monto");
  const rejected       = searchParams.get("esAprobada") === "false";
  const isMock = !!user?.id?.startsWith("mock-");

  const [status, setStatus] = useState(!transactionId ? "noref" : rejected ? "declined" : "loading");
  const [detail, setDetail] = useState("");

  useEffect(() => {
    if (!transactionId || rejected) return;

    let cancelled = false;
    let timer = null;

    const confirm = async () => {
      try {
        // Contexto guardado antes de ir a Wompi
        const raw = sessionStorage.getItem(PENDING_PAYMENT_KEY);
        const pending = raw ? JSON.parse(raw) : null;
        // Sin contexto (pagó desde otro dispositivo o app) o de otro intento: lo aplica el webhook
        if (!pending || (urlReference && pending.reference && urlReference !== pending.reference)) {
          setStatus("processing");
          return;
        }
        const isFeature = pending.kind === "feature";

        // La primera publicación de un vendedor sin verificar queda PENDING (aprobación manual)
        let pendingApproval = false;

        // Mock users: skip backend publish (no real vehicle was created)
        if (!isMock) {
          // Si el webhook de Wompi ya aplicó el pago, el backend responde 409: se toma como éxito.
          const payment = {
            itemType: pending.itemType || "vehicle",
            itemId: pending.itemId,
            transactionId,
            reference: urlReference || pending.reference,
            hash,
            monto,
          };
          try {
            const data = isFeature
              ? await featureItem({ ...payment, days: pending.days })
              : await publishItem({ ...payment, plan: pending.plan });
            pendingApproval = data?.status === "PENDING";
          } catch (pubErr) {
            if (cancelled) return;
            // Se decide por code: el mismo status HTTP cubre casos distintos
            const code = errorCode(pubErr);
            if (code === "PENDING_REVIEW") {
              pendingApproval = true;
            } else if (APPLIED_CODES.includes(code)) {
              // Lo aplicó el webhook antes de que volviera el usuario
            } else if (ERROR_STATUS[code]) {
              setStatus(ERROR_STATUS[code]);
              return;
            } else if (pubErr?.status >= 400 && pubErr?.status < 500) {
              setDetail(apiErrorMessage(pubErr));
              setStatus("error");
              return;
            } else {
              throw pubErr;
            }
          }
        }
        if (cancelled) return;

        sessionStorage.removeItem(PENDING_PAYMENT_KEY);
        // Pago confirmado: el borrador de ese formulario ya no sirve
        const draftKey = !isFeature && DRAFT_KEYS[pending.itemType];
        if (draftKey) clearDraft(draftKey);

        const result = isFeature ? "featured" : pendingApproval ? "pending" : "1";
        setStatus(isFeature ? "featured" : pendingApproval ? "successpending" : "success");
        timer = setTimeout(() => navigate(`/vendedor?tab=publicaciones&success=${result}`), 2500);
      } catch (err) {
        if (cancelled) return;
        const isNetwork = err instanceof TypeError || !err?.status;
        setStatus(isNetwork ? "networkerror" : "error");
      }
    };

    confirm();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [transactionId, urlReference, hash, monto, rejected, navigate, isMock]);

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
          <p className={styles.sub}>{detail || sub}</p>

          {transactionId && status !== "loading" && (
            <div className={styles.txInfo}>
              <span>Ref. WOMPI</span>
              <strong>{transactionId}</strong>
            </div>
          )}

          {WITH_ACTIONS.includes(status) && (
            <div className={styles.actions}>
              {status !== "processing" && (
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
