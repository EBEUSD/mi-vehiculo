import { useEffect, useState } from "react";
import {
  EyeOff,
  Info,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  Users,
} from "lucide-react";
import { api } from "../../../../../lib/api";
import styles from "./ContactoUbicacionStep.module.css";

const ContactoUbicacionStep = ({ formData, onChange }) => {
  const [provinces, setProvinces]     = useState([]);
  const [cities, setCities]           = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);

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
    setValue("cityId",  id         || "");
    setValue("ciudad",  city?.name || "");
  };

  const toggleWhatsappVisibility = () => {
    setValue("mostrarWhatsapp", formData.mostrarWhatsapp === "Si" ? "No" : "Si");
  };

  return (
    <div className={styles.contactStepLayout}>
      <div className={styles.contactFormCard}>
        <section className={styles.contactSection}>
          <div className={styles.contactSectionTitle}>
            <MapPin size={24} />
            <h3>Ubicación</h3>
          </div>

          <div className={styles.contactGrid}>
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
                    : loadingCities    ? "Cargando municipios…"
                    : "Seleccioná el municipio"}
                </option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className={styles.contactSection}>
          <div className={styles.contactSectionTitle}>
            <Users size={24} />
            <h3>Datos de contacto</h3>
          </div>

          <div className={styles.contactGrid}>
            <div className={styles.field}>
              <label>Nombre de contacto <span>*</span></label>
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
                <span>SV</span>
                <small>+503</small>
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
              <label>Email <span>*</span></label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={onChange}
                placeholder="Ej.: juanperez@email.com"
              />
            </div>

            <div className={styles.field}>
              <label>Horario de contacto <span>*</span></label>
              <select name="horarioContacto" value={formData.horarioContacto} onChange={onChange}>
                <option value="">Seleccioná un horario</option>
                <option value="Mañana">Mañana</option>
                <option value="Tarde">Tarde</option>
                <option value="Noche">Noche</option>
                <option value="Todo el día">Todo el día</option>
              </select>
            </div>
          </div>

          <div className={styles.visibilityControl}>
            <button
              type="button"
              className={`${styles.switchBtn} ${
                formData.mostrarWhatsapp === "Si" ? styles.switchActive : ""
              }`}
              onClick={toggleWhatsappVisibility}
            >
              <span></span>
            </button>

            <div>
              <strong>
                Mostrar WhatsApp públicamente
                <Info size={16} />
              </strong>
              <p>Los interesados podrán ver tu número de WhatsApp en el aviso.</p>
            </div>
          </div>
        </section>
      </div>

      <aside className={styles.privacyPanel}>
        <div className={styles.privacyMainIcon}>
          <LockKeyhole size={28} />
        </div>

        <h3>Tu email no será visible públicamente.</h3>

        <div className={styles.privacyDivider}></div>

        <div className={styles.privacyItem}>
          <div className={styles.privacyIcon}><EyeOff size={18} /></div>
          <div>
            <strong>Solo tu ciudad será pública</strong>
            <p>Mostraremos únicamente la ciudad donde se encuentra el vehículo.</p>
          </div>
        </div>

        <div className={styles.privacyItem}>
          <div className={styles.privacyIcon}><Phone size={18} /></div>
          <div>
            <strong>Vos elegís qué mostrar</strong>
            <p>Podés decidir si tu número de WhatsApp es visible en el aviso.</p>
          </div>
        </div>

        <div className={styles.privacyItem}>
          <div className={styles.privacyIcon}><Mail size={18} /></div>
          <div>
            <strong>Tu email está protegido</strong>
            <p>Nunca compartiremos tu email ni será visible para otros usuarios.</p>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default ContactoUbicacionStep;
