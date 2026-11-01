import { useState } from "react";
import { Pencil } from "lucide-react";
import { formatUSD, isValidPrice } from "../../../../../lib/money";
import { formatSvPhone, isValidSvPhone } from "../../../../../lib/phone";
import LocationSelect from "../../../shared/LocationSelect/LocationSelect";
import PlanPublicacionStep from "../PlanPublicacion/PlanPublicacionStep";
import styles from "./PrecioContactoStep.module.css";

const calcReach = (fd) => {
  if (fd.nombreContacto)       return 3;
  if (fd.cityId)               return 2;
  if (isValidPrice(fd.precio)) return 1;
  return 0;
};

// Selector Sí/No
const Toggle = ({ label, value, onSelect }) => (
  <div className={styles.toggleGroup}>
    <span className={styles.toggleLabel}>{label}</span>
    <div className={styles.togglePill}>
      {["Si", "No"].map((v) => (
        <button
          key={v}
          type="button"
          className={`${styles.pillBtn} ${value === v ? styles.pillActive : ""}`}
          aria-pressed={value === v}
          onClick={() => onSelect(v)}
        >
          {v}
        </button>
      ))}
    </div>
  </div>
);

const PrecioContactoStep = ({ formData, onChange }) => {
  const [maxReached,  setMaxReached]  = useState(() => calcReach(formData));
  const [currentCard, setCurrentCard] = useState(() => calcReach(formData));
  const [snapshot,    setSnapshot]    = useState(null);

  const setValue = (name, value) => onChange({ target: { name, value } });

  const confirm = (cardIdx) => {
    const next = Math.max(maxReached, cardIdx + 1);
    setMaxReached(next);
    setCurrentCard(next);
    setSnapshot(null);
  };

  const editCard = (cardIdx, fieldNames) => {
    const snap = {};
    fieldNames.forEach((f) => { snap[f] = formData[f]; });
    setSnapshot({ cardIdx, fields: snap });
    setCurrentCard(cardIdx);
  };

  const cancelEdit = () => {
    if (snapshot) {
      Object.entries(snapshot.fields).forEach(([k, v]) => setValue(k, v));
    }
    setCurrentCard(maxReached);
    setSnapshot(null);
  };

  const isEditing   = (i) => currentCard === i;
  const isConfirmed = (i) => maxReached > i && currentCard !== i;
  const isVisible   = (i) => i <= maxReached;

  const handleLocationChange = (patch) => {
    Object.entries(patch).forEach(([k, v]) => setValue(k, v));
  };

  const priceTyped = String(formData.precio || "").trim() !== "";
  const priceOk    = isValidPrice(formData.precio);
  const phoneTyped = String(formData.whatsapp || "").trim() !== "";
  const phoneOk    = isValidSvPhone(formData.whatsapp);

  // Confirmed summaries
  const priceBadges = [
    formData.precioNegociable === "Si" && "Negociable",
    formData.aceptaPermuta    === "Si" && "Permuta",
    formData.financiacion     === "Si" && "Financiación",
  ].filter(Boolean);

  const contactSummary = [
    formData.nombreContacto,
    formatSvPhone(formData.whatsapp),
  ].filter(Boolean).join(" · ");

  return (
    <div className={styles.flow}>

      {/* ══════ Card 0: Precio ══════ */}
      <div className={`${styles.card} ${isEditing(0) ? styles.cardEditing : ""} ${isConfirmed(0) ? styles.cardDone : ""}`}>
        <div className={styles.cardHead}>
          <div>
            <span className={styles.cardTitle}>Precio <span className={styles.req}>*</span></span>
            {!isConfirmed(0) && <p className={styles.cardSub}>¿Cuánto pedís por el vehículo?</p>}
          </div>
          {isConfirmed(0) && (
            <button
              type="button"
              className={styles.editBtn}
              onClick={() => editCard(0, ["precio", "precioNegociable", "aceptaPermuta", "financiacion"])}
            >
              <Pencil size={13} /> Cambiar
            </button>
          )}
        </div>

        {isConfirmed(0) ? (
          <div className={styles.donePriceRow}>
            <span className={styles.donePrice}>
              {formatUSD(formData.precio, { suffix: true })}
            </span>
            {priceBadges.map((b) => <span key={b} className={styles.doneBadge}>{b}</span>)}
          </div>
        ) : (
          <>
            <div className={styles.priceRow}>
              <span className={styles.currency}>$</span>
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                aria-label="Precio en USD"
                name="precio"
                value={formData.precio}
                onChange={onChange}
                placeholder="Ej.: 15,000"
                className={styles.priceInput}
              />
              <span className={styles.priceCurrency}>USD</span>
            </div>
            {priceTyped && !priceOk && (
              <p className={styles.fieldHint} role="alert">Ingresá un precio mayor a $0 (ej.: 15,000).</p>
            )}
            <div className={styles.toggleRow}>
              <Toggle label="Precio negociable"   value={formData.precioNegociable} onSelect={(v) => setValue("precioNegociable", v)} />
              <Toggle label="Acepta permuta"      value={formData.aceptaPermuta}    onSelect={(v) => setValue("aceptaPermuta", v)} />
              <Toggle label="Acepta financiación" value={formData.financiacion}     onSelect={(v) => setValue("financiacion", v)} />
            </div>
            <div className={styles.cardFooter}>
              {snapshot?.cardIdx === 0 && (
                <button type="button" className={styles.cancelBtn} onClick={cancelEdit}>Cancelar</button>
              )}
              <button
                type="button"
                className={styles.confirmBtn}
                disabled={!priceOk}
                onClick={() => confirm(0)}
              >
                Confirmar
              </button>
            </div>
          </>
        )}
      </div>

      {/* ══════ Card 1: Ubicación ══════ */}
      {isVisible(1) && (
        <div className={`${styles.card} ${styles.fadeIn} ${isEditing(1) ? styles.cardEditing : ""} ${isConfirmed(1) ? styles.cardDone : ""}`}>
          <div className={styles.cardHead}>
            <div>
              <span className={styles.cardTitle}>Ubicación <span className={styles.req}>*</span></span>
              {!isConfirmed(1) && <p className={styles.cardSub}>¿Dónde está el vehículo?</p>}
            </div>
            {isConfirmed(1) && (
              <button
                type="button"
                className={styles.editBtn}
                onClick={() => editCard(1, ["provinceId", "provincia", "cityId", "ciudad"])}
              >
                <Pencil size={13} /> Cambiar
              </button>
            )}
          </div>

          {isConfirmed(1) ? (
            <p className={styles.doneValue}>{formData.ciudad}, {formData.provincia}</p>
          ) : (
            <>
              <div className={styles.twoCol}>
                <LocationSelect
                  required
                  provinceId={formData.provinceId}
                  cityId={formData.cityId}
                  onChange={handleLocationChange}
                  fieldClassName={styles.field}
                />
              </div>
              <div className={styles.cardFooter}>
                <button type="button" className={styles.cancelBtn} onClick={cancelEdit}>Cancelar</button>
                <button
                  type="button"
                  className={styles.confirmBtn}
                  disabled={!formData.cityId}
                  onClick={() => confirm(1)}
                >
                  Confirmar
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ══════ Card 2: Contacto ══════ */}
      {isVisible(2) && (
        <div className={`${styles.card} ${styles.fadeIn} ${isEditing(2) ? styles.cardEditing : ""} ${isConfirmed(2) ? styles.cardDone : ""}`}>
          <div className={styles.cardHead}>
            <div>
              <span className={styles.cardTitle}>Datos de contacto <span className={styles.req}>*</span></span>
              {!isConfirmed(2) && <p className={styles.cardSub}>¿Cómo te contactan los compradores?</p>}
            </div>
            {isConfirmed(2) && (
              <button
                type="button"
                className={styles.editBtn}
                onClick={() => editCard(2, ["nombreContacto", "whatsapp", "email", "horarioContacto", "mostrarWhatsapp"])}
              >
                <Pencil size={13} /> Cambiar
              </button>
            )}
          </div>

          {isConfirmed(2) ? (
            <p className={styles.doneValue}>{contactSummary}</p>
          ) : (
            <>
              <div className={styles.twoCol}>
                <div className={styles.field}>
                  <label htmlFor="pc-nombre">Nombre <span>*</span></label>
                  <input
                    id="pc-nombre"
                    type="text"
                    name="nombreContacto"
                    value={formData.nombreContacto}
                    onChange={onChange}
                    placeholder="Ej.: Juan Pérez"
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="pc-whatsapp">WhatsApp <span>*</span></label>
                  <div className={styles.phoneInput}>
                    <span>+503</span>
                    <input
                      id="pc-whatsapp"
                      type="tel"
                      inputMode="tel"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={onChange}
                      placeholder="7000-0000"
                    />
                  </div>
                  {phoneTyped && !phoneOk && (
                    <p className={styles.fieldHint} role="alert">El número debe tener 8 dígitos.</p>
                  )}
                </div>
                <div className={styles.field}>
                  <label htmlFor="pc-email">Email <span className={styles.opt}>(opcional)</span></label>
                  <input
                    id="pc-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={onChange}
                    placeholder="correo@email.com"
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="pc-horario">Horario <span className={styles.opt}>(opcional)</span></label>
                  <select id="pc-horario" name="horarioContacto" value={formData.horarioContacto} onChange={onChange}>
                    <option value="">Seleccioná un horario</option>
                    <option value="Mañana">Mañana</option>
                    <option value="Tarde">Tarde</option>
                    <option value="Noche">Noche</option>
                    <option value="Todo el día">Todo el día</option>
                  </select>
                </div>
              </div>

              <label className={styles.switchRow}>
                <span
                  className={`${styles.switchTrack} ${formData.mostrarWhatsapp === "Si" ? styles.switchOn : ""}`}
                  onClick={() => setValue("mostrarWhatsapp", formData.mostrarWhatsapp === "Si" ? "No" : "Si")}
                >
                  <span className={styles.switchKnob} />
                </span>
                <span className={styles.switchText}>Mostrar WhatsApp públicamente</span>
              </label>

              <div className={styles.cardFooter}>
                <button type="button" className={styles.cancelBtn} onClick={cancelEdit}>Cancelar</button>
                <button
                  type="button"
                  className={styles.confirmBtn}
                  disabled={!formData.nombreContacto?.trim() || !phoneOk}
                  onClick={() => confirm(2)}
                >
                  Confirmar
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ══════ Plan de publicación ══════ */}
      {isVisible(3) && (
        <div className={`${styles.planSection} ${styles.fadeIn}`}>
          <PlanPublicacionStep formData={formData} onChange={onChange} />
        </div>
      )}
    </div>
  );
};

export default PrecioContactoStep;
