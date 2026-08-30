import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import {
  Eye, EyeOff, ArrowRight, Mail, Lock, Phone, User,
  Shield, FileText, MessageSquare, BarChart2, Users, HelpCircle, X, CheckCircle2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
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
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  /* ── Register state ── */
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
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

  /* ── Forgot password modal ── */
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const { user, loading: authLoading, signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();

  /* ── Auto-redirect if already logged in ── */
  useEffect(() => {
    if (!authLoading && user) {
      const dest = user.id === "mock-admin-001" ? "/admin" : "/vendedor";
      navigate(dest, { replace: true });
    }
  }, [authLoading, user, navigate]);

  /* ── Switch view ── */
  const switchView = (next) => {
    setView(next);
    setFieldErrors({});
    setGeneralError("");
    setInfo("");
    setShowPassword(false);
    setShowRegPassword(false);
    setShowConfirm(false);
    navigate(next === "register" ? "/login?view=register" : "/login", { replace: true });
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
    try {
      const { error: err } = await signIn(email, password);
      if (err) throw err;
      /* redirect handled by useEffect */
    } catch (err) {
      setGeneralError(translateError(err.message));
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
    if (!regPassword) errs.regPassword = "Ingresá una contraseña.";
    else if (regPassword.length < 8) errs.regPassword = "Mínimo 8 caracteres.";
    if (!confirmPassword) errs.confirmPassword = "Confirmá tu contraseña.";
    else if (regPassword !== confirmPassword) errs.confirmPassword = "Las contraseñas no coinciden.";
    if (!acceptTerms) errs.terms = "Debés aceptar los términos para continuar.";
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }

    setLoading(true);
    try {
      const { error: err } = await signUp(regEmail, regPassword, {
        full_name: `${nombre.trim()} ${apellido.trim()}`,
        phone: telefono.trim(),
      });
      if (err) throw err;
      setInfo("¡Cuenta creada! Revisá tu email para confirmar el registro.");
      switchView("login");
      setEmail(regEmail);
    } catch (err) {
      setGeneralError(translateError(err.message));
    } finally {
      setLoading(false);
    }
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
  };

  const isLogin = view === "login";
  const brand = BRAND[view];
  const strength = getStrength(regPassword);

  return (
    <div className={styles.page}>
      {/* ── Top nav ── */}
      <header className={styles.topNav}>
        <Link to="/" className={styles.navLogo}>
          <img src={logoVehiculo} alt="Mi Vehículo" className={styles.navLogoImg} />
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
            {/* Mobile logo */}
            <Link to="/" className={styles.mobileLogo}>
              <img src={logoVehiculo} alt="Mi Vehículo" />
            </Link>

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

              {generalError && <p className={styles.errorMsg}>{generalError}</p>}
              {info && <p className={styles.infoMsg}>{info}</p>}

              {/* ── LOGIN FORM ── */}
              {isLogin && (
                <form onSubmit={handleLogin} className={styles.form} noValidate>
                  <Field label="Email" error={fieldErrors.email}>
                    <div className={styles.inputWrap}>
                      <Mail size={16} className={styles.inputIcon} />
                      <input
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
                      <input
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
                    <CheckboxField
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      label="Recordarme"
                    />
                    <button
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
                  <div className={styles.nameRow}>
                    <Field label="Nombre" error={fieldErrors.nombre}>
                      <div className={styles.inputWrap}>
                        <User size={16} className={styles.inputIcon} />
                        <input
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
                        <input
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
                      <input
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
                      <input
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
                      <input
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
                      <input
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

              <div className={styles.divider}><span>o continuá con</span></div>

              <button className={styles.googleBtn} type="button">
                <GoogleIcon />
                Continuar con Google
              </button>

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
        <span>© 2026 Mi Vehículo. Todos los derechos reservados.</span>
        <div className={styles.footerLinks}>
          <Link to="/terminos">Términos y condiciones</Link>
          <span>·</span>
          <Link to="/privacidad">Política de privacidad</Link>
        </div>
      </footer>

      {/* ── Forgot password modal ── */}
      {showForgot && (
        <div className={styles.modalOverlay} onClick={closeForgot}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={closeForgot} aria-label="Cerrar">
              <X size={18} />
            </button>

            {forgotSuccess ? (
              <div className={styles.modalSuccess}>
                <div className={styles.modalSuccessIcon}>
                  <CheckCircle2 size={40} />
                </div>
                <h3>Email enviado</h3>
                <p>
                  Si existe una cuenta con <strong>{forgotEmail}</strong>, vas a recibir un
                  link para restablecer tu contraseña en los próximos minutos.
                </p>
                <button className={styles.submitBtn} onClick={closeForgot} type="button">
                  Entendido
                </button>
              </div>
            ) : (
              <>
                <h3 className={styles.modalTitle}>Recuperar contraseña</h3>
                <p className={styles.modalSub}>
                  Ingresá tu email y te enviamos un link para restablecer tu contraseña.
                </p>

                {forgotError && <p className={styles.errorMsg}>{forgotError}</p>}

                <form onSubmit={handleForgot} className={styles.form} noValidate>
                  <div className={styles.inputWrap}>
                    <Mail size={16} className={styles.inputIcon} />
                    <input
                      type="email"
                      className={styles.input}
                      value={forgotEmail}
                      onChange={(e) => { setForgotEmail(e.target.value); setForgotError(""); }}
                      placeholder="ejemplo@correo.com"
                      autoComplete="email"
                      autoFocus
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

function Field({ label, error, children }) {
  return (
    <div className={styles.fieldGroup}>
      <label className={styles.fieldLabel}>{label}</label>
      {children}
      {error && <p className={styles.fieldError}>{error}</p>}
    </div>
  );
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

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

function translateError(msg) {
  const m = msg || "";
  if (m.includes("Invalid login credentials") || m.includes("invalid_credentials")) return "Email o contraseña incorrectos.";
  if (m.includes("Email not confirmed")) return "Confirmá tu email antes de iniciar sesión.";
  if (m.includes("User already registered")) return "Ya existe una cuenta con ese email.";
  if (m.includes("Password should be at least")) return "La contraseña debe tener al menos 8 caracteres.";
  if (m.includes("Unable to validate email address")) return "El email ingresado no es válido.";
  if (m.includes("422") || m.includes("Unprocessable")) return "Email o contraseña incorrectos.";
  return "Ocurrió un error. Intentá nuevamente.";
}

export default Login;
