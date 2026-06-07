import { useRef, useState } from "react";
import { Check, CloudUpload, Info, RefreshCw, Star, Trash2 } from "lucide-react";
import styles from "./FotosStep.module.css";

const MAX_PHOTOS = 20;
const MAX_SIZE_MB = 10;
const VALID_TYPES = ["image/jpeg", "image/jpg", "image/png"];

const FotosStep = ({ formData, onChange }) => {
  const fileInputRef = useRef(null);
  const replaceInputRef = useRef(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [replacePhotoId, setReplacePhotoId] = useState(null);
  const [localError, setLocalError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const photos = formData.fotos || [];

  const updatePhotos = (nextPhotos) => {
    onChange({
      target: {
        name: "fotos",
        value: nextPhotos,
      },
    });
  };

  const readFileAsPreview = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        resolve({
          id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          preview: reader.result,
          isMain: false,
        });
      };

      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const validateFiles = (files) => {
    const validFiles = [];
    let errorMessage = "";

    files.forEach((file) => {
      if (!VALID_TYPES.includes(file.type)) {
        errorMessage = "Solo podés subir imágenes JPG, JPEG o PNG.";
        return;
      }

      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        errorMessage = `Cada imagen debe pesar menos de ${MAX_SIZE_MB} MB.`;
        return;
      }

      validFiles.push(file);
    });

    return {
      validFiles,
      errorMessage,
    };
  };

  const addPhotos = async (files) => {
    const selectedFiles = Array.from(files || []);

    if (selectedFiles.length === 0) {
      return;
    }

    if (photos.length >= MAX_PHOTOS) {
      setLocalError(`Solo podés subir hasta ${MAX_PHOTOS} fotos.`);
      return;
    }

    const availableSlots = MAX_PHOTOS - photos.length;
    const filesToProcess = selectedFiles.slice(0, availableSlots);
    const { validFiles, errorMessage } = validateFiles(filesToProcess);

    if (selectedFiles.length > availableSlots) {
      setLocalError(`Solo se agregaron ${availableSlots} fotos. El máximo es ${MAX_PHOTOS}.`);
    } else if (errorMessage) {
      setLocalError(errorMessage);
    } else {
      setLocalError("");
    }

    if (validFiles.length === 0) {
      return;
    }

    const newPhotos = await Promise.all(validFiles.map(readFileAsPreview));

    const nextPhotos = [...photos, ...newPhotos].map((photo, index) => ({
      ...photo,
      isMain: photos.length === 0 && index === 0 ? true : photo.isMain,
    }));

    updatePhotos(nextPhotos);

    if (!selectedPhoto && nextPhotos.length > 0) {
      setSelectedPhoto(nextPhotos[0].id);
    }
  };

  const handleAddFiles = async (event) => {
    await addPhotos(event.target.files);
    event.target.value = "";
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(false);

    const droppedFiles = event.dataTransfer.files;
    await addPhotos(droppedFiles);
  };

  const handleReplaceFile = async (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    event.target.value = "";

    if (!replacePhotoId || selectedFiles.length === 0) {
      return;
    }

    const { validFiles, errorMessage } = validateFiles([selectedFiles[0]]);

    if (errorMessage) {
      setLocalError(errorMessage);
      return;
    }

    const newPhoto = await readFileAsPreview(validFiles[0]);

    const nextPhotos = photos.map((photo) => {
      if (photo.id !== replacePhotoId) {
        return photo;
      }

      return {
        ...newPhoto,
        id: photo.id,
        isMain: photo.isMain,
      };
    });

    setLocalError("");
    setReplacePhotoId(null);
    updatePhotos(nextPhotos);
  };

  const handleChooseMain = () => {
    if (!selectedPhoto) {
      return;
    }

    const nextPhotos = photos.map((photo) => ({
      ...photo,
      isMain: photo.id === selectedPhoto,
    }));

    updatePhotos(nextPhotos);
  };

  const handleDeletePhoto = () => {
    if (!selectedPhoto) {
      return;
    }

    const deletedPhoto = photos.find((photo) => photo.id === selectedPhoto);
    const filteredPhotos = photos.filter((photo) => photo.id !== selectedPhoto);

    const nextPhotos = filteredPhotos.map((photo, index) => {
      if (deletedPhoto?.isMain && index === 0) {
        return {
          ...photo,
          isMain: true,
        };
      }

      return photo;
    });

    updatePhotos(nextPhotos);
    setSelectedPhoto(nextPhotos[0]?.id || null);
  };

  const handleOpenReplace = () => {
    if (!selectedPhoto) {
      return;
    }

    setReplacePhotoId(selectedPhoto);
    replaceInputRef.current?.click();
  };

  const mainPhoto = photos.find((photo) => photo.isMain);

  return (
    <>
      <div
        className={`${styles.uploadBox} ${
          isDragging ? styles.uploadBoxDragging : ""
        }`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          multiple
          className={styles.hiddenInput}
          onChange={handleAddFiles}
        />

        <input
          ref={replaceInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          className={styles.hiddenInput}
          onChange={handleReplaceFile}
        />

        <div className={styles.uploadIcon}>
          <CloudUpload size={54} />
        </div>

        <h3>
          {isDragging ? (
            <>Soltá las fotos para cargarlas</>
          ) : (
            <>
              Arrastrá tus fotos aquí o <span>seleccioná archivos</span>
            </>
          )}
        </h3>

        <p>
          Formatos soportados: JPG, JPEG, PNG. Peso máximo por archivo: 10 MB.
        </p>
      </div>

      {localError && <p className={styles.photoError}>{localError}</p>}

      <div
        className={`${styles.photoRequirement} ${
          photos.length >= 4 ? styles.photoRequirementDone : ""
        }`}
      >
        <Check size={18} />
        <span>
          {photos.length >= 4
            ? "Ya tenés las fotos mínimas para publicar"
            : "Subí al menos 4 fotos para publicar tu vehículo"}
        </span>
      </div>

      {photos.length > 0 && (
        <>
          <div className={styles.photosGrid}>
            {photos.map((photo, index) => (
              <button
                key={photo.id}
                type="button"
                className={`${styles.photoCard} ${
                  selectedPhoto === photo.id ? styles.photoSelected : ""
                }`}
                onClick={() => setSelectedPhoto(photo.id)}
              >
                <img src={photo.preview} alt={photo.name} />

                {photo.isMain && (
                  <span className={styles.mainPhotoBadge}>Foto principal</span>
                )}

                <span className={styles.photoLabel}>
                  {index + 1} / {photos.length}
                </span>
              </button>
            ))}
          </div>

          <div className={styles.photoActionsRow}>
            <div className={styles.photoActions}>
              <button
                type="button"
                className={styles.photoActionBtn}
                onClick={handleChooseMain}
                disabled={!selectedPhoto}
              >
                <Star size={18} />
                Elegir principal
              </button>

              <button
                type="button"
                className={styles.photoActionBtn}
                onClick={handleOpenReplace}
                disabled={!selectedPhoto}
              >
                <RefreshCw size={18} />
                Reemplazar foto
              </button>

              <button
                type="button"
                className={`${styles.photoActionBtn} ${styles.deleteBtn}`}
                onClick={handleDeletePhoto}
                disabled={!selectedPhoto}
              >
                <Trash2 size={18} />
                Eliminar
              </button>
            </div>

            <p>
              {photos.length} de {MAX_PHOTOS} fotos
            </p>
          </div>
        </>
      )}

      {photos.length === 0 && (
        <div className={styles.emptyPhotos}>
          <strong>Todavía no subiste fotos</strong>
          <p>
            Agregá fotos del frente, laterales, interior, tablero y baúl para que
            la publicación genere más confianza.
          </p>
        </div>
      )}

      <div className={styles.infoNotice}>
        <Info size={18} />
        <p>
          Cuantas más fotos y mejor iluminación, más consultas vas a recibir.
          {mainPhoto && " La foto principal será la primera imagen del aviso."}
        </p>
      </div>
    </>
  );
};

export default FotosStep;