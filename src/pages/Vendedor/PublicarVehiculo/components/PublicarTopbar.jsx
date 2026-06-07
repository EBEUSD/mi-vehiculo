import { Bell, ChevronDown, Save } from "lucide-react";
import styles from "./PublicarTopbar.module.css";

const PublicarTopbar = () => {
  return (
    <header className={styles.topbar}>
      <div className={styles.topbarInner}>
        <div className={styles.brand}>
          <span className={styles.logoMi}>mi</span>
          <span>vehiculo</span>
        </div>

        <div className={styles.topbarDivider}></div>

        <h2 className={styles.topbarTitle}>Publicar vehiculo</h2>

        <div className={styles.topbarActions}>
          <button type="button" className={styles.draftGhostBtn}>
            <Save size={18} />
            Guardar borrador
          </button>

          <button type="button" className={styles.iconBtn}>
            <Bell size={18} />
            <span>2</span>
          </button>

          <button type="button" className={styles.avatarBtn}>
            <strong>AV</strong>
            <ChevronDown size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default PublicarTopbar;
