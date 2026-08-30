import { useState } from "react";
import { ChevronDown, Info, Pencil } from "lucide-react";
import SearchableSelect from "../../../../../components/SearchableSelect/SearchableSelect";
import styles from "./CaracteristicasCompletasStep.module.css";

const COLOR_SWATCHES = [
  { label: "Blanco",      hex: "#f0f0f0" },
  { label: "Negro",       hex: "#1c1c1c" },
  { label: "Gris",        hex: "#9ca3af" },
  { label: "Plateado",    hex: "#cbd5e1" },
  { label: "Azul",        hex: "#3b82f6" },
  { label: "Azul oscuro", hex: "#1e3a6e" },
  { label: "Rojo",        hex: "#ef4444" },
  { label: "Bordo",       hex: "#881337" },
  { label: "Beige",       hex: "#d4b896" },
  { label: "Marrón",      hex: "#78350f" },
  { label: "Verde",       hex: "#16a34a" },
  { label: "Amarillo",    hex: "#fbbf24" },
  { label: "Naranja",     hex: "#f97316" },
  { label: "Dorado",      hex: "#ca8a04" },
  { label: "Celeste",     hex: "#38bdf8" },
  { label: "Violeta",     hex: "#7c3aed" },
];

const COLOR_OPTIONS = [
  { value: "", label: "Seleccioná el color" },
  ...COLOR_SWATCHES.map(({ label }) => ({ value: label, label })),
];

const fuelOpts  = ["Gasolina", "Diésel", "Híbrido", "Eléctrico", "Gas LP"];
const transOpts = ["Manual", "Automática", "CVT"];
const doorsOpts = ["2", "3", "4", "5"];
const tracOpts  = ["Delantera 4x2", "Trasera 4x2", "4x4", "AWD"];
const stateOpts = ["Excelente", "Muy bueno", "Bueno", "Regular"];
const vtvOpts   = ["Al día", "Vencida", "No aplica"];
const debtOpts  = ["Sin deudas", "Tiene deudas"];
const ownerOpts = ["Titular", "Familiar", "Gestor", "Concesionaria"];

// Initial reach based on existing data (e.g. from saved draft)
const calcReach = (fd) => {
  if (fd.color)       return 3;
  if (fd.transmision) return 2;
  if (fd.combustible) return 1;
  return 0;
};

