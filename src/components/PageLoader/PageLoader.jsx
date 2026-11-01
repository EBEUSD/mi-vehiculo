import logoVehiculo from "../../assets/logo-vehiculo.png";
import styles from "./PageLoader.module.css";

// Pantalla de carga de marca. Aparece con un pequeño retraso (CSS) para no
// parpadear cuando la carga es instantánea.
//   fullScreen: ocupa toda la pantalla (cambio de ruta, validación de sesión)
//   sin fullScreen: bloque dentro de una página que ya tiene navbar
const PageLoader = ({ label = "Cargando…", fullScreen = true }) => (
  <div
    className={`${styles.wrap} ${fullScreen ? styles.fullScreen : ""}`}
    role="status"
    aria-live="polite"
    aria-busy="true"
  >
    <div className={styles.inner}>
      {fullScreen && (
        <img src={logoVehiculo} alt="" className={styles.logo} width="176" height="32" />
      )}
      <div className={styles.road} aria-hidden="true">
        {/* Mismo auto que la ilustración de la 404 */}
        <svg className={styles.car} viewBox="56 42 108 54" width="54" height="27">
          <path className={styles.carBody} d="M70 86 h-8 a4 4 0 0 1 -4 -4 v-8 a6 6 0 0 1 4 -5.6 l14 -4.4 l12 -12 a8 8 0 0 1 5.6 -2.4 h34 a8 8 0 0 1 6.4 3.2 l10 12.8 l14 2 a6 6 0 0 1 5 6 v8.4 a4 4 0 0 1 -4 4 h-8" />
          <path className={styles.carWindow} d="M96 60 l8 -8 h14 v8 z M124 52 h10 l6 8 h-16 z" />
          <circle className={styles.wheel} cx="80" cy="86" r="9" />
          <circle className={styles.wheel} cx="146" cy="86" r="9" />
        </svg>
      </div>
      <p className={styles.label}>{label}</p>
    </div>
  </div>
);

export default PageLoader;
