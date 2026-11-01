import { useId, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Phone } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { formatSvPhone, isValidSvPhone, normalizeSvPhone } from "../../lib/phone";
import { safeNext } from "../../lib/redirect";
import logoVehiculo from "../../assets/logo-vehiculo.png";
import styles from "./CompletarPerfil.module.css";

// Primer ingreso (sobre todo con Google/Apple): nombre y teléfono.
// Particular/Empresa y el documento se piden recién al publicar por primera vez.
const CompletarPerfil = () => {
  const { user, updateProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = useId();

  const meta = user?.user_metadata || {};
  const [fullName, setFullName]       = useState(meta.full_name || "");
  const [phone, setPhone]             = useState(meta.phone ? formatSvPhone(meta.phone) : "");
  const [errors, setErrors]           = useState({});
  const [saving, setSaving]           = useState(false);
  const [generalError, setGeneralError] = useState("");

  const next = safeNext(searchParams.get("next")) || "/vendedor";

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (fullName.trim().length < 2) errs.fullName = "Ingresá tu nombre.";
    if (!isValidSvPhone(phone)) errs.phone = "Ingresá un teléfono válido de 8 dígitos.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    setGeneralError("");
    const { error } = await updateProfile({
      full_name: fullName.trim(),
      phone:     normalizeSvPhone(phone),
    });
    setSaving(false);
    if (error) { setGeneralError("No pudimos guardar tus datos. Intentá de nuevo."); return; }
    navigate(next, { replace: true });
  };

  return (
    <div className={styles.page}>
      <title>Completá tu perfil | Mi Vehículo</title>
      <meta name="robots" content="noindex" />

      <header className={styles.topNav}>
        <Link to="/"><img src={logoVehiculo} alt="Mi Vehículo" width="176" height="32" /></Link>
      </header>

      <main className={styles.card}>
        <h1 className={styles.title}>Completá tu perfil</h1>
        <p className={styles.sub}>Un último paso para terminar de crear tu cuenta: dejanos un teléfono de contacto.</p>

        {generalError && <p className={styles.errorMsg} role="alert">{generalError}</p>}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.field}>
            <label htmlFor={`${id}-name`} className={styles.label}>Nombre y apellido</label>
            <input
              id={`${id}-name`}
              className={`${styles.input} ${errors.fullName ? styles.inputError : ""}`}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
              aria-invalid={!!errors.fullName}
            />
            {errors.fullName && <p className={styles.fieldError}>{errors.fullName}</p>}
          </div>

          <div className={styles.field}>
            <label htmlFor={`${id}-phone`} className={styles.label}>Teléfono / WhatsApp</label>
            <div className={styles.inputWrap}>
              <Phone size={16} className={styles.inputIcon} aria-hidden="true" />
              <input
                id={`${id}-phone`}
                type="tel"
                className={`${styles.input} ${styles.inputWithIcon} ${errors.phone ? styles.inputError : ""}`}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onBlur={() => isValidSvPhone(phone) && setPhone(formatSvPhone(phone))}
                placeholder="+503 7000-0000"
                autoComplete="tel"
                aria-invalid={!!errors.phone}
              />
            </div>
            {errors.phone && <p className={styles.fieldError}>{errors.phone}</p>}
          </div>

          <button type="submit" className={styles.submitBtn} disabled={saving} aria-busy={saving}>
            {saving ? "Guardando…" : <>Continuar <ArrowRight size={18} aria-hidden="true" /></>}
          </button>
        </form>

        <p className={styles.footNote}>
          ¿No sos vos ({user?.email})?{" "}
          <button type="button" className={styles.linkBtn} onClick={async () => { await signOut(); navigate("/login", { replace: true }); }}>
            Cerrar sesión
          </button>
        </p>
      </main>
    </div>
  );
};

export default CompletarPerfil;
