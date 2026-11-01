import { useState, useEffect, useId, useRef, createContext, useContext } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import {
  Eye, EyeOff, ArrowRight, Mail, Lock, Phone, User,
  Shield, FileText, MessageSquare, BarChart2, Users, HelpCircle, X, CheckCircle2,
  CheckCircle, Building2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { isValidSvPhone, normalizeSvPhone } from "../../lib/phone";
import { loginHref, rememberNext, safeNext } from "../../lib/redirect";
import styles from "./Login.module.css";
import logoVehiculo from "../../assets/logo-vehiculo.png";

/* ── Brand panel content per view ── */
const BRAND = {
  login: {
    title: <>Iniciá sesión para <span className={styles.brandHighlight}>publicar y gestionar</span> tus vehículos</>,
    sub: "Accedé a todas las herramientas que necesitás para vender más y mejor.",
    features: [
      { icon: <FileText size={18} />, title: "Gestioná tus publicaciones", desc: "Creá, editá y destacá tus avisos en segundos." },
      { icon: <MessageSquare size={18} />, title: "Respondé consultas", desc: "Chateá con interesados y no pierdas oportunidades." },
      { icon: <BarChart2 size={18} />, title: "Seguí tus estadísticas", desc: "Monitorea visitas, consultas y el rendimiento de tus avisos." },
    ],
  },
  register: {
    title: <>Creá tu cuenta y <span className={styles.brandHighlight}>publicá tus vehículos</span> en minutos</>,
    sub: "Sumate a Mi Vehículo y empezá a vender más y mejor. Es rápido, fácil y seguro.",
    features: [
      { icon: <BarChart2 size={18} />, title: "Publicá sin límites", desc: "Publicá todos los vehículos que quieras, cuando quieras." },
      { icon: <Users size={18} />, title: "Gestioná todo en un solo lugar", desc: "Editá, destacá y hacé seguimiento de tus avisos fácilmente." },
      { icon: <Shield size={18} />, title: "Seguridad y confianza", desc: "Protegemos tus datos para que vendas con total tranquilidad." },
    ],
  },
};

/* ── Password strength ── */
function getStrength(pwd) {
  if (!pwd) return null;
  const checks = [
    pwd.length >= 8,
    /[A-Z]/.test(pwd) || /[a-z]/.test(pwd),
    /[0-9]/.test(pwd),
    /[^A-Za-z0-9]/.test(pwd) || pwd.length >= 12,
  ];
  const score = checks.filter(Boolean).length;
  if (score <= 2) return { level: 1, label: "Débil", color: "#ef4444" };
  if (score === 3) return { level: 2, label: "Media", color: "#f59e0b" };
  return { level: 3, label: "Fuerte", color: "#22c55e" };
}

const Login = () => {
  const [searchParams] = useSearchParams();
  const [view, setView] = useState(
    searchParams.get("view") === "register" ? "register" : "login"
  );

  /* ── Login state ── */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  /* ── Register state ── */
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [accountType, setAccountType] = useState("PARTICULAR");
  const [regEmail, setRegEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  /* ── UI state ── */
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");  // email awaiting confirmation
  const [resending, setResending] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  /* ── Forgot password modal ── */
  // /login?forgot=1 abre directo el modal (ej. desde un link de recuperación vencido)
  const [showForgot, setShowForgot] = useState(() => searchParams.get("forgot") === "1");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [resendError, setResendError] = useState("");
  const forgotInputRef = useRef(null);
  const forgotTriggerRef = useRef(null);

  const { user, loading: authLoading, signIn, signInWithGoogle, signInWithApple, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();
  // A dónde volver después de entrar (ej. la publicación donde quiso contactar al vendedor)
  const next = safeNext(searchParams.get("next"));

  /* ── Auto-redirect if already logged in ── */
  useEffect(() => {
    if (!authLoading && user) {
      if (sessionStorage.getItem("mv_just_registered")) {
        sessionStorage.removeItem("mv_just_registered");
        navigate(next || "/", { replace: true });
      } else {
        const dest = next || (user.role === "ADMIN" ? "/admin" : "/vendedor");
        navigate(dest, { replace: true });
      }
    }
  }, [authLoading, user, navigate, next]);

  /* ── Switch view ── */
  const switchView = (target) => {
    setView(target);
    setFieldErrors({});
    setGeneralError("");
    setInfo("");
    setShowPassword(false);
    setShowRegPassword(false);
    setShowConfirm(false);
    navigate(loginHref(next, target === "register" ? "register" : undefined), { replace: true });
  };

  /* ── Clear field error on change ── */
  const clearField = (key) =>
    setFieldErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });

  /* ── Login submit ── */
  const handleLogin = async (e) => {
    e.preventDefault();
    setGeneralError("");
    const errs = {};
    if (!email) errs.email = "Ingresá tu email.";
    if (!password) errs.password = "Ingresá tu contraseña.";
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }

    setLoading(true);
    const justRegistered = !!sessionStorage.getItem("mv_just_registered");
    try {
      const { error: err } = await signIn(email, password);
      if (err) throw err;
      /* redirect handled by useEffect */
    } catch (err) {
      sessionStorage.removeItem("mv_just_registered");
      setGeneralError(translateError(err.message, justRegistered));
    } finally {
      setLoading(false);
    }
  };

  /* ── Register submit ── */
  const handleRegister = async (e) => {
    e.preventDefault();
    setGeneralError("");
    const errs = {};
    if (!nombre.trim()) errs.nombre = "Ingresá tu nombre.";
    if (!apellido.trim()) errs.apellido = "Ingresá tu apellido.";
    if (!regEmail) errs.regEmail = "Ingresá tu email.";
    if (!isValidSvPhone(telefono)) errs.telefono = "Ingresá un teléfono válido de 8 dígitos.";
    if (!regPassword) errs.regPassword = "Ingresá una contraseña.";
    else if (regPassword.length < 8) errs.regPassword = "Mínimo 8 caracteres.";
    if (!confirmPassword) errs.confirmPassword = "Confirmá tu contraseña.";
    else if (regPassword !== confirmPassword) errs.confirmPassword = "Las contraseñas no coinciden.";
    if (!acceptTerms) errs.terms = "Debés aceptar los términos para continuar.";
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }

    setLoading(true);
    try {
      const { data, error: err } = await signUp(regEmail, regPassword, {
        full_name: `${nombre.trim()} ${apellido.trim()}`,
        phone: normalizeSvPhone(telefono),
        // El documento (o los datos de la empresa) se pide al publicar por primera vez
        account_type: accountType,
      });
      if (err) throw err;

      sessionStorage.setItem("mv_just_registered", "1");

      // Supabase with email confirmation enabled: data.session is null
      // The user must confirm their email before they can log in
      if (!data?.session) {
        setPendingEmail(regEmail);
        return;
      }

      // Email confirmation disabled: Supabase returned a session → auto-login via onAuthStateChange
      setInfo("¡Cuenta creada! Iniciando sesión…");
    } catch (err) {
      setGeneralError(translateError(err.message));
    } finally {
      setLoading(false);
    }
  };

  /* ── Google / Apple ── */
  const handleOAuth = async (provider) => {
    setGeneralError("");
    const fn = provider === "apple" ? signInWithApple : signInWithGoogle;
    rememberNext(next);
    const { error: err } = await fn();
    if (err) setGeneralError(`No pudimos conectar con ${provider === "apple" ? "Apple" : "Google"}. Intentá nuevamente.`);
  };

  /* ── Forgot password submit ── */
  const handleForgot = async (e) => {
    e.preventDefault();
    setForgotError("");
    if (!forgotEmail) { setForgotError("Ingresá tu email."); return; }
    setForgotLoading(true);
    try {
      const { error: err } = await resetPassword(forgotEmail);
      if (err) throw err;
      setForgotSuccess(true);
    } catch {
      setForgotError("No pudimos procesar tu solicitud. Intentá nuevamente.");
    } finally {
      setForgotLoading(false);
    }
  };

  const closeForgot = () => {
    setShowForgot(false);
    setForgotEmail("");
    setForgotError("");
    setForgotSuccess(false);
    forgotTriggerRef.current?.focus();
  };

  /* ── Forgot modal: foco inicial + Escape para cerrar ── */
  useEffect(() => {
    if (!showForgot) return;
    forgotInputRef.current?.focus();
    const onKey = (e) => { if (e.key === "Escape") closeForgot(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showForgot]);

  const isLogin = view === "login";
  const brand = BRAND[view];
  const strength = getStrength(regPassword);

  const handleResend = async () => {
    if (resending || resendSent) return;
    setResending(true);
    setResendError("");
    try {
      const { error: err } = await supabase.auth.resend({ type: "signup", email: pendingEmail });
      if (err) throw err;
      setResendSent(true);
    } catch (err) {
      setResendError(translateError(err?.message));
    }
    setResending(false);
  };

  /* ── Email confirmation pending screen ── */
  if (pendingEmail) {
    return (
      <div className={styles.page}>
        <title>Revisá tu email | Mi Vehículo</title>
        <header className={styles.topNav}>
          <Link to="/" className={styles.navLogo}>
            <img src={logoVehiculo} alt="Mi Vehículo" className={styles.navLogoImg} width="176" height="32" />
          </Link>
        </header>

        <div className={styles.cardWrap}>
          <div className={`${styles.card} ${styles.confirmCard}`}>
            <main className={styles.confirmPanel}>
              <div className={styles.confirmInner}>

                {/* Icon */}
                <div className={styles.confirmIconWrap}>
                  <Mail size={36} strokeWidth={1.6} />
                </div>

                {/* Heading */}
                <h2 className={styles.confirmTitle}>Revisá tu email</h2>
                <p className={styles.confirmSub}>
                  Te enviamos un enlace de activación a:
                </p>

                {/* Email badge */}
                <div className={styles.confirmEmailBadge}>
                  <Mail size={14} />
                  {pendingEmail}
                </div>

                {/* Steps */}
                <div className={styles.confirmSteps}>
                  {[
                    { n: "1", title: "Abrí tu bandeja de entrada", sub: "Buscá un email de Mi Vehículo" },
                    { n: "2", title: "Hacé clic en el enlace", sub: "Confirmá tu cuenta con un solo clic" },
                    { n: "3", title: "Iniciá sesión", sub: "Listo, ya podés publicar tu vehículo" },
                  ].map((s) => (
                    <div key={s.n} className={styles.confirmStep}>
                      <div className={styles.confirmStepNum}>{s.n}</div>
                      <div>
                        <strong>{s.title}</strong>
                        <p>{s.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Primary CTA */}
                <button
                  type="button"
                  className={styles.submitBtn}
                  style={{ width: "100%" }}
                  onClick={() => {
                    setPendingEmail("");
                    setResendSent(false);
                    switchView("login");
                    setEmail(pendingEmail);
                  }}
                >
                  Ya confirmé, iniciar sesión <ArrowRight size={18} />
                </button>

                {/* Secondary actions */}
                <div className={styles.confirmActions}>
                  {resendSent ? (
                    <span className={styles.resendSentMsg}>
                      <CheckCircle size={14} />
                      Email reenviado. Revisá tu bandeja.
                    </span>
                  ) : (
                    <p className={styles.resendRow}>
                      ¿No llegó el email?{" "}
                      <button
                        type="button"
                        className={styles.resendBtn}
                        onClick={handleResend}
                        disabled={resending}
                      >
                        {resending ? "Enviando…" : "Reenviar"}
                      </button>
                    </p>
                  )}
                  {resendError && <p className={styles.errorMsg} role="alert">{resendError}</p>}
                  <p className={styles.resendRow}>
                    <button
                      type="button"
                      className={styles.resendBtn}
                      style={{ color: "#8a96b0" }}
                      onClick={() => { setPendingEmail(""); setResendSent(false); switchView("register"); }}
                    >
                      Usar otro email
                    </button>
                  </p>
                </div>

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
  }

  return (
    <div className={styles.page}>
      <title>{isLogin ? "Ingresar | Mi Vehículo" : "Crear cuenta | Mi Vehículo"}</title>
      <meta name="description" content="Ingresá o creá tu cuenta en Mi Vehículo para publicar y gestionar tus vehículos en El Salvador." />

      {/* ── Top nav ── */}
      <header className={styles.topNav}>
        <Link to="/" className={styles.navLogo}>
          <img src={logoVehiculo} alt="Mi Vehículo" className={styles.navLogoImg} width="176" height="32" />
        </Link>
        <Link to="/contacto" className={styles.helpLink}>
          <HelpCircle size={17} />
          ¿Necesitás ayuda?
        </Link>
      </header>

      {/* ── Card ── */}
      <div className={styles.cardWrap}>
        <div className={styles.card}>

          {/* Left — branding */}
          <aside className={styles.brand}>
            <div className={styles.brandGlow1} aria-hidden="true" />
            <div className={styles.brandGlow2} aria-hidden="true" />

            <div className={styles.brandContent}>
              <h1 className={styles.brandTitle}>{brand.title}</h1>
              <p className={styles.brandSub}>{brand.sub}</p>
              <ul className={styles.featureList}>
                {brand.features.map((f) => (
                  <li key={f.title} className={styles.featureItem}>
                    <div className={styles.featureIcon}>{f.icon}</div>
                    <div>
                      <strong>{f.title}</strong>
                      <p>{f.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.securityBadge}>
              <Shield size={18} />
              <div>
                <strong>Tu información está protegida</strong>
                <p>Usamos tecnología segura para cuidar tus datos.</p>
              </div>
            </div>
          </aside>

          {/* Right — form */}
          <main className={styles.formPanel}>
            <div className={styles.formInner}>
              <header className={styles.formHeader}>
                <h2 className={styles.formTitle}>
                  {isLogin ? "Iniciar sesión" : "Crear cuenta"}
                </h2>
                <p className={styles.formSub}>
                  {isLogin
                    ? "Bienvenido de nuevo a Mi Vehículo"
                    : "Bienvenido a Mi Vehículo. Comenzá a vender hoy."}
                </p>
              </header>

              {generalError && <p className={styles.errorMsg} role="alert">{generalError}</p>}
              {info && <p className={styles.infoMsg}>{info}</p>}

              {/* ── LOGIN FORM ── */}
              {isLogin && (
                <form onSubmit={handleLogin} className={styles.form} noValidate>
                  <Field label="Email" error={fieldErrors.email}>
                    <div className={styles.inputWrap}>
                      <Mail size={16} className={styles.inputIcon} />
                      <FieldInput
                        type="email"
                        className={`${styles.input} ${fieldErrors.email ? styles.inputError : ""}`}
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); clearField("email"); }}
                        placeholder="ejemplo@correo.com"
                        autoComplete="email"
                      />
                    </div>
                  </Field>

                  <Field label="Contraseña" error={fieldErrors.password}>
                    <div className={styles.inputWrap}>
                      <Lock size={16} className={styles.inputIcon} />
                      <FieldInput
                        type={showPassword ? "text" : "password"}
                        className={`${styles.input} ${styles.inputWithEye} ${fieldErrors.password ? styles.inputError : ""}`}
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); clearField("password"); }}
                        placeholder="••••••••••••"
                        autoComplete="current-password"
                      />
                      <EyeToggle show={showPassword} onToggle={() => setShowPassword((v) => !v)} />
                    </div>
                  </Field>

                  <div className={styles.optionsRow}>
                    <button
                      ref={forgotTriggerRef}
                      type="button"
                      className={styles.forgotLink}
                      onClick={() => setShowForgot(true)}
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>

                  <SubmitBtn loading={loading}>Iniciar sesión</SubmitBtn>
                </form>
              )}

              {/* ── REGISTER FORM ── */}
              {!isLogin && (
                <form onSubmit={handleRegister} className={styles.form} noValidate>
                  <Field label="Tipo de cuenta" group>
                    <div className={styles.segmented} role="radiogroup" aria-label="Tipo de cuenta">
                      {[
                        { value: "PARTICULAR", label: "Particular", icon: <User size={15} /> },
                        { value: "EMPRESA",    label: "Empresa",    icon: <Building2 size={15} /> },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          role="radio"
                          aria-checked={accountType === opt.value}
                          className={`${styles.segBtn} ${accountType === opt.value ? styles.segBtnActive : ""}`}
                          onClick={() => setAccountType(opt.value)}
                        >
                          {opt.icon}{opt.label}
                        </button>
                      ))}
                    </div>
                  </Field>

                  <div className={styles.nameRow}>
                    <Field label="Nombre" error={fieldErrors.nombre}>
                      <div className={styles.inputWrap}>
                        <User size={16} className={styles.inputIcon} />
                        <FieldInput
                          type="text"
                          className={`${styles.input} ${fieldErrors.nombre ? styles.inputError : ""}`}
                          value={nombre}
                          onChange={(e) => { setNombre(e.target.value); clearField("nombre"); }}
                          placeholder="Tu nombre"
                          autoComplete="given-name"
                        />
                      </div>
                    </Field>

                    <Field label="Apellido" error={fieldErrors.apellido}>
                      <div className={styles.inputWrap}>
                        <User size={16} className={styles.inputIcon} />
                        <FieldInput
                          type="text"
                          className={`${styles.input} ${fieldErrors.apellido ? styles.inputError : ""}`}
                          value={apellido}
                          onChange={(e) => { setApellido(e.target.value); clearField("apellido"); }}
                          placeholder="Tu apellido"
                          autoComplete="family-name"
                        />
                      </div>
                    </Field>
                  </div>

                  <Field label="Email" error={fieldErrors.regEmail}>
                    <div className={styles.inputWrap}>
                      <Mail size={16} className={styles.inputIcon} />
                      <FieldInput
                        type="email"
                        className={`${styles.input} ${fieldErrors.regEmail ? styles.inputError : ""}`}
                        value={regEmail}
                        onChange={(e) => { setRegEmail(e.target.value); clearField("regEmail"); }}
                        placeholder="ejemplo@correo.com"
                        autoComplete="email"
                      />
                    </div>
                  </Field>

                  <Field label="Teléfono / WhatsApp" error={fieldErrors.telefono}>
                    <div className={styles.inputWrap}>
                      <Phone size={16} className={styles.inputIcon} />
                      <FieldInput
                        type="tel"
                        className={`${styles.input} ${fieldErrors.telefono ? styles.inputError : ""}`}
                        value={telefono}
                        onChange={(e) => { setTelefono(e.target.value); clearField("telefono"); }}
                        placeholder="+503 7000-0000"
                        autoComplete="tel"
                      />
                    </div>
                  </Field>

                  <Field label="Contraseña" error={fieldErrors.regPassword}>
                    <div className={styles.inputWrap}>
                      <Lock size={16} className={styles.inputIcon} />
                      <FieldInput
                        type={showRegPassword ? "text" : "password"}
                        className={`${styles.input} ${styles.inputWithEye} ${fieldErrors.regPassword ? styles.inputError : ""}`}
                        value={regPassword}
                        onChange={(e) => { setRegPassword(e.target.value); clearField("regPassword"); }}
                        placeholder="Mínimo 8 caracteres"
                        autoComplete="new-password"
                      />
                      <EyeToggle show={showRegPassword} onToggle={() => setShowRegPassword((v) => !v)} />
                    </div>
                    {regPassword && strength && (
                      <div className={styles.strengthWrap}>
                        <div className={styles.strengthBars}>
                          {[1, 2, 3].map((n) => (
                            <div
                              key={n}
                              className={styles.strengthBar}
                              style={{ background: n <= strength.level ? strength.color : undefined }}
                            />
                          ))}
                        </div>
                        <span className={styles.strengthLabel} style={{ color: strength.color }}>
                          {strength.label}
                        </span>
                      </div>
                    )}
                  </Field>

                  <Field label="Confirmar contraseña" error={fieldErrors.confirmPassword}>
                    <div className={styles.inputWrap}>
                      <Lock size={16} className={styles.inputIcon} />
                      <FieldInput
                        type={showConfirm ? "text" : "password"}
                        className={`${styles.input} ${styles.inputWithEye} ${fieldErrors.confirmPassword ? styles.inputError : ""}`}
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); clearField("confirmPassword"); }}
                        placeholder="Repetí tu contraseña"
                        autoComplete="new-password"
                      />
                      <EyeToggle show={showConfirm} onToggle={() => setShowConfirm((v) => !v)} />
                    </div>
                  </Field>

                  <div className={styles.fieldGroup}>
                    <CheckboxField
                      checked={acceptTerms}
                      onChange={(e) => { setAcceptTerms(e.target.checked); clearField("terms"); }}
                      label={
                        <span>
                          Acepto los{" "}
                          <Link to="/terminos" className={styles.termsLink}>términos y condiciones</Link>
                          {" "}y la{" "}
                          <Link to="/privacidad" className={styles.termsLink}>política de privacidad</Link>.
                        </span>
                      }
                    />
                    {fieldErrors.terms && <p className={styles.fieldError}>{fieldErrors.terms}</p>}
                  </div>

                  <SubmitBtn loading={loading}>Crear cuenta</SubmitBtn>
                </form>
              )}

              <div className={styles.divider}>o</div>
              <div className={styles.socialRow}>
                <button type="button" className={styles.googleBtn} onClick={() => handleOAuth("google")}>
                  <GoogleIcon />
                  Continuar con Google
                </button>
                <button type="button" className={`${styles.googleBtn} ${styles.appleBtn}`} onClick={() => handleOAuth("apple")}>
                  <AppleIcon />
                  Continuar con Apple
                </button>
              </div>

              <p className={styles.switchRow}>
                {isLogin ? (
                  <>¿No tenés cuenta?{" "}
                    <button type="button" className={styles.switchLink} onClick={() => switchView("register")}>
                      Crear cuenta
                    </button>
                  </>
                ) : (
                  <>¿Ya tenés cuenta?{" "}
                    <button type="button" className={styles.switchLink} onClick={() => switchView("login")}>
                      Iniciá sesión
                    </button>
                  </>
                )}
              </p>
            </div>
          </main>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <span>© 2026 Go technology. Todos los derechos reservados.</span>
        <div className={styles.footerLinks}>
          <Link to="/terminos">Términos y condiciones</Link>
          <span>·</span>
          <Link to="/privacidad">Política de privacidad</Link>
        </div>
      </footer>

      {/* ── Forgot password modal ── */}
      {showForgot && (
        <div className={styles.modalOverlay} onClick={closeForgot}>
          <div
            className={styles.modalCard}
            role="dialog"
            aria-modal="true"
            aria-labelledby="forgot-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" className={styles.modalClose} onClick={closeForgot} aria-label="Cerrar">
              <X size={18} aria-hidden="true" />
            </button>

            {forgotSuccess ? (
              <div className={styles.modalSuccess}>
                <div className={styles.modalSuccessIcon}>
                  <CheckCircle2 size={40} aria-hidden="true" />
                </div>
                <h3 id="forgot-title">Email enviado</h3>
                <p>
                  Si existe una cuenta con <strong>{forgotEmail}</strong>, vas a recibir un
                  link para restablecer tu contraseña en los próximos minutos.
                </p>
                <button className={styles.submitBtn} onClick={closeForgot} type="button" autoFocus>
                  Entendido
                </button>
              </div>
            ) : (
              <>
                <h3 id="forgot-title" className={styles.modalTitle}>Recuperar contraseña</h3>
                <p className={styles.modalSub}>
                  Ingresá tu email y te enviamos un link para restablecer tu contraseña.
                </p>

                {forgotError && <p className={styles.errorMsg} role="alert">{forgotError}</p>}

                <form onSubmit={handleForgot} className={styles.form} noValidate>
                  <div className={styles.inputWrap}>
                    <Mail size={16} className={styles.inputIcon} aria-hidden="true" />
                    <input
                      ref={forgotInputRef}
                      type="email"
                      aria-label="Email"
                      className={styles.input}
                      value={forgotEmail}
                      onChange={(e) => { setForgotEmail(e.target.value); setForgotError(""); }}
                      placeholder="ejemplo@correo.com"
                      autoComplete="email"
                    />
                  </div>
                  <SubmitBtn loading={forgotLoading}>Enviar link</SubmitBtn>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Small reusable sub-components ── */

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.37 12.6c-.02-2.3 1.88-3.4 1.97-3.46-1.07-1.57-2.74-1.78-3.33-1.8-1.42-.14-2.77.84-3.49.84-.72 0-1.83-.82-3.01-.8-1.55.02-2.98.9-3.78 2.29-1.61 2.8-.41 6.94 1.16 9.21.77 1.11 1.68 2.36 2.88 2.31 1.16-.05 1.6-.75 3-.75s1.79.75 3.01.72c1.25-.02 2.04-1.13 2.8-2.25.88-1.29 1.24-2.54 1.26-2.6-.03-.01-2.42-.93-2.47-3.71zM14.07 5.85c.64-.78 1.07-1.85.95-2.93-.92.04-2.04.61-2.7 1.39-.59.69-1.11 1.79-.97 2.85 1.03.08 2.08-.52 2.72-1.31z"/>
    </svg>
  );
}

/* Field asocia label, control y error (useId) sin tener que pasar ids a mano:
   FieldInput / FieldSelect toman id, aria-invalid y aria-describedby del contexto. */
const FieldCtx = createContext(null);

function Field({ label, error, group = false, children }) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <FieldCtx.Provider value={{ id, errorId: error ? errorId : undefined, invalid: !!error }}>
      <div className={styles.fieldGroup}>
        {group
          ? <span className={styles.fieldLabel}>{label}</span>
          : <label className={styles.fieldLabel} htmlFor={id}>{label}</label>}
        {children}
        {error && <p id={errorId} className={styles.fieldError}>{error}</p>}
      </div>
    </FieldCtx.Provider>
  );
}

