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
import { HiMenuAlt3 } from "react-icons/hi";
import logoVehiculo from "../../assets/logo-vehiculo.png";

const Navbar = () => {
  return (
    <header className={styles.wrapper}>
      <div className={styles.topBar}>
        <div className={styles.container}>
          <a href="#" className={styles.logo}>
            <img src={logoVehiculo} alt="Mi Vehículo" className={styles.logoImg} />
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

          <button className={styles.mobileMenuBtn} aria-label="Abrir menú">
            <HiMenuAlt3 />
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
    </header>
  );
};

export default Navbar;