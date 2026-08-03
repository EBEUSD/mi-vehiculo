import { Link, useNavigate } from "react-router-dom";
import { Save, X, Check } from "lucide-react";
import { useAuth } from "../../../../context/AuthContext";
import logoVehiculo from "../../../../assets/logo-vehiculo.png";
import styles from "./PublicarTopbar.module.css";

const PublicarTopbar = ({ onSaveDraft, draftSaved }) => {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const fullName  = user?.user_metadata?.full_name || user?.email || "Usuario";
  const firstName = fullName.split(" ")[0];
  const initial   = firstName.charAt(0).toUpperCase();

  return (
    <header className={styles.topbar}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          <img src={logoVehiculo} alt="Mi Vehículo" className={styles.logoImg} />
        </Link>

        <span className={styles.divider} />

        <p className={styles.title}>Publicar vehículo</p>

        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.saveBtn} ${draftSaved ? styles.saveBtnSaved : ""}`}
            onClick={onSaveDraft}
          >
            {draftSaved ? <Check size={15} strokeWidth={3} /> : <Save size={15} />}
            <span>{draftSaved ? "Guardado" : "Guardar borrador"}</span>
          </button>

          <div className={styles.userChip}>
            <span className={styles.avatar}>{initial}</span>
            <span className={styles.userName}>{firstName}</span>
          </div>

          <button
            type="button"
            className={styles.closeBtn}
            onClick={() => navigate("/vendedor")}
            aria-label="Salir al panel"
            title="Salir al panel"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default PublicarTopbar;