function useFieldA11y() {
  const ctx = useContext(FieldCtx);
  if (!ctx) return {};
  return { id: ctx.id, "aria-invalid": ctx.invalid || undefined, "aria-describedby": ctx.errorId };
}

function FieldInput(props) {
  return <input {...useFieldA11y()} {...props} />;
}

function FieldSelect(props) {
  return <select {...useFieldA11y()} {...props} />;
}

function EyeToggle({ show, onToggle }) {
  return (
    <button type="button" className={styles.eyeBtn} onClick={onToggle}
      aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}>
      {show ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  );
}

function CheckboxField({ checked, onChange, label }) {
  return (
    <label className={styles.checkLabel}>
      <input type="checkbox" className={styles.checkbox} checked={checked} onChange={onChange} />
      <span className={styles.checkBox} aria-hidden="true" />
      <span>{label}</span>
    </label>
  );
}

function SubmitBtn({ loading, children }) {
  return (
    <button type="submit" className={styles.submitBtn} disabled={loading}>
      {loading ? (
        <><span className={styles.spinner} aria-hidden="true" /> Cargando...</>
      ) : (
        <>{children} <ArrowRight size={18} /></>
      )}
    </button>
  );
}

function translateError(msg, justRegistered = false) {
  const m = msg || "";
  if (m.includes("Email not confirmed")) return "Confirmá tu email antes de iniciar sesión. Revisá tu bandeja de entrada.";
  // Supabase (newer versions) returns "Invalid login credentials" for unconfirmed emails too
  if (m.includes("Invalid login credentials") || m.includes("invalid_credentials")) {
    return justRegistered
      ? "Necesitás confirmar tu email antes de iniciar sesión. Revisá tu bandeja de entrada (y la carpeta spam)."
      : "Email o contraseña incorrectos.";
  }
  if (m.includes("User already registered") || m.includes("already exists") || m.includes("already registered") || m.includes("email_exists") || m.includes("duplicate")) return "Ya existe una cuenta con ese email.";
  if (m.includes("Password should be at least") || m.includes("weak_password") || (m.includes("password") && m.includes("6"))) return "La contraseña debe tener al menos 6 caracteres.";
  if (m.includes("Unable to validate email address") || m.includes("invalid email") || (m.includes("email") && m.includes("valid"))) return "El email ingresado no es válido.";
  if (m.includes("signup_disabled")) return "El registro está deshabilitado temporalmente.";
  if (m.includes("email_address_not_authorized")) return "Este email no está autorizado para registrarse.";
  if (m.includes("over_email_send_rate_limit")) return "Demasiados intentos. Esperá unos minutos.";
  if (m.includes("422") || m.includes("Unprocessable")) return "Email o contraseña incorrectos.";
  if (m && m !== "HTTP 400" && m !== "Bad Request" && m.length < 300) return m;
  return "Ocurrió un error al procesar tu solicitud. Intentá nuevamente.";
}

export default Login;
