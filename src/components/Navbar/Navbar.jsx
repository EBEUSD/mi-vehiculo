import { useState } from "react";
import styles from "./Navbar.module.css";
import {
  FaCarSide,
  FaMotorcycle,
  FaTruckPickup,
  FaTruck,
  FaCog,
  FaShoppingCart,
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
          <a href="#" className={styles.logo} onClick={handleCloseMenu}>
            <img
              src={logoVehiculo}
              alt="Mi Vehículo"
              className={styles.logoImg}
            />
          </a>

          <div className={styles.search}>
            <input
              type="text"
              placeholder="Buscar por marca, modelo, año..."
            />
            <button>Buscar</button>
          </div>

          <nav className={styles.topNav}>
            <a href="#">Categorías</a>
            <a href="#">Ofrecé tu vehículo</a>
            <a href="#">Iniciar sesión</a>
            <a href="#" className={styles.cartBtn} aria-label="Carrito">
              <FaShoppingCart />
            </a>
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
            <a href="#">
              <FaCarSide />
              <span>Autos</span>
            </a>
            <a href="#">
              <FaMotorcycle />
              <span>Motos</span>
            </a>
            <a href="#">
              <FaTruckPickup />
              <span>Camionetas</span>
            </a>
            <a href="#">
              <FaTruck />
              <span>Camiones</span>
            </a>
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
        className={`${styles.mobilePanel} ${
          menuOpen ? styles.mobilePanelOpen : ""
        }`}
      >
        <div className={styles.mobilePanelInner}>
          <nav className={styles.mobileNavPrimary}>
            <a href="#" onClick={handleCloseMenu}>
              Categorías
            </a>
            <a href="#" onClick={handleCloseMenu}>
              Ofrecé tu vehículo
            </a>
            <a href="#" onClick={handleCloseMenu}>
              Iniciar sesión
            </a>
            <a href="#" onClick={handleCloseMenu}>
              Favoritos
            </a>
          </nav>

          <div className={styles.mobileDivider} />

          <nav className={styles.mobileNavCategories}>
            <a href="#" onClick={handleCloseMenu}>
              <FaCarSide />
              <span>Autos</span>
            </a>
            <a href="#" onClick={handleCloseMenu}>
              <FaMotorcycle />
              <span>Motos</span>
            </a>
            <a href="#" onClick={handleCloseMenu}>
              <FaTruckPickup />
              <span>Camionetas</span>
            </a>
            <a href="#" onClick={handleCloseMenu}>
              <FaTruck />
              <span>Camiones</span>
            </a>
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
            <a href="#" onClick={handleCloseMenu} className={styles.mobileCart}>
              <FaShoppingCart />
              <span>Carrito</span>
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;