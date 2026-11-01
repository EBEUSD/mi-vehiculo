import { useState } from "react";
import { AlertCircle, Check, Images } from "lucide-react";
import styles from "./PhotoLimitNotice.module.css";

// Se muestra cuando el plan elegido admite menos fotos que las cargadas:
// el usuario elige cuáles conservar acá mismo, o vuelve al paso de fotos.
const PhotoLimitNotice = ({ photos, plan, onKeep, onGoToPhotos }) => {
  const limit = plan.fotos;
  // Por defecto: la principal + las primeras hasta completar el límite
  const [selected, setSelected] = useState(() => {
    const main = photos.find((p) => p.isMain);
    const ordered = main ? [main, ...photos.filter((p) => p !== main)] : photos;
    return ordered.slice(0, limit).map((p) => p.id);
  });

  const toggle = (id) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= limit) return prev;
      return [...prev, id];
    });
  };

  const extra = photos.length - limit;

  const handleKeep = () => {
    const kept = photos.filter((p) => selected.includes(p.id));
    const removed = photos.filter((p) => !selected.includes(p.id));
    // Si se quitó la principal, la primera conservada pasa a serlo
    const next = kept.some((p) => p.isMain)
      ? kept
      : kept.map((p, i) => ({ ...p, isMain: i === 0 }));
    onKeep(next, removed);
  };

  return (
    <div className={styles.box} role="alert">
      <div className={styles.head}>
        <AlertCircle size={18} />
        <div>
          <strong>El plan {plan.nombre} permite hasta {limit} fotos y cargaste {photos.length}.</strong>
          <p>Elegí las {limit} que querés conservar (se quitarán {extra}), o elegí un plan con más fotos.</p>
        </div>
      </div>

      <div className={styles.grid}>
        {photos.map((p) => {
          const on = selected.includes(p.id);
          const blocked = !on && selected.length >= limit;
          return (
            <button
              key={p.id}
              type="button"
              className={`${styles.thumb} ${on ? styles.thumbOn : ""}`}
              aria-pressed={on}
              aria-label={`${on ? "Quitar" : "Conservar"} ${p.name || "foto"}`}
              disabled={blocked}
              onClick={() => toggle(p.id)}
            >
              <img src={p.preview} alt="" />
              {on && <span className={styles.check}><Check size={14} strokeWidth={3} /></span>}
            </button>
          );
        })}
      </div>

      <div className={styles.actions}>
        <span className={styles.count}>{selected.length} de {limit} seleccionadas</span>
        {onGoToPhotos && (
          <button type="button" className={styles.secondary} onClick={onGoToPhotos}>
            <Images size={15} /> Ir a fotos
          </button>
        )}
        <button
          type="button"
          className={styles.primary}
          disabled={selected.length === 0}
          onClick={handleKeep}
        >
          Conservar {selected.length} foto{selected.length !== 1 ? "s" : ""}
        </button>
      </div>
    </div>
  );
};

export default PhotoLimitNotice;
