import { useState } from "react";
import { Link } from "react-router-dom";
import { Home, ChevronRight, ChevronLeft, Shield, HelpCircle, ClipboardList, Calendar } from "lucide-react";
import Navbar from "../../components/Navbar/Navbar";
import styles from "./Terminos.module.css";

const SECTIONS = [
  {
    id: "aceptacion",
    title: "1. Aceptación de los términos",
    content: "Al acceder o utilizar el sitio web y los servicios de Mi Vehículo, aceptás quedar sujeto a estos Términos y Condiciones, así como a todas las leyes y regulaciones aplicables.",
  },
  {
    id: "descripcion",
    title: "2. Descripción del servicio",
    content: "Mi Vehículo es una plataforma digital que permite a usuarios publicar, buscar y consultar anuncios de vehículos. Actuamos únicamente como intermediarios tecnológicos y no participamos en las transacciones realizadas entre usuarios.",
  },
  {
    id: "cuentas",
    title: "3. Cuentas de usuario",
    content: "Para publicar anuncios o acceder a ciertas funcionalidades, es necesario crear una cuenta. El usuario es responsable de mantener la confidencialidad de su cuenta y de todas las actividades que ocurran bajo la misma.",
  },
  {
    id: "publicaciones",
    title: "4. Publicaciones",
    content: "El usuario garantiza que la información publicada es verdadera, completa y actualizada. Mi Vehículo se reserva el derecho de modificar o eliminar publicaciones que incumplan estos Términos o que resulten sospechosas o fraudulentas.",
  },
  {
    id: "conducta",
    title: "5. Conducta del usuario",
    content: "Los usuarios se comprometen a utilizar la plataforma de manera legal, respetuosa y de buena fe. Queda prohibido publicar contenido ofensivo, engañoso, ilegal o que infrinja derechos de terceros.",
  },
  {
    id: "responsabilidades",
    title: "6. Responsabilidades",
    content: "Mi Vehículo no se responsabiliza por la veracidad de la información publicada por los usuarios, ni por el resultado de las transacciones entre particulares. Recomendamos siempre verificar el estado del vehículo y la documentación antes de cualquier operación.",
  },
  {
    id: "privacidad",
    title: "7. Privacidad y datos personales",
    content: "El tratamiento de los datos personales de los usuarios se rige por nuestra Política de Privacidad, que forma parte integral de estos Términos. Al usar la plataforma, aceptás dicha política.",
  },
  {
    id: "propiedad",
    title: "8. Propiedad intelectual",
    content: "Todo el contenido de Mi Vehículo —incluyendo logos, textos, imágenes y código— está protegido por derechos de propiedad intelectual. No está permitida su reproducción sin autorización expresa.",
  },
  {
    id: "modificaciones",
    title: "9. Modificaciones",
    content: "Mi Vehículo se reserva el derecho de modificar estos Términos en cualquier momento. Los cambios serán notificados mediante el sitio web. El uso continuado de la plataforma implica la aceptación de los nuevos términos.",
  },
  {
    id: "ley",
    title: "10. Ley aplicable y jurisdicción",
    content: "Estos Términos se rigen por las leyes de la República de El Salvador. Cualquier controversia será sometida a la jurisdicción de los Tribunales competentes de San Salvador, El Salvador.",
  },
];

const Terminos = () => {
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
            <span>Términos y condiciones</span>
          </nav>

          {/* Hero */}
          <div className={styles.heroRow}>
            <div>
              <h1 className={styles.heroTitle}>Términos y condiciones</h1>
              <p className={styles.heroSub}>
                Al utilizar Mi Vehículo, aceptás los siguientes términos y condiciones.<br />
                Leélos detenidamente.
              </p>
            </div>
            <div className={styles.heroIllustration} aria-hidden="true">
              <div className={styles.illuCircle}>
                <ClipboardList size={52} />
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
                  <ClipboardList size={16} /> Índice
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
              <strong>Compromiso con la transparencia</strong>
              <p>
                En Mi Vehículo trabajamos para brindar un entorno seguro y confiable para todos los usuarios.
                Si detectás algún incumplimiento, podés reportarlo desde nuestro{" "}
                <Link to="/contacto" className={styles.bannerLink}>Centro de ayuda</Link>.
              </p>
            </div>
          </div>

          <div className={styles.lastUpdate}>
            <Calendar size={14} />
            Última actualización:  6 de Julio de 2026 
          </div>
        </div>
      </main>
    </div>
  );
};

export default Terminos;
