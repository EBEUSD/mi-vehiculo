import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Home, Search } from "lucide-react";
import Navbar from "../../components/Navbar/Navbar";
import { VEHICLE_CATEGORIES } from "../../lib/categories";
import styles from "./NotFound.module.css";

const QUICK_CATEGORIES = VEHICLE_CATEGORIES.slice(0, 6);

const NotFound = () => {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams({ ...(q.trim() && { q: q.trim() }), sortBy: "relevant", page: "1" });
    navigate(`/vehiculos?${params}`);
  };

  // Si se llegó desde otra página del sitio se puede volver; si no (link externo), al inicio
  const canGoBack = window.history.state?.idx > 0;

  return (
    <div className={styles.page}>
      <title>Página no encontrada | Mi Vehículo</title>
      <meta name="description" content="La página que buscás no existe o fue movida. Volvé al inicio de Mi Vehículo." />
      <meta name="robots" content="noindex" />
      <Navbar />

      <main className={styles.hero}>
        <div className={styles.inner}>
          <svg className={styles.illustration} viewBox="0 0 320 120" aria-hidden="true">
            {/* Ruta que se corta */}
            <path d="M0 96 H196" className={styles.roadLine} />
            <path d="M8 96 H188" className={styles.roadDash} />
            <path d="M196 96 l14 -6 l10 10 l12 -8" className={styles.roadBreak} />
            {/* Cartel */}
            <rect x="236" y="34" width="66" height="40" rx="8" className={styles.sign} />
            <path d="M269 74 V100" className={styles.signPole} />
            <text x="269" y="61" textAnchor="middle" className={styles.signText}>404</text>
            {/* Auto */}
            <g className={styles.car}>
              <path d="M70 86 h-8 a4 4 0 0 1 -4 -4 v-8 a6 6 0 0 1 4 -5.6 l14 -4.4 l12 -12 a8 8 0 0 1 5.6 -2.4 h34 a8 8 0 0 1 6.4 3.2 l10 12.8 l14 2 a6 6 0 0 1 5 6 v8.4 a4 4 0 0 1 -4 4 h-8" className={styles.carBody} />
              <path d="M96 60 l8 -8 h14 v8 z M124 52 h10 l6 8 h-16 z" className={styles.carWindow} />
              <circle cx="80" cy="86" r="9" className={styles.wheel} />
              <circle cx="146" cy="86" r="9" className={styles.wheel} />
            </g>
          </svg>

          <p className={styles.code}>Error 404</p>
          <h1 className={styles.title}>Esta ruta no lleva a ningún lado</h1>
          <p className={styles.sub}>
            La página que buscás no existe, cambió de dirección o la publicación ya no está disponible.
          </p>

          <form className={styles.search} onSubmit={handleSearch} role="search">
            <label htmlFor="nf-search" className="sr-only">Buscar vehículos</label>
            <Search size={18} className={styles.searchIcon} aria-hidden="true" />
            <input
              id="nf-search"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscá por marca, modelo o año"
              className={styles.searchInput}
            />
            <button type="submit" className={styles.searchBtn}>Buscar</button>
          </form>

          <div className={styles.actions}>
            <Link to="/" className={styles.btnPrimary}>
              <Home size={17} aria-hidden="true" /> Ir al inicio
            </Link>
            {canGoBack && (
              <button type="button" className={styles.btnOutline} onClick={() => navigate(-1)}>
                <ArrowLeft size={17} aria-hidden="true" /> Volver atrás
              </button>
            )}
          </div>

          <nav className={styles.quick} aria-label="Categorías populares">
            <p className={styles.quickTitle}>O explorá una categoría</p>
            <ul className={styles.quickList}>
              {QUICK_CATEGORIES.map(({ id, short, icon: Icon }) => (
                <li key={id}>
                  <Link to={`/vehiculos?type=${id}&sortBy=relevant&page=1`} className={styles.quickItem}>
                    <Icon size={18} aria-hidden="true" />
                    {short}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <p className={styles.help}>
            ¿Creés que es un error? <Link to="/contacto">Avisanos</Link>.
          </p>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
