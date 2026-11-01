import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Eye, EyeOff, KeyRound, Lock, TriangleAlert } from "lucide-react";
import { supabase } from "../../lib/supabase";
import logoVehiculo from "../../assets/logo-vehiculo.png";
// Mismo look & feel que /login: se reutilizan sus estilos
import styles from "../Login/Login.module.css";
import own from "./ResetPassword.module.css";

const MIN_LEN = 8;

// Supabase devuelve errores del link de recuperación en el hash (#error=...&error_code=otp_expired)
const linkErrorFromUrl = () => {
  const params = new URLSearchParams(window.location.hash.slice(1) || window.location.search.slice(1));
  return params.get("error_code") || params.get("error") || null;
};

const translateUpdateError = (msg = "") => {
  if (/different from the old password|same_password/i.test(msg)) return "La nueva contraseña debe ser distinta a la anterior.";
  if (/weak_password|at least/i.test(msg)) return `La contraseña debe tener al menos ${MIN_LEN} caracteres.`;
  if (/rate limit|over_request/i.test(msg)) return "Demasiados intentos. Esperá unos minutos.";
  return "No pudimos actualizar tu contraseña. Intentá nuevamente.";
};

const isSessionError = (msg = "") => /session missing|session_not_found|jwt|expired|not authenticated/i.test(msg);

/**
 * Destino del email de recuperación (resetPasswordForEmail → /reset-password).
 * supabase-js detecta el token del link y crea una sesión de recuperación
 * (evento PASSWORD_RECOVERY); con esa sesión se puede llamar a updateUser.
 */
