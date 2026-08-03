import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail, Send, HelpCircle, Lock, ArrowUpRight,
  MessageCircle, Clock, ChevronRight, CheckCircle, Home,
  Phone,
} from "lucide-react";
import Navbar from "../../components/Navbar/Navbar";
import styles from "./Contacto.module.css";

const ASUNTOS = [
  "Consulta general",
  "Problema con mi publicación",
  "Problema con mi cuenta",
  "Reportar un aviso",
  "Sugerencias",
  "Otro",
];

const MAX_MSG = 1000;

const CHANNELS = [
  {
    icon: <Clock size={20} />,
    title: "Tiempo de respuesta",
    desc: "Respondemos en menos de 24 hs hábiles",
    color: "#1570ff",
  },
  {
    icon: <Mail size={20} />,
    title: "Email",
    desc: "soporte@mivehiculo.com.sv",
    color: "#059669",
  },
  {
    icon: <Phone size={20} />,
    title: "WhatsApp",
    desc: "+503 7100-1234",
    color: "#25d366",
  },
];

const Contacto = () => {
  const [form, setForm]         = useState({ nombre: "", email: "", asunto: "", mensaje: "" });
  const [errors, setErrors]     = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]   = useState(false);

  const set = (field) => (e) => {
    const val = field === "mensaje" ? e.target.value.slice(0, MAX_MSG) : e.target.value;
    setForm((prev) => ({ ...prev, [field]: val }));
    setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.nombre.trim()) errs.nombre  = "Ingresá tu nombre.";
    if (!form.email.trim())  errs.email   = "Ingresá tu email.";
    if (!form.asunto)        errs.asunto  = "Seleccioná un asunto.";
    if (!form.mensaje.trim()) errs.mensaje = "Escribí tu mensaje.";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className={styles.page}>
      <Navbar />

      <main>
        {/* ── Hero band ── */}
        <div className={styles.heroBand}>
          <div className={styles.heroInner}>
            <nav className={styles.breadcrumb} aria-label="breadcrumb">
              <Link to="/"><Home size={13} /></Link>
              <ChevronRight size={11} />
              <span>Contacto</span>
            </nav>

            <div className={styles.heroRow}>
              <div className={styles.heroText}>
                <span className={styles.heroLabel}>CONTACTO</span>
                <h1 className={styles.heroTitle}>Estamos para ayudarte</h1>
                <p className={styles.heroSub}>
                  ¿Tenés dudas, sugerencias o necesitás asistencia?<br />
                  Completá el formulario y te respondemos a la brevedad.
                </p>
              </div>
              <div className={styles.heroIllustration} aria-hidden="true">
                <div className={styles.illuRing}>
                  <MessageCircle size={40} strokeWidth={1.5} />
                </div>
                <div className={styles.illuDot1} />
                <div className={styles.illuDot2} />
                <div className={styles.illuDot3} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div className={styles.shell}>
          <div className={styles.layout}>
            {/* ── Main: form ── */}
            <div className={styles.main}>
              <div className={styles.formCard}>
                <div className={styles.formHeader}>
                  <div className={styles.formHeaderIcon}><Mail size={20} /></div>
                  <div>
                    <h2 className={styles.formTitle}>Envianos un mensaje</h2>
                    <p className={styles.formSub}>Completá el formulario y te responderemos a la brevedad.</p>
                  </div>
                </div>

                {submitted ? (
                  <div className={styles.successMsg}>
                    <div className={styles.successIcon}><CheckCircle size={36} /></div>
                    <h3>¡Mensaje enviado!</h3>
                    <p>Recibimos tu consulta y te responderemos en las próximas 24&nbsp;horas hábiles.</p>
                    <button
                      className={styles.resetBtn}
                      onClick={() => { setSubmitted(false); setForm({ nombre: "", email: "", asunto: "", mensaje: "" }); }}
                    >
                      Enviar otro mensaje
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className={styles.form} noValidate>
                    <div className={styles.row2}>
                      <div className={styles.fieldGroup}>
                        <label className={styles.label} htmlFor="nombre">
                          Nombre y apellido <span className={styles.req}>*</span>
                        </label>
                        <input
                          id="nombre" type="text"
                          className={`${styles.input} ${errors.nombre ? styles.inputError : ""}`}
                          value={form.nombre} onChange={set("nombre")}
                          placeholder="Ej: Juan Pérez"
                        />
                        {errors.nombre && <p className={styles.fieldError}>{errors.nombre}</p>}
                      </div>

                      <div className={styles.fieldGroup}>
                        <label className={styles.label} htmlFor="email">
                          Email <span className={styles.req}>*</span>
                        </label>
                        <input
                          id="email" type="email"
                          className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                          value={form.email} onChange={set("email")}
                          placeholder="Ej: juan@email.com"
                        />
                        {errors.email && <p className={styles.fieldError}>{errors.email}</p>}
                      </div>
                    </div>

                    <div className={styles.fieldGroup}>
                      <label className={styles.label} htmlFor="asunto">
                        Asunto <span className={styles.req}>*</span>
                      </label>
                      <select
                        id="asunto"
                        className={`${styles.input} ${styles.select} ${errors.asunto ? styles.inputError : ""}`}
                        value={form.asunto} onChange={set("asunto")}
                      >
                        <option value="">Seleccioná un asunto</option>
                        {ASUNTOS.map((a) => <option key={a} value={a}>{a}</option>)}
                      </select>
                      {errors.asunto && <p className={styles.fieldError}>{errors.asunto}</p>}
                    </div>

                    <div className={styles.fieldGroup}>
                      <label className={styles.label} htmlFor="mensaje">
                        Mensaje <span className={styles.req}>*</span>
                      </label>
                      <textarea
                        id="mensaje"
                        className={`${styles.input} ${styles.textarea} ${errors.mensaje ? styles.inputError : ""}`}
                        value={form.mensaje} onChange={set("mensaje")}
                        placeholder="Contanos cómo podemos ayudarte..."
                        rows={5}
                      />
                      <div className={styles.msgMeta}>
                        {errors.mensaje && <p className={styles.fieldError}>{errors.mensaje}</p>}
                        <span className={`${styles.charCount} ${form.mensaje.length >= MAX_MSG * 0.9 ? styles.charCountWarn : ""}`}>
                          {form.mensaje.length}/{MAX_MSG}
                        </span>
                      </div>
                    </div>

                    <p className={styles.privacyNote}>
                      <Lock size={13} />
                      Tus datos están protegidos. Leé nuestra{" "}
                      <Link to="/privacidad" className={styles.privacyLink}>Política de Privacidad</Link>.
                    </p>

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                      {loading
                        ? <><span className={styles.spinner} aria-hidden="true" /> Enviando...</>
                        : <><Send size={17} /> Enviar mensaje</>}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* ── Sidebar ── */}
            <aside className={styles.sidebar}>
              {/* Channels */}
              <div className={styles.sidebarCard}>
                <h3 className={styles.sidebarTitle}>Canales de atención</h3>
                <div className={styles.channels}>
                  {CHANNELS.map((ch) => (
                    <div key={ch.title} className={styles.channelItem}>
                      <div className={styles.channelIcon} style={{ background: `${ch.color}18`, color: ch.color }}>
                        {ch.icon}
                      </div>
                      <div className={styles.channelInfo}>
                        <strong>{ch.title}</strong>
                        <span>{ch.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQ shortcut */}
              <Link to="/faq" className={styles.faqCard}>
                <div className={styles.faqIcon}><HelpCircle size={20} /></div>
                <div className={styles.faqText}>
                  <strong>¿Buscás respuestas rápidas?</strong>
                  <p>Visitá nuestras preguntas frecuentes.</p>
                </div>
                <ChevronRight size={16} className={styles.faqArrow} />
              </Link>

              {/* Hours */}
              <div className={styles.hoursCard}>
                <div className={styles.hoursRow}>
                  <Clock size={15} className={styles.hoursIcon} />
                  <strong>Horario de atención</strong>
                </div>
                <ul className={styles.hoursList}>
                  <li><span>Lun – Vie</span><span>9:00 – 18:00</span></li>
                  <li><span>Sábados</span><span>9:00 – 13:00</span></li>
                  <li><span>Domingos</span><span>Cerrado</span></li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contacto;
