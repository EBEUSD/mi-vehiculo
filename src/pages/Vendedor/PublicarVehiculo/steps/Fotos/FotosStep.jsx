import { useRef, useState } from "react";
import { AlertCircle, Check, CloudUpload, Info, Loader2, RefreshCw, Star, Trash2 } from "lucide-react";
import styles from "./FotosStep.module.css";

const MAX_PHOTOS  = 20;
const MAX_SIZE_MB = 10;
const VALID_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const FotosStep = ({ formData, onChange }) => {
  const fileInputRef    = useRef(null);
  const replaceInputRef = useRef(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [replacePhotoId, setReplacePhotoId] = useState(null);
  const [localError, setLocalError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const photos = formData.fotos || [];
  // Ref always points to latest photos — safe to read inside async callbacks
  const photosRef = useRef(photos);
  photosRef.current = photos;

  const updatePhotos = (next) =>
    onChange({ target: { name: "fotos", value: next } });

  const patchPhoto = (id, patch) =>
    updatePhotos(photosRef.current.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const validateFiles = (files) => {
    const valid = [];
    let err = "";
    files.forEach((f) => {
      if (!VALID_TYPES.includes(f.type))       err = "Solo JPG, PNG o WEBP.";
      else if (f.size > MAX_SIZE_MB * 1024 * 1024) err = `Cada imagen debe pesar menos de ${MAX_SIZE_MB} MB.`;
      else valid.push(f);
    });
    return { valid, err };
  };

  const addPhotos = async (files) => {
    const all = Array.from(files || []);
    if (!all.length) return;

    if (photos.length >= MAX_PHOTOS) {
      setLocalError(`Máximo ${MAX_PHOTOS} fotos.`);
      return;
    }

    const available  = MAX_PHOTOS - photos.length;
    const toProcess  = all.slice(0, available);
    const { valid, err } = validateFiles(toProcess);

    if (all.length > available)
      setLocalError(`Solo se agregaron ${available} fotos (máximo ${MAX_PHOTOS}).`);
    else if (err) setLocalError(err);
    else setLocalError("");

    if (!valid.length) return;

    const newPhotos = valid.map((file) => ({
      id:       `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
      file,                           // kept for backend upload at publish time
      preview:  URL.createObjectURL(file),
      name:     file.name,
      isMain:   false,
      uploading: false,
      error:    null,
    }));

    const next = [...photos, ...newPhotos].map((p, i) => ({
      ...p,
      isMain: photos.length === 0 && i === 0 ? true : p.isMain,
    }));

    updatePhotos(next);
    if (!selectedPhoto) setSelectedPhoto(next[0].id);
  };

  const handleAddFiles = async (e) => { await addPhotos(e.target.files); e.target.value = ""; };
  const handleDragOver  = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDrop      = async (e) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragging(false);
    await addPhotos(e.dataTransfer.files);
  };

  const handleReplaceFile = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!replacePhotoId || !files.length) return;
    const { valid, err } = validateFiles([files[0]]);
    if (err) { setLocalError(err); return; }
    const file = valid[0];
    patchPhoto(replacePhotoId, {
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      uploading: false,
      error: null,
    });
    setLocalError("");
    setReplacePhotoId(null);
  };

  const handleChooseMain = () => {
    if (!selectedPhoto) return;
    updatePhotos(photos.map((p) => ({ ...p, isMain: p.id === selectedPhoto })));
  };

  const handleDeletePhoto = () => {
    if (!selectedPhoto) return;
    const deleted  = photos.find((p) => p.id === selectedPhoto);
    const filtered = photos.filter((p) => p.id !== selectedPhoto);
    const next     = filtered.map((p, i) =>
      deleted?.isMain && i === 0 ? { ...p, isMain: true } : p
    );
    updatePhotos(next);
    setSelectedPhoto(next[0]?.id || null);
  };

  const handleOpenReplace = () => {
    if (!selectedPhoto) return;
    setReplacePhotoId(selectedPhoto);
    replaceInputRef.current?.click();
  };

  const uploading = photos.some((p) => p.uploading);
  const ready     = photos.length;
  const mainPhoto = photos.find((p) => p.isMain);

  return (
    <>
      <div
        className={`${styles.uploadBox} ${isDragging ? styles.uploadBoxDragging : ""}`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input ref={fileInputRef} type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          multiple className={styles.hiddenInput} onChange={handleAddFiles} />
        <input ref={replaceInputRef} type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          className={styles.hiddenInput} onChange={handleReplaceFile} />

        <div className={styles.uploadIcon}><CloudUpload size={48} /></div>
        <h3>
          {isDragging
            ? "Soltá las fotos para cargarlas"
            : <> Arrastrá tus fotos aquí o <span>seleccioná archivos</span> </>}
        </h3>
        <p>JPG, PNG, WEBP · Máximo {MAX_SIZE_MB} MB por foto · Hasta {MAX_PHOTOS} fotos</p>
      </div>

      {localError && <p className={styles.photoError}>{localError}</p>}

      <div className={`${styles.photoRequirement} ${ready >= 1 ? styles.photoRequirementDone : ""}`}>
        <Check size={16} />
        <span>
          {ready >= 1
            ? `${ready} foto${ready > 1 ? "s" : ""} lista${ready > 1 ? "s" : ""} · se suben al publicar`
            : "Subí al menos 1 foto para continuar"}
        </span>
      </div>

      {photos.length > 0 && (
        <>
          <div className={styles.photosGrid}>
            {photos.map((photo, index) => (
              <button
                key={photo.id}
                type="button"
                className={[
                  styles.photoCard,
                  selectedPhoto === photo.id ? styles.photoSelected : "",
                  photo.error ? styles.photoError2 : "",
                ].join(" ")}
                onClick={() => setSelectedPhoto(photo.id)}
              >
                <img src={photo.preview} alt={photo.name} />

                {photo.uploading && (
                  <span className={styles.photoUploading}>
                    <Loader2 size={22} className={styles.spin} />
                  </span>
                )}

                {photo.error && (
                  <span className={styles.photoErrorBadge}>
                    <AlertCircle size={13} /> Error
                  </span>
                )}

                {photo.isMain && !photo.uploading && (
                  <span className={styles.mainPhotoBadge}>Principal</span>
                )}

                <span className={styles.photoLabel}>{index + 1} / {photos.length}</span>
              </button>
            ))}
          </div>

          <div className={styles.photoActionsRow}>
            <div className={styles.photoActions}>
              <button type="button" className={styles.photoActionBtn}
                onClick={handleChooseMain} disabled={!selectedPhoto || uploading}>
                <Star size={15} /> Elegir principal
              </button>
              <button type="button" className={styles.photoActionBtn}
                onClick={handleOpenReplace} disabled={!selectedPhoto || uploading}>
                <RefreshCw size={15} /> Reemplazar
              </button>
              <button type="button"
                className={`${styles.photoActionBtn} ${styles.deleteBtn}`}
                onClick={handleDeletePhoto} disabled={!selectedPhoto}>
                <Trash2 size={15} /> Eliminar
              </button>
            </div>
            <p>{ready} de {MAX_PHOTOS} subidas</p>
          </div>
        </>
      )}

      {photos.length === 0 && (
        <div className={styles.emptyPhotos}>
          <strong>Todavía no subiste fotos</strong>
          <p>Agregá fotos del frente, laterales, interior, tablero y baúl para generar más confianza.</p>
        </div>
      )}

      <div className={styles.infoNotice}>
        <Info size={16} />
        <p>
          Las fotos se suben al publicar el aviso.
          {mainPhoto && " La foto principal será la primera imagen del aviso."}
        </p>
      </div>
    </>
  );
};

export default FotosStep;
