import { MapPin, Phone, Tag, Globe } from "lucide-react";
import styles from "./VistaPreviaSimpleStep.module.css";

const fmt = (n) => {
  const num = parseFloat(String(n).replace(/,/g, ""));
  if (!num) return "$0";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(num);
};

const VistaPreviaSimpleStep = ({ formData, tipo }) => {
  const nombre = tipo === "repuesto" ? formData.nombreRepuesto : formData.nombreAccesorio;
  const categoria = tipo === "repuesto" ? formData.categoriaRepuesto : formData.categoriaAccesorio;
  const mainPhoto = formData.fotos?.find((p) => p.isMain && p.url)?.url
    || formData.fotos?.find((p) => p.url)?.url
    || null;

  const compatInfo = tipo === "repuesto"
    ? formData.esUniversal
      ? "Universal — compatible con cualquier vehículo"
      : [
          formData.compatibleMarcas && `Marcas: ${formData.compatibleMarcas}`,
          formData.compatibleModelos && `Modelos: ${formData.compatibleModelos}`,
          formData.compatibleAnios && `Años: ${formData.compatibleAnios}`,
        ].filter(Boolean).join(" · ")
    : null;

  return (
    <div className={styles.preview}>
      <div className={styles.previewCard}>
        {/* Photo */}
        <div className={styles.photoArea}>
          {mainPhoto ? (
            <img src={mainPhoto} alt={nombre} className={styles.mainPhoto} />
          ) : (
            <div className={styles.photoPlaceholder}>
              <Tag size={40} color="#94a3b8" />
              <span>Sin foto principal</span>
            </div>
          )}
          <span className={styles.condBadge}>{formData.condicion}</span>
        </div>

        {/* Info */}
        <div className={styles.info}>
          <h2 className={styles.title}>{nombre || "Sin nombre"}</h2>
          <p className={styles.category}>{categoria || "Sin categoría"}</p>
          <p className={styles.price}>{fmt(formData.precio)}</p>

          <div className={styles.chips}>
            {formData.precioNegociable === "Si" && <span className={styles.chip}>Negociable</span>}
            {formData.aceptaPermuta === "Si" && <span className={styles.chip}>Acepta permuta</span>}
            {formData.cantidad > 1 && <span className={styles.chip}>Cantidad: {formData.cantidad}</span>}
          </div>

          {compatInfo && (
            <div className={styles.compatRow}>
              <Globe size={14} />
              <span>{compatInfo}</span>
            </div>
          )}

          {formData.descripcionItem && (
            <p className={styles.desc}>{formData.descripcionItem}</p>
          )}

          <div className={styles.meta}>
            {(formData.provincia || formData.ciudad) && (
              <div className={styles.metaRow}>
                <MapPin size={14} />
                <span>{[formData.ciudad, formData.provincia].filter(Boolean).join(", ")}</span>
              </div>
            )}
            {formData.whatsapp && (
              <div className={styles.metaRow}>
                <Phone size={14} />
                <span>{formData.whatsapp}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <p className={styles.note}>
        Así verán tu publicación los compradores. Revisá los datos antes de confirmar.
      </p>
    </div>
  );
};

export default VistaPreviaSimpleStep;
