import {
  EyeOff,
  Info,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  Users,
} from "lucide-react";
import styles from "./ContactoUbicacionStep.module.css";

const ContactoUbicacionStep = ({ formData, onChange }) => {
  const setValue = (name, value) => {
    onChange({
      target: {
        name,
        value,
      },
    });
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
              <label>
                Provincia <span>*</span>
              </label>

              <select
                name="provincia"
                value={formData.provincia}
                onChange={onChange}
              >
                <option value="">Seleccioná la provincia</option>
                <option value="Buenos Aires">Buenos Aires</option>
                <option value="CABA">CABA</option>
                <option value="Córdoba">Córdoba</option>
                <option value="Santa Fe">Santa Fe</option>
                <option value="Mendoza">Mendoza</option>
              </select>
            </div>

            <div className={styles.field}>
              <label>
                Ciudad <span>*</span>
              </label>

              <select
                name="ciudad"
                value={formData.ciudad}
                onChange={onChange}
              >
                <option value="">Seleccioná la ciudad</option>
                <option value="La Plata">La Plata</option>
                <option value="Mar del Plata">Mar del Plata</option>
                <option value="Palermo">Palermo</option>
                <option value="Córdoba Capital">Córdoba Capital</option>
                <option value="Rosario">Rosario</option>
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
              <label>
                Nombre de contacto <span>*</span>
              </label>

              <input
                type="text"
                name="nombreContacto"
                value={formData.nombreContacto}
                onChange={onChange}
                placeholder="Ej.: Juan Pérez"
              />
            </div>

            <div className={styles.field}>
              <label>
                WhatsApp <span>*</span>
              </label>

              <div className={styles.phoneInput}>
                <span>AR</span>
                <small>+54</small>

                <input
                  type="text"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={onChange}
                  placeholder="11 2345 6789"
                />
              </div>
            </div>

            <div className={styles.field}>
              <label>
                Email <span>*</span>
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={onChange}
                placeholder="Ej.: juanperez@email.com"
              />
            </div>

            <div className={styles.field}>
              <label>
                Horario de contacto <span>*</span>
              </label>

              <select
                name="horarioContacto"
                value={formData.horarioContacto}
                onChange={onChange}
              >
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
          <div className={styles.privacyIcon}>
            <EyeOff size={18} />
          </div>

          <div>
            <strong>Solo tu ciudad será pública</strong>
            <p>
              Mostraremos únicamente la ciudad donde se encuentra el vehículo.
            </p>
          </div>
        </div>

        <div className={styles.privacyItem}>
          <div className={styles.privacyIcon}>
            <Phone size={18} />
          </div>

          <div>
            <strong>Vos elegís qué mostrar</strong>
            <p>
              Podés decidir si tu número de WhatsApp es visible en el aviso.
            </p>
          </div>
        </div>

        <div className={styles.privacyItem}>
          <div className={styles.privacyIcon}>
            <Mail size={18} />
          </div>

          <div>
            <strong>Tu email está protegido</strong>
            <p>
              Nunca compartiremos tu email ni será visible para otros usuarios.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default ContactoUbicacionStep;