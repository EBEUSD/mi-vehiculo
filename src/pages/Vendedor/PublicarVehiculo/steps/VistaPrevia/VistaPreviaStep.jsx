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
  Pencil,
  Snowflake,
  Smartphone,
  User,
  Wrench,
} from "lucide-react";
import styles from "./VistaPreviaStep.module.css";

const equipment = [
  { label: "Aire acondicionado", icon: Snowflake },
  { label: "Android Auto / CarPlay", icon: Smartphone },
  { label: "Cámara de retroceso", icon: Camera },
  { label: "Control crucero", icon: Gauge },
  { label: "Sensores de estacionamiento", icon: Wrench },
];

const formatPrice = (price) => {
  if (!price) {
    return "18.900.000";
  }

  const numbers = String(price).replace(/\D/g, "");

  if (!numbers) {
    return price;
  }

  return new Intl.NumberFormat("es-AR").format(Number(numbers));
};

const VistaPreviaStep = ({ formData }) => {
  const photos = formData.fotos || [];
  const mainPhotoIndex = Math.max(
    0,
    photos.findIndex((photo) => photo.isMain)
  );

  const [activePhotoIndex, setActivePhotoIndex] = useState(
    mainPhotoIndex >= 0 ? mainPhotoIndex : 0
  );

  const activePhoto = photos[activePhotoIndex] || photos[0];

  const title = `${formData.marca || "Toyota"} ${
    formData.modelo || "Corolla"
  } ${formData.motor || "2.0"} XEI CVT ${formData.anio || "2021"}`;

  const price = formatPrice(formData.precio);
  const location = `${formData.provincia || "CABA"}, ${
    formData.ciudad || "Palermo"
  }`;

  const visibleThumbs = useMemo(() => {
    if (photos.length === 0) {
      return [];
    }

    return photos.slice(0, 6);
  }, [photos]);

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
      <div className={styles.previewEditRow}>
        <button type="button" className={styles.previewEditBtn}>
          <Pencil size={18} />
          Editar publicación
        </button>
      </div>

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
                <strong>{formData.nombreContacto || "Juan Manuel Pérez"}</strong>
                <p>Usuario desde 2021</p>
              </div>

              <button type="button" className={styles.whatsappSellerBtn}>
                <MessageCircle size={20} />
                Enviar mensaje por WhatsApp
              </button>
            </div>
          </div>
        </div>

        <div className={styles.previewInfo}>
          <div className={styles.previewTitleBlock}>
            <h2>{title}</h2>

            <strong className={styles.previewPrice}>$ {price}</strong>

            <div className={styles.previewLocation}>
              <MapPin size={18} />
              {location}
            </div>
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
                <strong>{formData.combustible || "Nafta"}</strong>
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

          <div className={styles.previewDescription}>
            <h3>Descripción</h3>

            <p>
              {formData.observaciones ||
                "Único dueño. Service oficiales al día. Muy buen estado general. Equipamiento completo, cámara de retroceso, sensores de estacionamiento, control crucero y pantalla multimedia."}
            </p>
          </div>

          <div className={styles.previewTags}>
            {equipment.map((item) => {
              const Icon = item.icon;

              return (
                <span key={item.label}>
                  <Icon size={16} />
                  {item.label}
                </span>
              );
            })}

            <span>+ 3 más</span>
          </div>
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