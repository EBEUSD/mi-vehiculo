import styles from "../../PublicarVehiculo.module.css";

const PrecioUbicacionStep = () => {
  return (
    <div className={styles.placeholderStep}>
      <h3>Precio y ubicación</h3>
      <p>Acá vamos a cargar precio, moneda, provincia, ciudad y contacto.</p>
    </div>
  );
};

export default PrecioUbicacionStep;