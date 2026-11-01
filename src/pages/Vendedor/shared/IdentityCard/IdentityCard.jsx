import { useId, useState } from "react";
import { BadgeCheck, Building2, ShieldCheck } from "lucide-react";
import { useAuth } from "../../../../context/AuthContext";
import { formatSvPhone, isValidSvPhone, normalizeSvPhone } from "../../../../lib/phone";
import {
  DOC_TYPES, formatDui, formatNit, isEmpresa, validateDocNumber, validateNit,
} from "../../../../lib/identity";
import styles from "./IdentityCard.module.css";

// Último paso de la primera publicación: verificación de identidad.
// Particular → documento. Empresa → razón social, NIT, dirección y teléfono comercial.
// Solo se muestra si faltan datos (ver needsIdentity); una vez guardados no vuelve a aparecer.
const IdentityCard = () => {
  const { user, updateProfile } = useAuth();
  const id = useId();
  const meta = user?.user_metadata || {};
  const empresa = isEmpresa(user);

  const [form, setForm] = useState({
    docType:        meta.document_type || "DUI",
    docNumber:      meta.document_number || "",
    nit:            meta.nit || "",
    companyName:    meta.company_name || "",
    nrc:            meta.nrc || "",
    companyAddress: meta.company_address || "",
    companyPhone:   meta.company_phone ? formatSvPhone(meta.company_phone) : "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const set = (key, transform = (v) => v) => (e) => {
    setForm((p) => ({ ...p, [key]: transform(e.target.value) }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (empresa) {
      if (!form.companyName.trim()) errs.companyName = "Ingresá la razón social.";
      const nitErr = form.nit.trim() ? validateNit(form.nit) : "Ingresá el NIT de la empresa.";
      if (nitErr) errs.nit = nitErr;
      if (form.companyAddress.trim().length < 5) errs.companyAddress = "Ingresá la dirección de la empresa.";
      if (!isValidSvPhone(form.companyPhone)) errs.companyPhone = "Ingresá un teléfono válido de 8 dígitos.";
    } else {
      const docErr = validateDocNumber(form.docType, form.docNumber);
      if (docErr) errs.docNumber = docErr;
      // Con DUI el NIT es opcional (el DUI homologa al NIT)
      if (form.docType !== "DUI" && !form.nit.trim()) errs.nit = "Ingresá tu NIT.";
      else if (form.nit.trim()) { const nitErr = validateNit(form.nit); if (nitErr) errs.nit = nitErr; }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    setSaveError("");
    const data = empresa
      ? {
          company_name:    form.companyName.trim(),
          nit:             form.nit.trim(),
          nrc:             form.nrc.trim() || null,
          company_address: form.companyAddress.trim(),
          company_phone:   normalizeSvPhone(form.companyPhone),
        }
      : {
          document_type:   form.docType,
          document_number: form.docNumber.trim(),
          nit:             form.nit.trim() || null,
          ...(form.docType === "DUI" ? { dui: form.docNumber.trim() } : {}),
        };
    const { error } = await updateProfile(data);
    setSaving(false);
    if (error) setSaveError("No pudimos guardar tus datos. Intentá de nuevo.");
  };

  const field = (key, label, input, hint) => (
    <div className={styles.field}>
      <label htmlFor={`${id}-${key}`} className={styles.label}>{label}</label>
      {input}
      {hint && !errors[key] && <p className={styles.hint}>{hint}</p>}
      {errors[key] && <p className={styles.fieldError}>{errors[key]}</p>}
    </div>
  );

  const inputProps = (key) => ({
    id: `${id}-${key}`,
    className: `${styles.input} ${errors[key] ? styles.inputError : ""}`,
    "aria-invalid": !!errors[key],
  });

  return (
    <section className={styles.card} aria-labelledby={`${id}-title`}>
      <div className={styles.header}>
        <div className={styles.icon} aria-hidden="true">
          {empresa ? <Building2 size={22} /> : <ShieldCheck size={22} />}
        </div>
        <div>
          <h2 id={`${id}-title`}>{empresa ? "Datos de la empresa" : "Verificá tu identidad"}</h2>
          <p>
            Es tu primera publicación: necesitamos estos datos una sola vez para dar
            más confianza a los compradores. No se muestran en el aviso.
          </p>
        </div>
      </div>

      {empresa ? (
        <div className={styles.grid}>
          {field("companyName", "Razón social",
            <input {...inputProps("companyName")} value={form.companyName} onChange={set("companyName")} autoComplete="organization" />)}
          {field("nit", "NIT de la empresa",
            <input {...inputProps("nit")} value={form.nit} onChange={set("nit", formatNit)} inputMode="numeric" placeholder="0614-010190-101-1" maxLength={17} />)}
          {field("nrc", "NRC (opcional)",
            <input {...inputProps("nrc")} value={form.nrc} onChange={set("nrc", (v) => v.replace(/[^0-9-]/g, "").slice(0, 10))} inputMode="numeric" placeholder="123456-7" />)}
          {field("companyPhone", "Teléfono de la empresa",
            <input {...inputProps("companyPhone")} type="tel" value={form.companyPhone} onChange={set("companyPhone")} placeholder="+503 2200-0000" autoComplete="tel" />,
            "Te llamamos para contarte de planes para empresas.")}
          <div className={styles.full}>
            {field("companyAddress", "Dirección",
              <input {...inputProps("companyAddress")} value={form.companyAddress} onChange={set("companyAddress")} placeholder="Calle, número, municipio y departamento" autoComplete="street-address" />)}
          </div>
        </div>
      ) : (
        <div className={styles.grid}>
          <div className={styles.field}>
            <label htmlFor={`${id}-docType`} className={styles.label}>Documento</label>
            <select
              id={`${id}-docType`}
              className={styles.input}
              value={form.docType}
              onChange={(e) => { setForm((p) => ({ ...p, docType: e.target.value, docNumber: "" })); setErrors({}); }}
            >
              {DOC_TYPES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>
          {field("docNumber", "Número",
            <input
              {...inputProps("docNumber")}
              value={form.docNumber}
              onChange={set("docNumber", (v) => form.docType === "DUI"
                ? formatDui(v)
                : v.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 20))}
              placeholder={form.docType === "DUI" ? "01234567-8" : "Número de documento"}
              maxLength={form.docType === "DUI" ? 10 : 20}
              autoComplete="off"
            />)}
          <div className={styles.full}>
            {field("nit", form.docType === "DUI" ? "NIT (opcional)" : "NIT",
              <input {...inputProps("nit")} value={form.nit} onChange={set("nit", formatNit)} inputMode="numeric" placeholder="0614-010190-101-1" maxLength={17} autoComplete="off" />)}
          </div>
        </div>
      )}

      {saveError && <p className={styles.saveError} role="alert">{saveError}</p>}

      <button type="button" className={styles.saveBtn} onClick={handleSave} disabled={saving} aria-busy={saving}>
        <BadgeCheck size={18} aria-hidden="true" />
        {saving ? "Guardando…" : "Guardar y continuar"}
      </button>
    </section>
  );
};

export default IdentityCard;
