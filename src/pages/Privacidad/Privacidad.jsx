import { useState } from "react";
import { Link } from "react-router-dom";
import { Home, ChevronRight, ChevronLeft, Shield, HelpCircle, Lock, Calendar, AlignLeft } from "lucide-react";
import Navbar from "../../components/Navbar/Navbar";
import styles from "./Privacidad.module.css";

const SECTIONS = [
  {
    id: "recopilamos",
    title: "1. Información que recopilamos",
    content: "Podemos recopilar información personal que nos brindás voluntariamente al registrarte, publicar un anuncio, contactarnos o utilizar nuestros servicios. Esto puede incluir: nombre, email, teléfono, ubicación, información del vehículo y cualquier otra información necesaria para ofrecerte una mejor experiencia.",
  },
  {
    id: "usamos",
    title: "2. Cómo usamos tu información",
    content: "Utilizamos tu información para: brindar, operar y mejorar nuestros servicios, procesar publicaciones y consultas, comunicarnos contigo, enviarte novedades (si das tu consentimiento) y cumplir con obligaciones legales.",
  },
  {
    id: "compartir",
    title: "3. Compartir información",
    content: "No vendemos ni alquilamos tu información personal. Podemos compartirla con terceros únicamente en los siguientes casos: proveedores que nos ayudan a operar el sitio, cumplimiento de obligaciones legales o para proteger nuestros derechos y seguridad.",
  },
  {
    id: "cookies",
    title: "4. Cookies y tecnologías similares",
    content: "Usamos cookies y tecnologías similares para mejorar tu experiencia, recordar tus preferencias y analizar el uso del sitio. Podés gestionar tus preferencias de cookies desde la configuración de tu navegador.",
  },
  {
    id: "seguridad",
    title: "5. Seguridad de la información",
    content: "Implementamos medidas técnicas y organizativas razonables para proteger tu información contra acceso no autorizado, pérdida o alteración. Sin embargo, ningún sistema es 100% seguro, por lo que no podemos garantizar seguridad absoluta.",
  },
  {
    id: "derechos",
    title: "6. Tus derechos",
    content: "Tenés derecho a acceder, rectificar, actualizar o eliminar tus datos personales en cualquier momento. Para ejercer estos derechos, podés contactarnos desde nuestra página de contacto o enviarnos un email directamente.",
  },
  {
    id: "menores",
    title: "7. Menores de edad",
    content: "Mi Vehículo no está dirigido a menores de 18 años. No recopilamos intencionalmente información personal de menores. Si creés que un menor nos proporcionó datos, por favor contactanos para eliminar dicha información.",
  },
  {
    id: "cambios",
    title: "8. Cambios en esta política",
    content: "Podemos actualizar esta Política de Privacidad periódicamente. Te notificaremos los cambios relevantes mediante el sitio web. El uso continuado de la plataforma luego de los cambios implica la aceptación de la nueva política.",
  },
  {
    id: "contacto",
    title: "9. Contacto",
    content: "Si tenés preguntas o inquietudes sobre esta Política de Privacidad o el tratamiento de tus datos personales, podés contactarnos desde nuestra página de contacto. Nos comprometemos a responderte dentro de los 5 días hábiles.",
  },
];

const Privacidad = () => {
  const [activeId, setActiveId] = useState(SECTIONS[0].id);

  const activeIdx     = SECTIONS.findIndex((s) => s.id === activeId);
  const activeSection = SECTIONS[activeIdx];
  const prevSection   = SECTIONS[activeIdx - 1] ?? null;
  const nextSection   = SECTIONS[activeIdx + 1] ?? null;

  return (
    <div className={styles.page}>
      <Navbar />

      <main>
        <div className={styles.shell}>
          {/* Breadcrumb */}
          <nav className={styles.breadcrumb} aria-label="breadcrumb">
            <Link to="/"><Home size={14} /></Link>
            <ChevronRight size={12} />
            <span>Política de privacidad</span>
          </nav>

          {/* Hero */}
          <div className={styles.heroRow}>
            <div>
              <h1 className={styles.heroTitle}>Política de privacidad</h1>
              <p className={styles.heroSub}>
                En Mi Vehículo, protegemos tu privacidad y tus datos personales.<br />
                Conocé cómo recopilamos, usamos y cuidamos tu información.
              </p>
            </div>
            <div className={styles.heroIllustration} aria-hidden="true">
              <div className={styles.illuCircle}>
                <Lock size={52} />
                <div className={styles.illuBadge}><Shield size={18} /></div>
              </div>
            </div>
          </div>

          {/* Layout */}
          <div className={styles.layout}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
              <div className={styles.indexCard}>
                <h3 className={styles.indexTitle}>
                  <AlignLeft size={16} /> Índice
                </h3>
                <nav className={styles.indexNav}>
                  {SECTIONS.map((s) => (
                    <button
                      key={s.id}
                      className={`${styles.indexLink} ${activeId === s.id ? styles.indexLinkActive : ""}`}
                      onClick={() => setActiveId(s.id)}
                    >
                      {s.title}
                    </button>
                  ))}
                </nav>
              </div>

              <Link to="/contacto" className={styles.doubtCard}>
                <div className={styles.doubtIcon}><HelpCircle size={18} /></div>
                <div className={styles.doubtText}>
                  <strong>¿Tenés dudas?</strong>
                  <p>Escribinos desde nuestra página de contacto.</p>
                </div>
                <ChevronRight size={16} className={styles.doubtArrow} />
              </Link>
            </aside>

            {/* Content panel */}
            <div className={styles.contentCard} key={activeId}>
              <div className={styles.sectionBadge}>{activeIdx + 1} / {SECTIONS.length}</div>
              <h2 className={styles.sectionTitle}>{activeSection.title}</h2>
              <p className={styles.sectionText}>{activeSection.content}</p>

              {/* Prev / Next */}
              <div className={styles.sectionNav}>
                <button
                  className={styles.navBtn}
                  onClick={() => prevSection && setActiveId(prevSection.id)}
                  disabled={!prevSection}
                >
                  <ChevronLeft size={16} /> Anterior
                </button>
                <span className={styles.navDots}>
                  {SECTIONS.map((s) => (
                    <button
                      key={s.id}
                      className={`${styles.navDot} ${activeId === s.id ? styles.navDotActive : ""}`}
                      onClick={() => setActiveId(s.id)}
                      aria-label={s.title}
                    />
                  ))}
                </span>
                <button
                  className={`${styles.navBtn} ${styles.navBtnNext}`}
                  onClick={() => nextSection && setActiveId(nextSection.id)}
                  disabled={!nextSection}
                >
                  Siguiente <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Footer banner */}
          <div className={styles.footerBanner}>
            <div className={styles.footerBannerIcon}><Shield size={22} /></div>
            <div>
              <strong>Tu privacidad es importante</strong>
              <p>
                Trabajamos constantemente para proteger tu información y garantizar un entorno
                seguro y confiable en Mi Vehículo.
              </p>
            </div>
          </div>

          <div className={styles.lastUpdate}>
            <Calendar size={14} />
            Última actualización: 6 de Julio de 2026
          </div>
        </div>
      </main>
    </div>
  );
};

export default Privacidad;
