import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";
import {
  ChevronDown, CircleUser, Heart, LayoutGrid, LogOut, Menu, Plus, Search, User, X,
} from "lucide-react";
import logoVehiculo from "../../assets/logo-vehiculo.png";
import { useAuth } from "../../context/AuthContext";
import { VEHICLE_CATEGORIES, PRODUCT_CATEGORIES } from "../../lib/categories";

// Accesos rápidos de la barra secundaria
const QUICK_LINKS = [
  ...VEHICLE_CATEGORIES.filter((c) => ["carros", "motos", "camiones", "maquinaria"].includes(c.id))
    .map((c) => ({ label: c.short, to: `/vehiculos?type=${c.id}&sortBy=relevant&page=1` })),
  ...PRODUCT_CATEGORIES.map((c) => ({ label: c.label, to: c.href })),
];

const Navbar = () => {
  const [menuOpen, setMenuOpen]   = useState(false);
  const [dropOpen, setDropOpen]   = useState(false);
  const [query, setQuery]         = useState("");
  const { user, signOut }         = useAuth();
  const navigate                  = useNavigate();
  const dropRef                   = useRef(null);

  const isAdmin   = user?.role === "ADMIN";
  const fullName  = user?.user_metadata?.full_name || user?.email || "Usuario";
  const firstName = fullName.split(" ")[0];
  const initial   = firstName.charAt(0).toUpperCase();

  /* close dropdown on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleToggleMenu = () => setMenuOpen((p) => !p);
  const handleCloseMenu  = () => setMenuOpen(false);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    handleCloseMenu();
    navigate(`/vehiculos?${new URLSearchParams({ ...(q && { q }), sortBy: "relevant", page: "1" })}`);
  };

  const handleSignOut = async () => {
    setDropOpen(false);
    handleCloseMenu();
    await signOut();
    navigate("/");
  };

  return (
    <header className={styles.wrapper}>
      <div className={styles.topBar}>
        <div className={styles.container}>
          <Link to="/" className={styles.logo} onClick={handleCloseMenu}>
            <img src={logoVehiculo} alt="Mi Vehículo" className={styles.logoImg} width="187" height="34" />
          </Link>

          <form className={styles.search} onSubmit={handleSearch} role="search">
            <Search size={17} className={styles.searchIcon} aria-hidden="true" />
            <input
              type="search"
              placeholder="Buscar por marca, modelo, año..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Buscar vehículos"
            />
            <button type="submit">Buscar</button>
          </form>

          <nav className={styles.topNav}>
            <Link to="/#categorias">Categorías</Link>
            <Link to="/favoritos"><Heart size={16} /> Favoritos</Link>

            {/* Account — dropdown when logged in */}
            {user ? (
              <div className={styles.accountWrap} ref={dropRef}>
                <button
                  type="button"
                  className={styles.accountDropBtn}
                  onClick={() => setDropOpen((v) => !v)}
                  aria-expanded={dropOpen}
                >
                  <span className={`${styles.accountAvatar} ${isAdmin ? styles.adminAvatar : ""}`}>
                    {initial}
                  </span>
                  {isAdmin ? "Admin" : "Mi cuenta"}
                  <ChevronDown
                    size={14}
                    aria-hidden="true"
                    className={dropOpen ? styles.chevronOpen : styles.chevron}
                  />
                </button>

                {dropOpen && (
                  <div className={styles.accountMenu}>
                    <div className={`${styles.accountMenuHeader} ${isAdmin ? styles.adminMenuHeader : ""}`}>
                      <strong>{fullName}</strong>
                      <span>{isAdmin ? "Administrador" : user.email}</span>
                    </div>
                    <div className={styles.accountMenuDivider} />

                    {isAdmin ? (
                      <Link
                        to="/admin"
                        className={styles.accountMenuItem}
                        onClick={() => setDropOpen(false)}
                      >
                        <LayoutGrid size={14} aria-hidden="true" /> Panel de administración
                      </Link>
                    ) : (
                      <>
                        <Link
                          to="/vendedor"
                          className={styles.accountMenuItem}
                          onClick={() => setDropOpen(false)}
                        >
                          <LayoutGrid size={14} aria-hidden="true" /> Mi panel
                        </Link>
                        <Link
                          to="/vendedor?tab=perfil"
                          className={styles.accountMenuItem}
                          onClick={() => setDropOpen(false)}
                        >
                          <CircleUser size={14} aria-hidden="true" /> Ver mi perfil
                        </Link>
                      </>
                    )}

                    <div className={styles.accountMenuDivider} />
                    <button className={styles.accountMenuSignOut} onClick={handleSignOut}>
                      <LogOut size={14} aria-hidden="true" /> Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login"><User size={16} /> Iniciar sesión</Link>
            )}

            <Link to="/publicar/nuevo" className={styles.ctaBtn}>
              <Plus size={16} strokeWidth={2.6} /> Ofrecé tu vehículo
            </Link>
          </nav>

          <button
            className={styles.mobileMenuBtn}
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={handleToggleMenu}
            type="button"
          >
            {menuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div className={styles.subBar}>
        <div className={styles.container}>
          <nav className={styles.subNav}>
            {QUICK_LINKS.map((l) => <Link key={l.label} to={l.to}>{l.label}</Link>)}
          </nav>

          <nav className={styles.subNavRight}>
            <Link to="/nosotros">Misión, visión y valores</Link>
            <Link to="/faq">Consejos e información</Link>
          </nav>
        </div>
      </div>

      {/* Mobile panel */}
      {/* inert cuando está cerrado: sus links no reciben foco ni los lee el lector de pantalla */}
      <div
        id="mobile-menu"
        className={`${styles.mobilePanel} ${menuOpen ? styles.mobilePanelOpen : ""}`}
        inert={!menuOpen}
      >
        <div className={styles.mobilePanelInner}>
          <Link to="/publicar/nuevo" onClick={handleCloseMenu} className={styles.mobileCta}>
            <Plus size={18} strokeWidth={2.6} /> Ofrecé tu vehículo
          </Link>

          <nav className={styles.mobileNavPrimary}>
            <Link to="/#categorias" onClick={handleCloseMenu}>Categorías</Link>
            <Link to="/favoritos" onClick={handleCloseMenu}>Favoritos</Link>
            {user ? (
              <>
                <Link to="/vendedor" onClick={handleCloseMenu}>Mi panel</Link>
                <button className={styles.mobileAuthBtn} onClick={handleSignOut} type="button">
                  Cerrar sesión
                </button>
              </>
            ) : (
              <Link to="/login" onClick={handleCloseMenu}>Iniciar sesión</Link>
            )}
          </nav>

          <div className={styles.mobileDivider} />

          <nav className={styles.mobileNavCategories}>
            {QUICK_LINKS.map((l) => (
              <Link key={l.label} to={l.to} onClick={handleCloseMenu}>{l.label}</Link>
            ))}
          </nav>

          <div className={styles.mobileDivider} />

          <nav className={styles.mobileNavSecondary}>
            <Link to="/nosotros" onClick={handleCloseMenu}>Misión, visión y valores</Link>
            <Link to="/faq" onClick={handleCloseMenu}>Consejos e información</Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