const ResetPassword = () => {
  // checking → ready | invalid → done
  const [status, setStatus]       = useState(() => (linkErrorFromUrl() ? "invalid" : "checking"));
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [showPwd, setShowPwd]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors]       = useState({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading]     = useState(false);

  useEffect(() => {
    if (status !== "checking") return;
    let alive = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (alive && session && (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN")) setStatus("ready");
    });

    // getSession espera a que supabase-js termine de procesar el token de la URL
    supabase.auth.getSession()
      .then(({ data: { session } }) => { if (alive) setStatus(session ? "ready" : "invalid"); })
      .catch(() => { if (alive) setStatus("invalid"); });

    return () => { alive = false; subscription.unsubscribe(); };
  }, [status]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");
    const errs = {};
    if (!password) errs.password = "Ingresá una contraseña nueva.";
    else if (password.length < MIN_LEN) errs.password = `Mínimo ${MIN_LEN} caracteres.`;
    if (!confirm) errs.confirm = "Confirmá tu contraseña.";
    else if (password !== confirm) errs.confirm = "Las contraseñas no coinciden.";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setStatus("done");
    } catch (err) {
      if (isSessionError(err?.message)) setStatus("invalid");
      else setGeneralError(translateUpdateError(err?.message));
    } finally {
      setLoading(false);
    }
  };

  const clearErr = (key) => setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });

  return (
    <div className={styles.page}>
      <title>Restablecer contraseña | Mi Vehículo</title>
      <meta name="robots" content="noindex" />

      <header className={styles.topNav}>
        <Link to="/" className={styles.navLogo}>
          <img src={logoVehiculo} alt="Mi Vehículo" className={styles.navLogoImg} width="176" height="32" />
        </Link>
      </header>

      <div className={styles.cardWrap}>
        <div className={`${styles.card} ${styles.confirmCard}`}>
          <main className={styles.confirmPanel}>
            <div className={styles.confirmInner}>

              {status === "checking" && (
                <div className={own.checking} role="status">
                  <span className={own.spinner} aria-hidden="true" />
                  Verificando el enlace…
                </div>
              )}

              {status === "invalid" && (
                <>
                  <div className={`${styles.confirmIconWrap} ${own.iconWarn}`}>
                    <TriangleAlert size={34} strokeWidth={1.7} aria-hidden="true" />
                  </div>
                  <h1 className={styles.confirmTitle}>El enlace venció o no es válido</h1>
                  <p className={styles.confirmSub}>
                    Los enlaces de recuperación se pueden usar una sola vez y vencen después de un tiempo.
                    Pedí uno nuevo y abrilo desde el mismo dispositivo.
                  </p>
                  <Link to="/login?forgot=1" className={`${styles.submitBtn} ${own.linkBtn}`}>
                    Pedir un nuevo email <ArrowRight size={18} aria-hidden="true" />
                  </Link>
                  <p className={own.secondary}>
                    <Link to="/login">Volver a iniciar sesión</Link>
                  </p>
                </>
              )}

              {status === "done" && (
                <>
                  <div className={`${styles.confirmIconWrap} ${own.iconOk}`}>
                    <CheckCircle2 size={36} strokeWidth={1.7} aria-hidden="true" />
                  </div>
                  <h1 className={styles.confirmTitle}>¡Contraseña actualizada!</h1>
                  <p className={styles.confirmSub} role="status">
                    Ya podés ingresar a tu cuenta con tu nueva contraseña.
                  </p>
                  <Link to="/login" className={`${styles.submitBtn} ${own.linkBtn}`}>
                    Ir a iniciar sesión <ArrowRight size={18} aria-hidden="true" />
                  </Link>
                </>
              )}

              {status === "ready" && (
                <>
                  <div className={styles.confirmIconWrap}>
                    <KeyRound size={34} strokeWidth={1.7} aria-hidden="true" />
                  </div>
                  <h1 className={styles.confirmTitle}>Elegí una contraseña nueva</h1>
                  <p className={styles.confirmSub}>Usá al menos {MIN_LEN} caracteres.</p>

                  {generalError && <p className={`${styles.errorMsg} ${own.fullWidth}`} role="alert">{generalError}</p>}

                  <form onSubmit={handleSubmit} className={`${styles.form} ${own.form}`} noValidate>
                    <PasswordField
                      id="rp-password"
                      label="Nueva contraseña"
                      value={password}
                      onChange={(v) => { setPassword(v); clearErr("password"); }}
                      show={showPwd}
                      onToggle={() => setShowPwd((v) => !v)}
                      error={errors.password}
                      placeholder={`Mínimo ${MIN_LEN} caracteres`}
                    />
                    <PasswordField
                      id="rp-confirm"
                      label="Confirmar contraseña"
                      value={confirm}
                      onChange={(v) => { setConfirm(v); clearErr("confirm"); }}
                      show={showConfirm}
                      onToggle={() => setShowConfirm((v) => !v)}
                      error={errors.confirm}
                      placeholder="Repetí tu contraseña"
                    />

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                      {loading
                        ? <><span className={styles.spinner} aria-hidden="true" /> Guardando...</>
                        : <>Guardar contraseña <ArrowRight size={18} aria-hidden="true" /></>}
                    </button>
                  </form>
                </>
              )}

            </div>
          </main>
        </div>
      </div>

      <footer className={styles.footer}>
        <span>© 2026 Go technology. Todos los derechos reservados.</span>
        <div className={styles.footerLinks}>
          <Link to="/terminos">Términos y condiciones</Link>
          <span>·</span>
          <Link to="/privacidad">Política de privacidad</Link>
        </div>
      </footer>
    </div>
  );
};

function PasswordField({ id, label, value, onChange, show, onToggle, error, placeholder }) {
  const errorId = `${id}-error`;
  return (
    <div className={styles.fieldGroup}>
      <label className={styles.fieldLabel} htmlFor={id}>{label}</label>
      <div className={styles.inputWrap}>
        <Lock size={16} className={styles.inputIcon} aria-hidden="true" />
        <input
          id={id}
          type={show ? "text" : "password"}
          className={`${styles.input} ${styles.inputWithEye} ${error ? styles.inputError : ""}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="new-password"
          minLength={MIN_LEN}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
        />
        <button
          type="button"
          className={styles.eyeBtn}
          onClick={onToggle}
          aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {show ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
        </button>
      </div>
      {error && <p id={errorId} className={styles.fieldError}>{error}</p>}
    </div>
  );
}

export default ResetPassword;
