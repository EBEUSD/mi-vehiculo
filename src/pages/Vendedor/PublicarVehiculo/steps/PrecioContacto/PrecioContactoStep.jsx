import { useEffect, useState } from "react";
import { Pencil, Check, Gift, Zap, Star } from "lucide-react";
import { api } from "../../../../../lib/api";
import styles from "./PrecioContactoStep.module.css";

const PLANES = [
  {
    id: "gratuito",
    nombre: "Gratuito",
    subtitulo: "Para comenzar",
    precio: null,
    badge: null,
    icon: Gift,
    accent: "#64748b",
    highlight: false,
    incluye: ["1 publicación gratis por año", "60 días de duración", "Hasta 10 fotos", "Visible en búsquedas"],
    noIncluye: ["Posición destacada en resultados", "Aparece en la página principal", "Badge en el aviso", "Estadísticas de visitas"],
    nota: "Solo 1 publicación gratuita por año calendario",
  },
  {
    id: "basico",
    nombre: "Básico",
    subtitulo: "Mayor alcance",
    precio: 5,
    badge: "Más popular",
    icon: Zap,
    accent: "#1570ff",
    highlight: true,
    incluye: ["Publicaciones ilimitadas", "90 días de duración", "Hasta 20 fotos", "Posición destacada en búsquedas", 'Badge "Destacado" en tu aviso', "Estadísticas de visitas"],
    noIncluye: ["Aparece en la página principal"],
    nota: null,
  },
  {
    id: "premium",
    nombre: "Premium",
    subtitulo: "Máxima visibilidad",
    precio: 12,
    badge: "Mayor visibilidad",
    icon: Star,
    accent: "#7c3aed",
    highlight: false,
    incluye: ["Publicaciones ilimitadas", "120 días de duración", "Hasta 30 fotos", "Aparece en la página principal", "Top de resultados de búsqueda", 'Badge "Premium" en tu aviso', "Estadísticas avanzadas"],
    noIncluye: [],
    nota: null,
  },
];

const calcReach = (fd) => {
  if (fd.nombreContacto)                         return 3;
  if (fd.cityId)                                 return 2;
  if (String(fd.precio || "").trim() !== "")     return 1;
  return 0;
};

