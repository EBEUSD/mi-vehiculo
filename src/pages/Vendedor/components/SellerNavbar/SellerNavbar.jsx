import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Heart,
  Car,
  Bike,
  Truck,
  LogIn,
  User,
  ChevronDown,
  Menu,
  LayoutDashboard,
  UserCircle,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../../../context/AuthContext";
import styles from "./SellerNavbar.module.css";

const mainLinks = [
  { label: "Categorías",          path: "/vehiculos" },
  { label: "Ofrecé tu vehículo",  path: "/vendedor"  },
  { label: "Favoritos",           path: "/favoritos" },
];

const categoryLinks = [
  { label: "Autos",      path: "/vehiculos?categoria=autos",      icon: Car   },
  { label: "Motos",      path: "/vehiculos?categoria=motos",      icon: Bike  },
  { label: "Camionetas", path: "/vehiculos?categoria=camionetas", icon: Truck },
  { label: "Camiones",   path: "/vehiculos?categoria=camiones",   icon: Truck },
];

const SellerNavbar = () => {
  const navigate  = useNavigate();
  const { user, signOut } = useAuth();
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef   = useRef(null);

  const fullName   = user?.user_metadata?.full_name || user?.email || "Usuario";
  const firstName  = fullName.split(" ")[0];
  const initial    = firstName.charAt(0).toUpperCase();

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

  const handleSearch = (event) => {
    event.preventDefault();
    const query = new FormData(event.currentTarget).get("search")?.toString().trim();
    if (!query) return;
    navigate(`/vehiculos?busqueda=${encodeURIComponent(query)}`);
  };

  const handleSignOut = async () => {
    setDropOpen(false);
    await signOut();
    navigate("/");
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.topRow}>
        <div className={styles.topInner}>
          <Link to="/" className={styles.logo} aria-label="Ir al inicio">
            <div className={styles.logoMark}></div>
            <span>mi vehículo</span>
          </Link>

          <form className={styles.searchForm} onSubmit={handleSearch}>
            <Search size={21} />
            <input
              name="search"
              type="text"
              placeholder="Buscar por marca, modelo, año..."
            />
            <button type="submit">Buscar</button>
          </form>

          <nav className={styles.mainNav}>
            {mainLinks.map((link) => (
              <Link key={link.label} to={link.path}>{link.label}</Link>
            ))}

            {/* Account — auth-aware */}
            {user ? (
              <div className={styles.accountWrap} ref={dropRef}>
                <button
                  type="button"
                  className={styles.accountButton}
                  onClick={() => setDropOpen((v) => !v)}
                  aria-expanded={dropOpen}
                >
                  <span className={styles.accountAvatar}>{initial}</span>
                  <span>{firstName}</span>
                  <ChevronDown
                    size={15}
                    className={dropOpen ? styles.chevronOpen : styles.chevron}
                  />
                </button>

                {dropOpen && (
                  <div className={styles.accountMenu}>
                    <div className={styles.accountMenuHeader}>
                      <strong>{fullName}</strong>
                      {user.email && user.email !== fullName && (
                        <span>{user.email}</span>
                      )}
                    </div>
                    <div className={styles.accountMenuDivider} />
                    <Link
                      to="/vendedor"
                      className={styles.accountMenuItem}
                      onClick={() => setDropOpen(false)}
                    >
                      <LayoutDashboard size={15} /> Mi panel
                    </Link>
                    <Link
                      to="/vendedor?tab=perfil"
                      className={styles.accountMenuItem}
                      onClick={() => setDropOpen(false)}
                    >
                      <UserCircle size={15} /> Ver mi perfil
                    </Link>
                    <div className={styles.accountMenuDivider} />
                    <button className={styles.accountMenuSignOut} onClick={handleSignOut}>
                      <LogOut size={15} /> Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className={`${styles.accountButton} ${styles.loginLink}`}>
                <LogIn size={17} /> Iniciar sesión
              </Link>
            )}

            <button
              type="button"
              className={styles.favoriteButton}
              onClick={() => navigate("/favoritos")}
              aria-label="Ir a favoritos"
            >
              <Heart size={21} fill="currentColor" />
            </button>

            <button type="button" className={styles.mobileButton}>
              <Menu size={26} />
            </button>
          </nav>
        </div>
      </div>

      <div className={styles.bottomRow}>
        <div className={styles.bottomInner}>
          <nav className={styles.categoryNav}>
            {categoryLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.label} to={item.path}>
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <nav className={styles.infoNav}>
            <Link to="/faq">Consejos e información</Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default SellerNavbar;
