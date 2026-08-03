import { useMemo, useState } from "react";
import {
  CalendarDays,
  Camera,
  Car,
  ChevronLeft,
  ChevronRight,
  Fuel,
  Gauge,
  Info,
  MapPin,
  MessageCircle,
  User,
  Wrench,
} from "lucide-react";
import styles from "./VistaPreviaStep.module.css";

const formatPrice = (price) => {
  const numbers = String(price || "").replace(/\D/g, "");
  if (!numbers) return null;
  return new Intl.NumberFormat("en-US").format(Number(numbers));
};

const VistaPreviaStep = ({ formData }) => {
  const photos = formData.fotos || [];
  const mainPhotoIndex = Math.max(0, photos.findIndex((p) => p.isMain));

  const [activePhotoIndex, setActivePhotoIndex] = useState(
    mainPhotoIndex >= 0 ? mainPhotoIndex : 0
  );

  const activePhoto = photos[activePhotoIndex] || photos[0];

  const title = [formData.marca, formData.modelo, formData.version, formData.anio]
    .filter(Boolean).join(" ") || "Sin título";

  const price = formatPrice(formData.precio);
  const location = [formData.ciudad, formData.provincia].filter(Boolean).join(", ") || null;
  const description = formData.descripcion || formData.observaciones || null;

  const chips = [
    formData.color,
    formData.carroceria,
    formData.traccion,
    formData.aceptaPermuta === "Si" ? "Acepta permuta" : null,
    formData.precioNegociable === "Si" ? "Precio negociable" : null,
    formData.financiacion === "Si" ? "Acepta financiación" : null,
  ].filter(Boolean);

  const visibleThumbs = useMemo(() => photos.slice(0, 6), [photos]);

  const goPrevPhoto = () => {
    if (photos.length === 0) {
      return;
    }

    setActivePhotoIndex((prev) => {
      if (prev === 0) {
        return photos.length - 1;
      }

      return prev - 1;
    });
  };

  const goNextPhoto = () => {
    if (photos.length === 0) {
      return;
    }

    setActivePhotoIndex((prev) => {
      if (prev === photos.length - 1) {
        return 0;
      }

      return prev + 1;
    });
  };

  return (
    <>
      <div className={styles.previewLayout}>
        <div className={styles.previewGallery}>
          <div className={styles.previewMainPhoto}>
            {activePhoto ? (
              <img src={activePhoto.preview} alt={activePhoto.name} />
            ) : (
              <div className={styles.emptyPreviewPhoto}>
                <Camera size={42} />
                <strong>Sin fotos cargadas</strong>
                <p>Subí fotos en el paso anterior para verlas acá.</p>
              </div>
            )}

            <span className={styles.previewCounter}>
              <Camera size={16} />
              {photos.length > 0 ? `${activePhotoIndex + 1} / ${photos.length}` : "0 / 0"}
            </span>

            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  className={`${styles.galleryArrow} ${styles.galleryPrev}`}
                  onClick={goPrevPhoto}
                >
                  <ChevronLeft size={20} />
                </button>

                <button
                  type="button"
                  className={`${styles.galleryArrow} ${styles.galleryNext}`}
                  onClick={goNextPhoto}
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>

          {visibleThumbs.length > 0 && (
            <div className={styles.previewThumbs}>
              {visibleThumbs.map((photo, index) => (
                <button
                  key={photo.id}
                  type="button"
                  className={`${styles.previewThumb} ${
                    activePhotoIndex === index ? styles.previewThumbActive : ""
                  }`}
                  onClick={() => setActivePhotoIndex(index)}
                >
                  <img src={photo.preview} alt={photo.name} />

                  {photo.isMain && (
                    <span className={styles.mainThumbBadge}>Principal</span>
                  )}
                </button>
              ))}
            </div>
          )}

          <div className={styles.sellerBox}>
            <h3>Datos del vendedor</h3>

            <div className={styles.sellerContent}>
              <div className={styles.sellerAvatar}>
                <User size={24} />
              </div>

              <div className={styles.sellerText}>
                <strong>{formData.nombreContacto || "Tu nombre"}</strong>
                <p>Vendedor en Mi Vehículo</p>
              </div>

              <button type="button" className={styles.whatsappSellerBtn}>
                <MessageCircle size={20} />
                {formData.whatsapp ? `Escribir al ${formData.whatsapp}` : "WhatsApp"}
              </button>
            </div>
          </div>
        </div>

        <div className={styles.previewInfo}>
          <div className={styles.previewTitleBlock}>
            <h2>{title}</h2>

            {price ? (
              <strong className={styles.previewPrice}>$ {price}</strong>
            ) : (
              <strong className={styles.previewPrice} style={{ color: "#94a3b8" }}>Sin precio</strong>
            )}

            {location && (
              <div className={styles.previewLocation}>
                <MapPin size={18} />
                {location}
              </div>
            )}
          </div>

          <div className={styles.previewSpecs}>
            <div className={styles.previewSpec}>
              <CalendarDays size={22} />
              <div>
                <span>Año</span>
                <strong>{formData.anio || "2021"}</strong>
              </div>
            </div>

            <div className={styles.previewSpec}>
              <Wrench size={22} />
              <div>
                <span>Transmisión</span>
                <strong>{formData.transmision || "Automática"}</strong>
              </div>
            </div>

            <div className={styles.previewSpec}>
              <Gauge size={22} />
              <div>
                <span>Kilometraje</span>
                <strong>{formData.kilometraje || "85.000"} km</strong>
              </div>
            </div>

            <div className={styles.previewSpec}>
              <Car size={22} />
              <div>
                <span>Motor</span>
                <strong>{formData.motor || "2.0"}</strong>
              </div>
            </div>

            <div className={styles.previewSpec}>
              <Fuel size={22} />
              <div>
                <span>Combustible</span>
                <strong>{formData.combustible || "Gasolina"}</strong>
              </div>
            </div>

            <div className={styles.previewSpec}>
              <Car size={22} />
              <div>
                <span>Puertas</span>
                <strong>{formData.puertas || "4"}</strong>
              </div>
            </div>
          </div>

          {description && (
            <div className={styles.previewDescription}>
              <h3>Descripción</h3>
              <p>{description}</p>
            </div>
          )}

          {chips.length > 0 && (
            <div className={styles.previewTags}>
              {chips.map((chip) => (
                <span key={chip}>{chip}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={styles.previewNotice}>
        <Info size={18} />
        <p>
          Una vez publicada, tu aviso será visible para miles de compradores en
          Mi Vehículo. Podrás editarlo o gestionarlo desde tu Panel de Vendedor.
        </p>
      </div>
    </>
  );
};

export default VistaPreviaStep;