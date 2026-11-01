import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Home, ChevronRight, ChevronDown, ChevronUp, Search,
  LayoutGrid, Car, Tag, FileText, Shield, User, Info, Mail, HelpCircle, MessageCircle,
} from "lucide-react";
import Navbar from "../../components/Navbar/Navbar";
import styles from "./FAQ.module.css";

const CATEGORIES = [
  { id: "todas",         label: "Todas",           icon: <LayoutGrid size={16} /> },
  { id: "compradores",   label: "Compradores",      icon: <Car size={16} /> },
  { id: "vendedores",    label: "Vendedores",        icon: <Tag size={16} /> },
  { id: "publicaciones", label: "Publicaciones",     icon: <FileText size={16} /> },
  { id: "pagos",         label: "Pagos y seguridad", icon: <Shield size={16} /> },
  { id: "cuenta",        label: "Cuenta y perfil",   icon: <User size={16} /> },
  { id: "general",       label: "General",            icon: <Info size={16} /> },
];

const FAQS = [
  { id: 1,  cat: "publicaciones", q: "¿Cómo puedo publicar mi vehículo?",                      a: "Iniciá sesión, hacé clic en \"Ofrecé tu vehículo\" y completá el formulario paso a paso. En el último paso elegís el plan: con el gratuito tu publicación queda visible al instante, y con los planes pagos apenas se confirma el pago. La primera vez que publicás te pedimos tus datos de identidad (DUI, o NIT si sos empresa)." },
  { id: 2,  cat: "publicaciones", q: "¿Es gratis publicar mi vehículo?",                        a: "Tenemos múltiples opciones: publicaciones gratuitas, destaques, planes premium y suscripciones, para que elijas la que más te guste. No cobramos comisiones sobre la venta." },
  { id: 3,  cat: "compradores",   q: "¿Cómo contacto al vendedor?",                             a: "Desde el detalle del vehículo, iniciá sesión y vas a ver los botones para llamar o escribirle por WhatsApp al vendedor, o enviarle una consulta con el formulario. Pedimos una cuenta para proteger los datos de los vendedores y evitar el spam." },
  { id: 4,  cat: "compradores",   q: "¿Cómo puedo guardar un vehículo en favoritos?",           a: "Hacé clic en el ícono de corazón que aparece en la tarjeta del vehículo o en su página de detalle. Los vehículos guardados los encontrás en la sección Favoritos de tu cuenta." },
  { id: 5,  cat: "compradores",   q: "¿Qué debo tener en cuenta al comprar un vehículo usado?", a: "Te recomendamos verificar el estado físico del vehículo, la documentación (título, tarjeta de circulación, placas) y hacer una prueba de manejo. Si es posible, consultá con un mecánico de confianza antes de cerrar la operación. Recordá que para que el traspaso sea exitoso en SERTRACEN, los números de chasis y motor deben coincidir con los de la tarjeta de circulación, y que ni el vehículo ni el vendedor deben tener esquelas pendientes de pago, gravámenes, embargos, inhibiciones ni cualquier impedimento legal (recomendamos hacer la [consulta de estado de vehículo en SERTRACEN](https://www.sertracen.com.sv/index.php/consultas-en-linea-del-registro-publico-de-vehiculos/consulta-de-estado-de-vehiculos) antes de realizar el pago). También se necesita documentación vigente: DUI para salvadoreños; tarjeta de residencia o pasaporte, más NIT, para extranjeros o empresas. No olvides revisar la [web de SERTRACEN](https://www.sertracen.com.sv/index.php/sencillo), ya que según el tipo y uso del vehículo los requisitos pueden variar." },
  { id: 6,  cat: "general",       q: "¿Cómo sé que la información de los vehículos es confiable?", a: "Para publicar, cada vendedor confirma su email y registra sus datos de identidad (DUI o NIT) en su primera publicación. Nuestro equipo puede pausar o dar de baja los avisos que no cumplan las normas; si ves algo sospechoso, escribinos desde Contacto. De todas formas, revisá siempre el vehículo y su documentación antes de pagar." },
  { id: 7,  cat: "publicaciones", q: "¿Puedo editar o eliminar mi publicación?",                a: "Sí, desde tu panel de vendedor podés editar, pausar o eliminar tus publicaciones en cualquier momento. Los cambios se reflejan de forma inmediata en el sitio." },
  { id: 8,  cat: "cuenta",        q: "¿Cómo cambio mi contraseña?",                            a: "Ingresá a tu cuenta, accedé a Configuración y seleccioná \"Cambiar contraseña\". También podés hacerlo desde el link \"¿Olvidaste tu contraseña?\" en la pantalla de inicio de sesión." },
  { id: 9,  cat: "pagos",         q: "¿Cómo está protegida mi información personal?",          a: "Tu información personal está protegida bajo nuestra Política de Privacidad. Utilizamos encriptación SSL y no compartimos tus datos con terceros sin tu consentimiento, salvo lo requerido por ley." },
  { id: 10, cat: "vendedores",    q: "¿Cuántas fotos puedo subir en mi publicación?",          a: "Depende del plan elegido: Gratuito hasta 5 fotos, Básico hasta 10 fotos y Premium hasta 15 fotos y 1 video. La suscripción anual incluye una mayor cantidad de fotos y videos. Recomendamos incluir fotos del exterior, interior, motor y cualquier detalle relevante del vehículo para atraer más interesados." },
];

