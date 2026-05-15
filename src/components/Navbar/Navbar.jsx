import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Navbar.module.css";
import {
  FaCarSide,
  FaMotorcycle,
  FaTruckPickup,
  FaTruck,
  FaCog,
  FaHeart,
} from "react-icons/fa";
import { MdLogin } from "react-icons/md";
import { HiMenuAlt3, HiX } from "react-icons/hi";
import logoVehiculo from "../../assets/logo-vehiculo.png";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleToggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  const handleCloseMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className={styles.wrapper}>
      <div className={styles.topBar}>
        <div className={styles.container}>
          <Link to="/" className={styles.logo} onClick={handleCloseMenu}>
            <img
              src={logoVehiculo}
              alt="Mi Vehículo"
              className={styles.logoImg}
            />
          </Link>

          <div className={styles.search}>
            <input
              type="text"
              placeholder="Buscar por marca, modelo, año..."
            />
            <button>Buscar</button>
          </div>

          <nav className={styles.topNav}>
            <Link to="/vehiculos">Categorías</Link>
            <a href="#">Ofrecé tu vehículo</a>
            <Link to="/favoritos">Favoritos</Link>
            <a href="#">Iniciar sesión</a>
            <Link to="/favoritos" className={styles.cartBtn} aria-label="Favoritos">
              <FaHeart  />
            </Link>
          </nav>

          <button
            className={styles.mobileMenuBtn}
            aria-label="Abrir menú"
            onClick={handleToggleMenu}
            type="button"
          >
            {menuOpen ? <HiX /> : <HiMenuAlt3 />}
          </button>
        </div>
      </div>

      <div className={styles.subBar}>
        <div className={styles.container}>
          <nav className={styles.subNav}>
            <Link to="/vehiculos">
              <FaCarSide />
              <span>Autos</span>
            </Link>
            <Link to="/vehiculos?type=Motos">
              <FaMotorcycle />
              <span>Motos</span>
            </Link>
            <Link to="/vehiculos?type=Camionetas">
              <FaTruckPickup />
              <span>Camionetas</span>
            </Link>
            <Link to="/vehiculos?type=Camiones">
              <FaTruck />
              <span>Camiones</span>
            </Link>
            <a href="#">
              <FaCog />
              <span>Repuestos</span>
            </a>
            <a href="#">
              <MdLogin />
              <span>Accesorios</span>
            </a>
          </nav>

          <nav className={styles.subNavRight}>
            <a href="#">Financiación</a>
            <a href="#">Consejos e información</a>
          </nav>
        </div>
      </div>

      <div
        className={`${styles.mobilePanel} ${menuOpen ? styles.mobilePanelOpen : ""
          }`}
      >
        <div className={styles.mobilePanelInner}>
          <nav className={styles.mobileNavPrimary}>
            <Link to="/vehiculos" onClick={handleCloseMenu}>
              Categorías
            </Link>
            <a href="#" onClick={handleCloseMenu}>
              Ofrecé tu vehículo
            </a>
            <Link to="/favoritos" onClick={handleCloseMenu}>
              Favoritos
            </Link>
            <a href="#" onClick={handleCloseMenu}>
              Iniciar sesión
            </a>
          </nav>

          <div className={styles.mobileDivider} />

          <nav className={styles.mobileNavCategories}>
            <Link to="/vehiculos" onClick={handleCloseMenu}>
              <FaCarSide />
              <span>Autos</span>
            </Link>
            <Link to="/vehiculos?type=Motos" onClick={handleCloseMenu}>
              <FaMotorcycle />
              <span>Motos</span>
            </Link>
            <Link to="/vehiculos?type=Camionetas" onClick={handleCloseMenu}>
              <FaTruckPickup />
              <span>Camionetas</span>
            </Link>
            <Link to="/vehiculos?type=Camiones" onClick={handleCloseMenu}>
              <FaTruck />
              <span>Camiones</span>
            </Link>
            <a href="#" onClick={handleCloseMenu}>
              <FaCog />
              <span>Repuestos</span>
            </a>
            <a href="#" onClick={handleCloseMenu}>
              <MdLogin />
              <span>Accesorios</span>
            </a>
          </nav>

          <div className={styles.mobileDivider} />

          <nav className={styles.mobileNavSecondary}>
            <a href="#" onClick={handleCloseMenu}>
              Financiación
            </a>
            <a href="#" onClick={handleCloseMenu}>
              Consejos e información
            </a>
            <Link
              to="/favoritos"
              onClick={handleCloseMenu}
              className={styles.mobileCart}
            >
              <FaHeart />
              <span>Favoritos</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;