const PrecioContactoStep = ({ formData, onChange }) => {
  const [provinces,     setProvinces]     = useState([]);
  const [cities,        setCities]        = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [maxReached,    setMaxReached]    = useState(() => calcReach(formData));
  const [currentCard,   setCurrentCard]   = useState(() => calcReach(formData));
  const [snapshot,      setSnapshot]      = useState(null);

  const setValue = (name, value) => onChange({ target: { name, value } });

  useEffect(() => {
    api.get("/location/provinces")
      .then((res) => setProvinces(res.data || []))
      .catch(() => setProvinces([]));
  }, []);

  useEffect(() => {
    if (!formData.provinceId) { setCities([]); return; }
    let cancelled = false;
    setLoadingCities(true);
    api.get(`/location/provinces/${formData.provinceId}/cities`)
      .then((res) => { if (!cancelled) setCities(res.data || []); })
      .catch(() => { if (!cancelled) setCities([]); })
      .finally(() => { if (!cancelled) setLoadingCities(false); });
    return () => { cancelled = true; };
  }, [formData.provinceId]);

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

  const handleProvinciaChange = (e) => {
    const id   = parseInt(e.target.value, 10);
    const prov = provinces.find((p) => p.id === id);
    setValue("provinceId", id       || "");
    setValue("provincia",  prov?.name || "");
    setValue("cityId",     "");
    setValue("ciudad",     "");
  };

  const handleCiudadChange = (e) => {
    const id   = parseInt(e.target.value, 10);
    const city = cities.find((c) => c.id === id);
    setValue("cityId", id       || "");
    setValue("ciudad", city?.name || "");
  };

  const Toggle = ({ name, label }) => (
    <div className={styles.toggleGroup}>
      <span className={styles.toggleLabel}>{label}</span>
      <div className={styles.togglePill}>
        {["Si", "No"].map((v) => (
          <button
            key={v}
            type="button"
            className={`${styles.pillBtn} ${formData[name] === v ? styles.pillActive : ""}`}
            onClick={() => setValue(name, v)}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );

  // Confirmed summaries
  const priceBadges = [
    formData.precioNegociable === "Si" && "Negociable",
    formData.aceptaPermuta    === "Si" && "Permuta",
    formData.financiacion     === "Si" && "Financiación",
  ].filter(Boolean);

  const contactSummary = [
    formData.nombreContacto,
    formData.whatsapp && `+503 ${formData.whatsapp}`,
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
              ${Number(formData.precio).toLocaleString("en-US")} USD
            </span>
            {priceBadges.map((b) => <span key={b} className={styles.doneBadge}>{b}</span>)}
          </div>
        ) : (
          <>
            <div className={styles.priceRow}>
              <span className={styles.currency}>$</span>
              <input
                type="text"
                name="precio"
                value={formData.precio}
                onChange={onChange}
                placeholder="0"
                className={styles.priceInput}
              />
              <span className={styles.priceCurrency}>USD</span>
            </div>
            <div className={styles.toggleRow}>
              <Toggle name="precioNegociable" label="Precio negociable" />
              <Toggle name="aceptaPermuta"    label="Acepta permuta" />
              <Toggle name="financiacion"     label="Acepta financiación" />
            </div>
            <div className={styles.cardFooter}>
              {snapshot?.cardIdx === 0 && (
                <button type="button" className={styles.cancelBtn} onClick={cancelEdit}>Cancelar</button>
              )}
              <button
                type="button"
                className={styles.confirmBtn}
                disabled={!formData.precio || formData.precio === "0"}
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
                <div className={styles.field}>
                  <label>Departamento <span>*</span></label>
                  <select value={formData.provinceId || ""} onChange={handleProvinciaChange}>
                    <option value="">Seleccioná el departamento</option>
                    {provinces.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.field}>
                  <label>Municipio <span>*</span></label>
                  <select
                    value={formData.cityId || ""}
                    onChange={handleCiudadChange}
                    disabled={!formData.provinceId || loadingCities}
                  >
                    <option value="">
                      {!formData.provinceId ? "Elegí primero el departamento"
                        : loadingCities      ? "Cargando municipios…"
                        : "Seleccioná el municipio"}
                    </option>
                    {cities.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
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
                  <label>Nombre <span>*</span></label>
                  <input
                    type="text"
                    name="nombreContacto"
                    value={formData.nombreContacto}
                    onChange={onChange}
                    placeholder="Ej.: Juan Pérez"
                  />
                </div>
                <div className={styles.field}>
                  <label>WhatsApp <span>*</span></label>
                  <div className={styles.phoneInput}>
                    <span>+503</span>
                    <input
                      type="text"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={onChange}
                      placeholder="7000-0000"
                    />
                  </div>
                </div>
                <div className={styles.field}>
                  <label>Email <span className={styles.opt}>(opcional)</span></label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={onChange}
                    placeholder="correo@email.com"
                  />
                </div>
                <div className={styles.field}>
                  <label>Horario <span className={styles.opt}>(opcional)</span></label>
                  <select name="horarioContacto" value={formData.horarioContacto} onChange={onChange}>
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
                  disabled={!formData.nombreContacto || !formData.whatsapp}
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
          <div className={styles.planIntro}>
            <h3 className={styles.planTitle}>Elegí cómo querés publicar</h3>
            <p className={styles.planSub}>
              Más visibilidad genera más consultas. Podés cambiar de plan en cualquier momento.
            </p>
          </div>

          <div className={styles.planGrid}>
            {PLANES.map((plan) => {
              const Icon = plan.icon;
              const isSelected = formData.plan === plan.id;
              return (
                <button
                  key={plan.id}
                  type="button"
                  className={[
                    styles.planCard,
                    plan.highlight ? styles.planHighlight : "",
                    isSelected     ? styles.planSelected  : "",
                  ].join(" ")}
                  style={{ "--accent": plan.accent }}
                  onClick={() => onChange({ target: { name: "plan", value: plan.id } })}
                >
                  {plan.badge && (
                    <span className={styles.planBadge} style={{ background: plan.accent }}>
                      {plan.badge}
                    </span>
                  )}
                  <div className={styles.planTop}>
                    <span className={styles.planIcon} style={{ background: `${plan.accent}18`, color: plan.accent }}>
                      <Icon size={22} />
                    </span>
                    <div>
                      <h4 className={styles.planName}>{plan.nombre}</h4>
                      <p className={styles.planSubtitle}>{plan.subtitulo}</p>
                    </div>
                    <div className={`${styles.planRadio} ${isSelected ? styles.planRadioOn : ""}`}>
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>
                  </div>

                  <div className={styles.planPriceRow}>
                    {plan.precio === null ? (
                      <span className={styles.planPrice} style={{ color: plan.accent }}>Gratis</span>
                    ) : (
                      <>
                        <span className={styles.planPrice} style={{ color: plan.accent }}>${plan.precio}</span>
                        <span className={styles.planPer}>por publicación</span>
                      </>
                    )}
                  </div>

                  <ul className={styles.planFeatures}>
                    {plan.incluye.map((item) => (
                      <li key={item} className={styles.featureOn}>
                        <Check size={12} strokeWidth={3} style={{ flexShrink: 0, color: plan.accent }} />
                        {item}
                      </li>
                    ))}
                    {plan.noIncluye.map((item) => (
                      <li key={item} className={styles.featureOff}>
                        <span className={styles.featureDash}>—</span>
                        {item}
                      </li>
                    ))}
                  </ul>

                  {plan.nota && <p className={styles.planNota}>{plan.nota}</p>}
                </button>
              );
            })}
          </div>

          {!formData.plan && (
            <p className={styles.planHint}>Seleccioná un plan para poder publicar</p>
          )}
          {formData.plan && formData.plan !== "gratuito" && (
            <div className={styles.payNote}>
              El cobro se procesa de forma segura al confirmar. Podés pagar con tarjeta de crédito, débito o transferencia.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PrecioContactoStep;