// Links en las respuestas: [texto](https://...)
const LINK_RE = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;

const plainText = (text) => text.replace(LINK_RE, "$1");

const renderAnswer = (text) => {
  // split con 2 grupos de captura: [texto, label, url, texto, label, url, …]
  const parts = text.split(LINK_RE);
  return parts.map((part, i) => {
    if (i % 3 === 1) {
      return <a key={i} href={parts[i + 1]} target="_blank" rel="noopener noreferrer">{part}</a>;
    }
    return i % 3 === 2 ? null : part;
  });
};

const FAQ = () => {
  const [activeCat, setActiveCat] = useState("todas");
  const [openId, setOpenId]       = useState(null);
  const [query, setQuery]         = useState("");

  const countFor = (catId) =>
    catId === "todas"
      ? FAQS.length
      : FAQS.filter((f) => f.cat === catId).length;

  const filtered = FAQS.filter((f) => {
    const matchCat = activeCat === "todas" || f.cat === activeCat;
    const matchQ   = !query || f.q.toLowerCase().includes(query.toLowerCase()) || plainText(f.a).toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQ;
  });

  return (
    <div className={styles.page}>
      <title>Preguntas frecuentes | Mi Vehículo</title>
      <meta name="description" content="Respuestas sobre cómo publicar, comprar y vender vehículos en Mi Vehículo: planes, pagos, seguridad y trámites en El Salvador." />
      <Navbar />

      <main>
        {/* ── Hero band ── */}
        <div className={styles.heroBand}>
          <div className={styles.heroInner}>
            <nav className={styles.breadcrumb} aria-label="breadcrumb">
              <Link to="/"><Home size={13} /></Link>
              <ChevronRight size={11} />
              <span>Preguntas frecuentes</span>
            </nav>

            <div className={styles.heroRow}>
              <div className={styles.heroText}>
                <h1 className={styles.heroTitle}>Preguntas frecuentes</h1>
                <p className={styles.heroSub}>
                  Encontrá respuestas a las dudas más comunes sobre<br />
                  compras, ventas y el uso de Mi Vehículo.
                </p>
                <div className={styles.heroStats}>
                  <span><strong>{FAQS.length}</strong> preguntas</span>
                  <span><strong>{CATEGORIES.length - 1}</strong> categorías</span>
                </div>
              </div>
              <div className={styles.heroIllustration} aria-hidden="true">
                <div className={styles.illuRing}>
                  <MessageCircle size={42} strokeWidth={1.5} />
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
          {/* Search */}
          <div className={styles.searchCard}>
            <Search size={20} className={styles.searchIcon} />
            <input
              type="search"
              className={styles.searchInput}
              placeholder="Buscá tu pregunta..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setActiveCat("todas"); }}
            />
          </div>

          {/* Layout */}
          <div className={styles.layout}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
              <div className={styles.sidebarCard}>
                <h3 className={styles.catTitle}>Categorías</h3>
                <nav className={styles.catNav}>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      className={`${styles.catBtn} ${activeCat === cat.id ? styles.catBtnActive : ""}`}
                      onClick={() => { setActiveCat(cat.id); setQuery(""); }}
                    >
                      <span className={styles.catIcon}>{cat.icon}</span>
                      <span className={styles.catLabel}>{cat.label}</span>
                      <span className={`${styles.catCount} ${activeCat === cat.id ? styles.catCountActive : ""}`}>
                        {countFor(cat.id)}
                      </span>
                    </button>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Accordion */}
            <div className={styles.accordionWrap}>
              {query && (
                <p className={styles.searchHint}>
                  {filtered.length === 0
                    ? "Sin resultados para tu búsqueda"
                    : `${filtered.length} resultado${filtered.length > 1 ? "s" : ""} para "${query}"`}
                </p>
              )}

              {filtered.length === 0 && (
                <div className={styles.noResults}>
                  <div className={styles.noResultsIcon}><HelpCircle size={28} /></div>
                  <p>No encontramos preguntas para tu búsqueda.</p>
                  <button className={styles.clearBtn} onClick={() => { setQuery(""); setActiveCat("todas"); }}>
                    Ver todas las preguntas
                  </button>
                </div>
              )}

              <div className={styles.accordion}>
                {filtered.map((faq, idx) => {
                  const isOpen = openId === faq.id;
                  return (
                    <div
                      key={faq.id}
                      className={`${styles.accordionItem} ${isOpen ? styles.accordionItemOpen : ""}`}
                    >
                      <button
                        className={styles.accordionBtn}
                        onClick={() => setOpenId(isOpen ? null : faq.id)}
                        aria-expanded={isOpen}
                      >
                        <span className={styles.accordionNum}>{String(idx + 1).padStart(2, "0")}</span>
                        <span className={styles.accordionQ}>{faq.q}</span>
                        <span className={styles.accordionChevron}>
                          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </span>
                      </button>
                      {isOpen && (
                        <div className={styles.accordionAnswer}>
                          <p>{renderAnswer(faq.a)}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CTA banner */}
          <div className={styles.ctaBanner}>
            <div className={styles.ctaLeft}>
              <div className={styles.ctaIcon}><Mail size={22} /></div>
              <div>
                <strong>¿No encontraste lo que buscabas?</strong>
                <p>Nuestro equipo está para ayudarte. Escribinos y te responderemos a la brevedad.</p>
              </div>
            </div>
            <Link to="/contacto" className={styles.ctaBtn}>
              Contactar ahora <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FAQ;