const CaracteristicasCompletasStep = ({ formData, onChange }) => {
  const [maxReached,  setMaxReached]  = useState(() => calcReach(formData));
  const [currentCard, setCurrentCard] = useState(() => calcReach(formData));
  const [snapshot,    setSnapshot]    = useState(null); // { field, value }
  const [extrasOpen,  setExtrasOpen]  = useState(false);
  const [docsOpen,    setDocsOpen]    = useState(false);

  const setValue = (name, value) => onChange({ target: { name, value } });

  const confirm = (cardIdx) => {
    const next = Math.max(maxReached, cardIdx + 1);
    setMaxReached(next);
    setCurrentCard(next);
    setSnapshot(null);
  };

  const editCard = (cardIdx, field) => {
    setSnapshot({ field, value: formData[field] });
    setCurrentCard(cardIdx);
  };

  const cancelEdit = () => {
    if (snapshot) setValue(snapshot.field, snapshot.value);
    setCurrentCard(maxReached);
    setSnapshot(null);
  };

  const isEditing   = (i) => currentCard === i;
  const isConfirmed = (i) => maxReached > i && currentCard !== i;
  const isVisible   = (i) => i <= maxReached;

  const Chips = ({ name, opts }) => (
    <div className={styles.chips}>
      {opts.map((o) => (
        <button
          key={o}
          type="button"
          className={`${styles.chip} ${formData[name] === o ? styles.chipActive : ""}`}
          onClick={() => setValue(name, o)}
        >
          {o}
        </button>
      ))}
    </div>
  );

  const selectedColor = COLOR_SWATCHES.find((c) => c.label === formData.color);

  const extrasSummary = [
    formData.motor    && `Motor ${formData.motor}`,
    formData.puertas  && `${formData.puertas} puertas`,
    formData.traccion && formData.traccion,
  ].filter(Boolean).join(" · ") || null;

  const docsSummary = [
    formData.estadoGeneral,
    formData.papelesAlDia === "Sí" ? "Papeles al día" : formData.papelesAlDia === "No" ? "Sin papeles" : null,
    formData.deudas === "Sin deudas" ? "Sin deudas" : formData.deudas === "Tiene deudas" ? "Con deudas" : null,
  ].filter(Boolean).join(" · ") || null;

  return (
    <div className={styles.flow}>

      {/* ══════ Card 0: Combustible ══════ */}
      <div className={`${styles.card} ${isEditing(0) ? styles.cardEditing : ""} ${isConfirmed(0) ? styles.cardDone : ""}`}>
        <div className={styles.cardHead}>
          <div>
            <span className={styles.cardTitle}>Combustible <span className={styles.req}>*</span></span>
            {!isConfirmed(0) && <p className={styles.cardSub}>¿Qué tipo de combustible usa?</p>}
          </div>
          {isConfirmed(0) && (
            <button type="button" className={styles.editBtn} onClick={() => editCard(0, "combustible")}>
              <Pencil size={13} /> Cambiar
            </button>
          )}
        </div>

        {isConfirmed(0) ? (
          <p className={styles.doneValue}>{formData.combustible}</p>
        ) : (
          <>
            <Chips name="combustible" opts={fuelOpts} />
            <div className={styles.cardFooter}>
              {snapshot && <button type="button" className={styles.cancelBtn} onClick={cancelEdit}>Cancelar</button>}
              <button
                type="button"
                className={styles.confirmBtn}
                disabled={!formData.combustible}
                onClick={() => confirm(0)}
              >
                Confirmar
              </button>
            </div>
          </>
        )}
      </div>

      {/* ══════ Card 1: Transmisión ══════ */}
      {isVisible(1) && (
        <div className={`${styles.card} ${styles.fadeIn} ${isEditing(1) ? styles.cardEditing : ""} ${isConfirmed(1) ? styles.cardDone : ""}`}>
          <div className={styles.cardHead}>
            <div>
              <span className={styles.cardTitle}>Transmisión <span className={styles.req}>*</span></span>
              {!isConfirmed(1) && <p className={styles.cardSub}>¿Qué tipo de transmisión tiene?</p>}
            </div>
            {isConfirmed(1) && (
              <button type="button" className={styles.editBtn} onClick={() => editCard(1, "transmision")}>
                <Pencil size={13} /> Cambiar
              </button>
            )}
          </div>

          {isConfirmed(1) ? (
            <p className={styles.doneValue}>{formData.transmision}</p>
          ) : (
            <>
              <Chips name="transmision" opts={transOpts} />
              <div className={styles.cardFooter}>
                <button type="button" className={styles.cancelBtn} onClick={cancelEdit}>Cancelar</button>
                <button
                  type="button"
                  className={styles.confirmBtn}
                  disabled={!formData.transmision}
                  onClick={() => confirm(1)}
                >
                  Confirmar
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ══════ Card 2: Color ══════ */}
      {isVisible(2) && (
        <div className={`${styles.card} ${styles.fadeIn} ${isEditing(2) ? styles.cardEditing : ""} ${isConfirmed(2) ? styles.cardDone : ""}`}>
          <div className={styles.cardHead}>
            <div>
              <span className={styles.cardTitle}>Color <span className={styles.req}>*</span></span>
              {!isConfirmed(2) && <p className={styles.cardSub}>¿De qué color es?</p>}
            </div>
            {isConfirmed(2) && (
              <button type="button" className={styles.editBtn} onClick={() => editCard(2, "color")}>
                <Pencil size={13} /> Cambiar
              </button>
            )}
          </div>

          {isConfirmed(2) ? (
            <div className={styles.doneColorRow}>
              <span className={styles.colorDot} style={{ background: selectedColor?.hex }} />
              <span className={styles.doneValue}>{formData.color}</span>
            </div>
          ) : (
            <>
              <div className={styles.colorRow}>
                {selectedColor && <span className={styles.colorDot} style={{ background: selectedColor.hex }} />}
                <div className={styles.colorSelectWrap}>
                  <SearchableSelect
                    options={COLOR_OPTIONS}
                    value={formData.color || ""}
                    onChange={(v) => setValue("color", v)}
                    placeholder="Seleccioná el color"
                    searchPlaceholder="Buscar color…"
                  />
                </div>
              </div>
              <div className={styles.cardFooter}>
                <button type="button" className={styles.cancelBtn} onClick={cancelEdit}>Cancelar</button>
                <button
                  type="button"
                  className={styles.confirmBtn}
                  disabled={!formData.color}
                  onClick={() => confirm(2)}
                >
                  Confirmar
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ══════ Extras + Docs + Descripción ══════ */}
      {isVisible(3) && (
        <div className={styles.fadeIn}>

          <div className={styles.accordion}>
            <button
              type="button"
              className={`${styles.accordionTrigger} ${extrasOpen ? styles.accordionOpen : ""}`}
              onClick={() => setExtrasOpen((p) => !p)}
            >
              <span className={styles.accordionLabel}>
                <span className={styles.accordionTitle}>Más especificaciones</span>
                {!extrasOpen && extrasSummary && <span className={styles.accordionSummary}>{extrasSummary}</span>}
              </span>
              <ChevronDown size={17} className={styles.accordionChevron} />
            </button>

            {extrasOpen && (
              <div className={styles.accordionBody}>
                <div className={styles.extrasGrid}>
                  <div className={styles.field}>
                    <label>Motor</label>
                    <input type="text" name="motor" value={formData.motor} onChange={onChange} placeholder="Ej.: 1.6, 2.0, 3.5 V6" />
                  </div>
                  <div className={styles.field}>
                    <label>Puertas</label>
                    <Chips name="puertas" opts={doorsOpts} />
                  </div>
                  <div className={`${styles.field} ${styles.full}`}>
                    <label>Tracción</label>
                    <Chips name="traccion" opts={tracOpts} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className={styles.accordion}>
            <button
              type="button"
              className={`${styles.accordionTrigger} ${docsOpen ? styles.accordionOpen : ""}`}
              onClick={() => setDocsOpen((p) => !p)}
            >
              <span className={styles.accordionLabel}>
                <span className={styles.accordionTitle}>Documentación y estado</span>
                {!docsOpen && docsSummary && <span className={styles.accordionSummary}>{docsSummary}</span>}
              </span>
              <ChevronDown size={17} className={styles.accordionChevron} />
            </button>

            {docsOpen && (
              <div className={styles.accordionBody}>
                <div className={styles.docsGrid}>
                  <div className={`${styles.field} ${styles.full}`}>
                    <label>Estado general</label>
                    <Chips name="estadoGeneral" opts={stateOpts} />
                  </div>
                  <div className={styles.field}>
                    <label>Papeles al día</label>
                    <Chips name="papelesAlDia" opts={["Sí", "No"]} />
                  </div>
                  <div className={styles.field}>
                    <label>Tarjeta de circulación</label>
                    <Chips name="vtv" opts={vtvOpts} />
                  </div>
                  <div className={styles.field}>
                    <label>Deudas</label>
                    <Chips name="deudas" opts={debtOpts} />
                  </div>
                  <div className={styles.field}>
                    <label>Titularidad</label>
                    <select name="titularidad" value={formData.titularidad} onChange={onChange}>
                      {ownerOpts.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className={styles.descSection}>
            <label className={styles.descLabel}>
              Descripción <span className={styles.optional}>(opcional)</span>
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion || ""}
              onChange={onChange}
              maxLength={800}
              placeholder="Describí tu vehículo: estado, historial de mantenimiento, equipamiento, razón de venta…"
              className={styles.textarea}
            />
            <p className={styles.charCount}>{(formData.descripcion || "").length}/800</p>
          </div>

          <div className={styles.notice}>
            <Info size={15} />
            <p>La información detallada y honesta genera más consultas de compradores serios.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaracteristicasCompletasStep;
