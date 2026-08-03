import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";
import {
  FaCarSide,
  FaMotorcycle,
  FaTruckPickup,
  FaTruck,
  FaHeart,
  FaChevronDown,
  FaThLarge,
  FaUserCircle,
  FaSignOutAlt,
} from "react-icons/fa";
import { HiMenuAlt3, HiX } from "react-icons/hi";
import logoVehiculo from "../../assets/logo-vehiculo.png";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const [menuOpen, setMenuOpen]   = useState(false);
  const [dropOpen, setDropOpen]   = useState(false);
  const { user, signOut }         = useAuth();
  const navigate                  = useNavigate();
  const dropRef                   = useRef(null);

  const isAdmin   = user?.id === "mock-admin-001";
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
            <img src={logoVehiculo} alt="Mi Vehículo" className={styles.logoImg} />
          </Link>

          <div className={styles.search}>
            <input type="text" placeholder="Buscar por marca, modelo, año..." />
            <button>Buscar</button>
          </div>

          <nav className={styles.topNav}>
            <Link to="/vehiculos">Categorías</Link>
            <Link to="/vendedor">Ofrecé tu vehículo</Link>
            <Link to="/favoritos">Favoritos</Link>

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
                  <FaChevronDown
                    size={11}
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
                        <FaThLarge size={13} /> Panel de administración
                      </Link>
                    ) : (
                      <>
                        <Link
                          to="/vendedor"
                          className={styles.accountMenuItem}
                          onClick={() => setDropOpen(false)}
                        >
                          <FaThLarge size={13} /> Mi panel
                        </Link>
                        <Link
                          to="/vendedor?tab=perfil"
                          className={styles.accountMenuItem}
                          onClick={() => setDropOpen(false)}
                        >
                          <FaUserCircle size={13} /> Ver mi perfil
                        </Link>
                      </>
                    )}

                    <div className={styles.accountMenuDivider} />
                    <button className={styles.accountMenuSignOut} onClick={handleSignOut}>
                      <FaSignOutAlt size={13} /> Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login">Iniciar sesión</Link>
            )}

            <Link to="/favoritos" className={styles.cartBtn} aria-label="Favoritos">
              <FaHeart />
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
            <Link to="/vehiculos"><FaCarSide /><span>Autos</span></Link>
            <Link to="/vehiculos?type=Motos"><FaMotorcycle /><span>Motos</span></Link>
            <Link to="/vehiculos?type=Camionetas"><FaTruckPickup /><span>Camionetas</span></Link>
            <Link to="/vehiculos?type=Camiones"><FaTruck /><span>Camiones</span></Link>
          </nav>

          <nav className={styles.subNavRight}>
            <Link to="/faq">Consejos e información</Link>
          </nav>
        </div>
      </div>

      {/* Mobile panel */}
      <div className={`${styles.mobilePanel} ${menuOpen ? styles.mobilePanelOpen : ""}`}>
        <div className={styles.mobilePanelInner}>
          <nav className={styles.mobileNavPrimary}>
            <Link to="/vehiculos" onClick={handleCloseMenu}>Categorías</Link>
            <Link to="/vendedor"  onClick={handleCloseMenu}>Ofrecé tu vehículo</Link>
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
            <Link to="/vehiculos" onClick={handleCloseMenu}><FaCarSide /><span>Autos</span></Link>
            <Link to="/vehiculos?type=Motos" onClick={handleCloseMenu}><FaMotorcycle /><span>Motos</span></Link>
            <Link to="/vehiculos?type=Camionetas" onClick={handleCloseMenu}><FaTruckPickup /><span>Camionetas</span></Link>
            <Link to="/vehiculos?type=Camiones" onClick={handleCloseMenu}><FaTruck /><span>Camiones</span></Link>
          </nav>

          <div className={styles.mobileDivider} />

          <nav className={styles.mobileNavSecondary}>
            <Link to="/faq" onClick={handleCloseMenu}>Consejos e información</Link>
            <Link to="/favoritos" onClick={handleCloseMenu} className={styles.mobileCart}>
              <FaHeart /><span>Favoritos</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
