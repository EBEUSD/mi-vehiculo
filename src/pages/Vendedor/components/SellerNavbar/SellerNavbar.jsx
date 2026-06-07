import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Heart,
  Car,
  Bike,
  Truck,
  Package,
  Wrench,
  LogIn,
  User,
  ChevronDown,
  Menu,
} from "lucide-react";

import styles from "./SellerNavbar.module.css";

const mainLinks = [
  {
    label: "Categorías",
    path: "/vehiculos",
  },
  {
    label: "Ofrecé tu vehículo",
    path: "/vendedor",
  },
  {
    label: "Favoritos",
    path: "/favoritos",
  },
  {
    label: "Iniciar sesión",
    path: "/login",
  },
];

const categoryLinks = [
  {
    label: "Autos",
    path: "/vehiculos?categoria=autos",
    icon: Car,
  },
  {
    label: "Motos",
    path: "/vehiculos?categoria=motos",
    icon: Bike,
  },
  {
    label: "Camionetas",
    path: "/vehiculos?categoria=camionetas",
    icon: Truck,
  },
  {
    label: "Camiones",
    path: "/vehiculos?categoria=camiones",
    icon: Truck,
  },
  {
    label: "Repuestos",
    path: "/repuestos",
    icon: Package,
  },
  {
    label: "Accesorios",
    path: "/accesorios",
    icon: Wrench,
  },
];

const SellerNavbar = () => {
  const navigate = useNavigate();

  const handleSearch = (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const query = formData.get("search")?.toString().trim();

    if (!query) return;

    navigate(`/vehiculos?busqueda=${encodeURIComponent(query)}`);
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
              <Link key={link.label} to={link.path}>
                {link.label}
              </Link>
            ))}

            <button type="button" className={styles.accountButton}>
              <User size={18} />
              <span>Mi cuenta</span>
              <ChevronDown size={16} />
            </button>

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
            <Link to="/financiacion">Financiación</Link>
            <Link to="/consejos">Consejos e información</Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default SellerNavbar;