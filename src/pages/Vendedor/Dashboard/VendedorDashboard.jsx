import { useState, useEffect, useMemo, useCallback } from "react";
import { api, clearTokens } from "../../../lib/api";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home, Car, MessageCircle, Heart, PlusCircle,
  Headphones, ArrowRight, Eye, Edit2, Trash2, Pause,
  Play, CheckCircle, User, Save, ChevronRight, AlertCircle,
  Camera, Building2, TrendingUp, Bell, ShieldAlert, Lock,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import Navbar from "../../../components/Navbar/Navbar";
import styles from "./VendedorDashboard.module.css";

/* ── Helpers ──────────────────────────────────── */
const STATUS_LABEL = { ACTIVE: "activo", DRAFT: "pausado", PAUSED: "pausado", SOLD: "vendido" };

// API expects "individual" | "dealer" — map from the 3 internal UI values
const SELLER_TYPE_TO_API = { particular: "individual", concesionario: "dealer", empresa: "dealer" };
// Map API value back to the closest UI option
const SELLER_TYPE_FROM_API = (v) =>
  v === "dealer" ? "concesionario" : v === "individual" ? "particular" : v || "particular";
const STATUS_API   = { activo: "ACTIVE", pausado: "PAUSED", vendido: "SOLD" };

const STATUS_META = {
  activo:  { label: "Activo",  color: "#059669", bg: "rgba(5,150,105,0.08)"  },
  pausado: { label: "Pausado", color: "#d97706", bg: "rgba(217,119,6,0.08)"  },
  vendido: { label: "Vendido", color: "#6b7a99", bg: "rgba(107,122,153,0.1)" },
};

const mapRowToPub = (row) => ({
  id:        row.id,
  slug:      row.slug || "",
  titulo:    [row.brand?.name, row.model?.name, row.version].filter(Boolean).join(" "),
  año:       row.year || 0,
  km:        (row.mileage || 0).toLocaleString("en-US"),
  precio:    `$${new Intl.NumberFormat("en-US").format(row.price || 0)}`,
  status:    STATUS_LABEL[row.status] || "activo",
  vistas:    row.views || 0,
  consultas: 0,
  favoritos: 0,
  image:     row.images?.find((i) => i.isPrimary)?.url || row.images?.[0]?.url || null,
});

const relTime = (iso) => {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)   return "hace un momento";
  if (m < 60)  return `hace ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `hace ${h}h`;
  const d = Math.floor(h / 24);
  if (d === 1) return "ayer";
  if (d < 7)   return `hace ${d} días`;
  return new Date(iso).toLocaleDateString("es-SV");
};

const mapLead = (l) => ({
  id:        l.id,
  nombre:    l.name || l.email || "—",
  email:     l.email,
  vehiculo:  l.vehicle?.title || "—",
  vehiculoSlug: l.vehicle?.slug || null,
  thumbnail: l.vehicle?.images?.[0]?.url ?? null,
  msg:    l.message,
  hora:   relTime(l.createdAt),
  leido:  l.status !== "NEW",
  status: l.status,
});

/* ── Sub-views ────────────────────────────────── */
function ViewInicio({ stats, pubs, leads, unread, onNavigate }) {
  const activas  = pubs.filter((p) => p.status === "activo").length;
  const pausadas = pubs.filter((p) => p.status === "pausado").length;

  return (
    <>
      {unread > 0 && (
        <div className={styles.alertBanner}>
          <MessageCircle size={16} />
          <span>Tenés <strong>{unread}</strong> {unread === 1 ? "consulta sin leer" : "consultas sin leer"}</span>
          <button className={styles.alertBtn} onClick={() => onNavigate("consultas")}>
            Ver ahora <ChevronRight size={14} />
          </button>
        </div>
      )}

      <section className={styles.statsGrid}>
        <article className={`${styles.statCard} ${styles.statCardBlue}`}>
          <div className={`${styles.statIcon} ${styles.blue}`}><Car size={28} /></div>
          <div>
            <strong>{stats.publicaciones}</strong>
            <h3>Publicaciones</h3>
            <p>{activas} activas · {pausadas} pausada{pausadas !== 1 ? "s" : ""}</p>
          </div>
        </article>
        <article className={`${styles.statCard} ${styles.statCardGreen}`}>
          <div className={`${styles.statIcon} ${styles.green}`}><MessageCircle size={28} /></div>
          <div>
            <strong>{stats.consultas}</strong>
            <h3>Consultas</h3>
            <p>{unread > 0 ? `${unread} sin leer` : "Todas respondidas"}</p>
          </div>
        </article>
        <article className={`${styles.statCard} ${styles.statCardPurple}`}>
          <div className={`${styles.statIcon} ${styles.purple}`}><Heart size={28} /></div>
          <div>
            <strong>{stats.favoritos}</strong>
            <h3>Favoritos</h3>
            <p>Entre todos los vehículos</p>
          </div>
        </article>
      </section>

      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>Publicaciones recientes</h2>
          <button className={styles.panelLink} onClick={() => onNavigate("publicaciones")}>
            Ver todas <ChevronRight size={14} />
          </button>
        </div>
        <div className={styles.pubsGrid}>
          {pubs.slice(0, 3).map((p) => (
            <PubCard key={p.id} pub={p} compact />
          ))}
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>Últimas consultas</h2>
          <button className={styles.panelLink} onClick={() => onNavigate("consultas")}>
            Ver todas <ChevronRight size={14} />
          </button>
        </div>
        {leads.length === 0 ? (
          <p style={{ padding: "1rem 1.25rem", color: "#6b7280", fontSize: 14 }}>Sin consultas todavía.</p>
        ) : (
          leads.slice(0, 3).map((c) => <ConsultaRow key={c.id} c={c} />)
        )}
      </div>
    </>
  );
}

function PubCard({ pub, compact, onToggle, onDelete, onEdit }) {
  const meta = STATUS_META[pub.status] || STATUS_META.activo;
  return (
    <article className={`${styles.pubCard} ${compact ? styles.pubCardCompact : ""}`}>
      {pub.image ? (
        <img src={pub.image} alt={pub.titulo} className={styles.pubImg} />
      ) : (
        <div className={styles.pubImgPlaceholder}>
          <Car size={32} className={styles.pubImgIcon} />
        </div>
      )}
      <div className={styles.pubInfo}>
        <div className={styles.pubTop}>
          <span className={styles.pubTitle}>{pub.titulo}</span>
          <span className={styles.statusBadge} style={{ color: meta.color, background: meta.bg }}>
            {meta.label}
          </span>
        </div>
        <span className={styles.pubMeta}>{pub.año} · {pub.km} km · {pub.precio}</span>
        <div className={styles.pubStats}>
          <span><Eye size={13} /> {pub.vistas}</span>
          <span><MessageCircle size={13} /> {pub.consultas}</span>
          <span><Heart size={13} /> {pub.favoritos}</span>
        </div>
      </div>
      {!compact && (
        <div className={styles.pubActions}>
          {pub.slug && (
            <Link
              to={`/vehiculo/${pub.slug}`}
              target="_blank"
              rel="noreferrer"
              className={styles.iconBtn}
              title="Ver publicación"
            >
              <Eye size={15} />
            </Link>
          )}
          <button
            className={styles.iconBtn}
            title="Editar"
            onClick={() => onEdit && onEdit(pub)}
          >
            <Edit2 size={15} />
          </button>
          <button
            className={styles.iconBtn}
            title={pub.status === "activo" ? "Pausar" : "Activar"}
            onClick={() => onToggle && onToggle(pub)}
          >
            {pub.status === "activo" ? <Pause size={15} /> : <Play size={15} />}
          </button>
          <button
            className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
            title="Eliminar"
            onClick={() => onDelete && onDelete(pub)}
          >
            <Trash2 size={15} />
          </button>
        </div>
      )}
    </article>
  );
}

const LEAD_PLACEHOLDER = "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=120&auto=format&fit=crop";

function ConsultaRow({ c }) {
  return (
    <div className={`${styles.consultaItem} ${!c.leido ? styles.consultaUnread : ""}`}>
      <img
        src={c.thumbnail || LEAD_PLACEHOLDER}
        alt={c.vehiculo}
        className={styles.consultaThumb}
        onError={(e) => { e.currentTarget.src = LEAD_PLACEHOLDER; }}
      />
      <div className={styles.consultaBody}>
        <div className={styles.consultaTop}>
          <strong>{c.nombre}</strong>
          <span className={styles.consultaHora}>{c.hora}</span>
        </div>
        <span className={styles.consultaVehiculo}>{c.vehiculo}</span>
        <p className={styles.consultaMsg}>{c.msg}</p>
      </div>
      {!c.leido && <div className={styles.consultaDot} />}
    </div>
  );
}

const FILTER_TABS = ["Todas", "Activas", "Pausadas", "Vendidas"];
const FILTER_STATUS = { Todas: null, Activas: "activo", Pausadas: "pausado", Vendidas: "vendido" };

function ViewPublicaciones({ pubs, loading, onToggle, onDelete, onEdit }) {
  const [filter, setFilter] = useState("Todas");

  const visible = FILTER_STATUS[filter]
    ? pubs.filter((p) => p.status === FILTER_STATUS[filter])
    : pubs;

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2>Mis publicaciones</h2>
        <Link to="/publicar/nuevo" className={styles.quickBtn} style={{ fontSize: 13 }}>
          <PlusCircle size={15} /> Nueva
        </Link>
      </div>
      <div className={styles.filterRow}>
        {FILTER_TABS.map((f) => (
          <button
            key={f}
            className={`${styles.filterBtn} ${f === filter ? styles.filterBtnActive : ""}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>
      <div className={styles.pubsList}>
        {loading ? (
          <p style={{ padding: "1.5rem", color: "#6b7280", textAlign: "center" }}>Cargando publicaciones…</p>
        ) : visible.length === 0 ? (
          <p style={{ padding: "1.5rem", color: "#6b7280", textAlign: "center" }}>No hay publicaciones en esta categoría.</p>
        ) : (
          visible.map((p) => <PubCard key={p.id} pub={p} onToggle={onToggle} onDelete={onDelete} onEdit={onEdit} />)
        )}
      </div>
    </div>
  );
}

function ViewConsultas({ leads, loading }) {
  const unread = leads.filter((c) => !c.leido).length;
  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2>Consultas recibidas</h2>
        {unread > 0 && <span className={styles.badge2}>{unread} sin leer</span>}
      </div>
      <div className={styles.consultasList}>
        {loading ? (
          <p style={{ padding: "1.5rem", color: "#6b7280", textAlign: "center" }}>Cargando consultas…</p>
        ) : leads.length === 0 ? (
          <p style={{ padding: "1.5rem", color: "#6b7280", textAlign: "center" }}>Sin consultas todavía.</p>
        ) : (
          leads.map((c) => <ConsultaRow key={c.id} c={c} />)
        )}
      </div>
    </div>
  );
}

/* ── Constants ──────────────────────────────────── */
const SV_DEPARTAMENTOS = [
  "Ahuachapán","Cabañas","Chalatenango","Cuscatlán","La Libertad",
  "La Paz","La Unión","Morazán","San Miguel","San Salvador",
  "San Vicente","Santa Ana","Sonsonate","Usulután",
];

const formatDUI = (val) => {
  const d = val.replace(/\D/g, "").slice(0, 9);
  return d.length <= 8 ? d : `${d.slice(0, 8)}-${d.slice(8)}`;
};

/* ── ConfirmModal ────────────────────────────────── */
function ConfirmModal({ type, userEmail, onConfirm, onClose, loading }) {
  const [checked, setChecked] = useState(false);
  const [step, setStep]       = useState(1);
  const [typed, setTyped]     = useState("");

  const emailMatch = typed.trim() === userEmail;

  if (type === "pauseAll") {
    return (
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalIconWrap} style={{ background: "#fffbeb" }}>
            <Pause size={26} style={{ color: "#d97706" }} />
          </div>
          <h3 className={styles.modalTitle}>Pausar todas las publicaciones</h3>
          <p className={styles.modalDesc}>
            Todos tus vehículos activos serán ocultados del marketplace.
            Los compradores no podrán verlos hasta que los reactives manualmente desde <strong>Mis publicaciones</strong>.
          </p>
          <label className={styles.modalCheck}>
            <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
            Entiendo que mis publicaciones dejarán de ser visibles
          </label>
          <div className={styles.modalActions}>
            <button className={styles.modalCancelBtn} onClick={onClose} type="button">Cancelar</button>
            <button
              className={`${styles.modalConfirmBtn} ${styles.modalConfirmOrange}`}
              onClick={onConfirm}
              disabled={!checked || loading}
              type="button"
            >
              {loading ? "Pausando…" : "Pausar todo"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (type === "deleteAccount") {
    return (
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
          {step === 1 ? (
            <>
              <div className={styles.modalIconWrap} style={{ background: "#fef2f2" }}>
                <ShieldAlert size={26} style={{ color: "#dc2626" }} />
              </div>
              <h3 className={styles.modalTitle}>¿Eliminar tu cuenta?</h3>
              <p className={styles.modalDesc}>Esta acción es <strong>permanente e irreversible</strong>. Se eliminará:</p>
              <ul className={styles.modalList}>
                <li>Tu cuenta y datos personales</li>
                <li>Todas tus publicaciones activas y pausadas</li>
                <li>Tu historial de consultas y mensajes</li>
                <li>Tus fotos e imágenes subidas</li>
              </ul>
              <div className={styles.modalActions}>
                <button className={styles.modalCancelBtn} onClick={onClose} type="button">Cancelar</button>
                <button
                  className={`${styles.modalConfirmBtn} ${styles.modalConfirmRed}`}
                  onClick={() => setStep(2)}
                  type="button"
                >
                  Continuar →
                </button>
              </div>
            </>
          ) : (
            <>
              <div className={styles.modalIconWrap} style={{ background: "#fef2f2" }}>
                <ShieldAlert size={26} style={{ color: "#dc2626" }} />
              </div>
              <h3 className={styles.modalTitle}>Confirmación final</h3>
              <p className={styles.modalDesc}>
                Escribí tu email <strong>{userEmail}</strong> para confirmar la eliminación permanente de tu cuenta.
              </p>
              <div className={styles.modalInputWrap}>
                <input
                  className={styles.modalInput}
                  type="email"
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  placeholder={userEmail}
                  autoFocus
                />
                {typed && !emailMatch && (
                  <span className={styles.modalInputError}>El email no coincide</span>
                )}
              </div>
              <div className={styles.modalActions}>
                <button className={styles.modalCancelBtn} onClick={() => setStep(1)} type="button">← Volver</button>
                <button
                  className={`${styles.modalConfirmBtn} ${styles.modalConfirmRed}`}
                  onClick={onConfirm}
                  disabled={!emailMatch || loading}
                  type="button"
                >
                  {loading ? "Eliminando…" : "Eliminar definitivamente"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return null;
}

function ViewPerfil() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const isMock   = !!user?.id?.startsWith("mock-");

  // Personal data — extended
  const [form, setForm] = useState({
    fullName:     user?.user_metadata?.full_name || "",
    phone:        user?.user_metadata?.phone     || "",
    birthDate:    "",
    dui:          "",
    gender:       "",
    department:   "",
    municipality: "",
    address:      "",
  });
  const [email, setEmail]     = useState(user?.email || "");
  const [loading, setLoading] = useState(!isMock);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [formError, setFormError] = useState("");

  // Avatar
  const [avatar, setAvatar]               = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Seller type
  const [sellerType, setSellerType]   = useState("particular");
  const [companyName, setCompanyName] = useState("");
  const [companyDesc, setCompanyDesc] = useState("");
  const [website, setWebsite]         = useState("");

  // Plan
  const [plan, setPlan] = useState(null);

  // Password
  const [pwForm, setPwForm]     = useState({ current: "", next: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError]   = useState("");
  const [pwSaved, setPwSaved]   = useState(false);

  // Notifications — keys match backend: emailNewLead, emailWeeklyStats, emailPromotions, pushNewLead
  const [notifs, setNotifs]           = useState({ emailNewLead: true, emailWeeklyStats: false, emailPromotions: false, pushNewLead: false });
  const [notifSaving, setNotifSaving] = useState(false);

  // Danger zone modal
  const [dangerModal,  setDangerModal]  = useState(null); // null | "pauseAll" | "deleteAccount"
  const [pausing,      setPausing]      = useState(false);
  const [deleting,     setDeleting]     = useState(false);
  const [pauseResult,  setPauseResult]  = useState("");

  useEffect(() => {
    if (isMock) return;
    api.get("/profile")
      .then((res) => {
        const d = res.data;
        setForm({
          fullName:     d.fullName     || "",
          phone:        d.phone        || "",
          birthDate:    d.birthDate    || "",
          dui:          d.dui          || "",
          gender:       d.gender       || "",
          department:   d.department   || "",
          municipality: d.municipality || "",
          address:      d.address      || "",
        });
        setEmail(d.email || "");
        setAvatar(d.avatarUrl || null);
        setSellerType(SELLER_TYPE_FROM_API(d.sellerType));
        setCompanyName(d.companyName || "");
        setCompanyDesc(d.companyDescription || "");
        setWebsite(d.website || "");
        setPlan(d.plan || null);
        if (d.notifications) {
          // Merge API response into state — keep defaults for any missing key
          setNotifs((prev) => ({ ...prev, ...d.notifications }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isMock]);

  const setField = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
      fd.append("folder", "avatars");
      const res  = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: fd }
      );
      const data = await res.json();
      setAvatar(data.secure_url);
      if (!isMock) await api.patch("/profile", { avatarUrl: data.secure_url }).catch(() => {});
    } catch { /* silently ignore */ }
    finally { setAvatarUploading(false); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (isMock) { setSaved(true); setTimeout(() => setSaved(false), 2000); return; }
    setSaving(true); setFormError("");
    try {
      await api.patch("/profile", {
        ...form,
        sellerType:         SELLER_TYPE_TO_API[sellerType] || "individual",
        companyName:        sellerType !== "particular" ? companyName : undefined,
        companyDescription: sellerType !== "particular" ? companyDesc  : undefined,
        website:            sellerType !== "particular" ? website      : undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { setFormError("No se pudo guardar. Intentá de nuevo."); }
    finally { setSaving(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm) { setPwError("Las contraseñas no coinciden."); return; }
    if (pwForm.next.length < 8)         { setPwError("Mínimo 8 caracteres."); return; }
    if (isMock) { setPwSaved(true); setTimeout(() => setPwSaved(false), 2500); return; }
    setPwSaving(true); setPwError("");
    try {
      await api.patch("/auth/password", { currentPassword: pwForm.current, newPassword: pwForm.next });
      setPwSaved(true);
      setPwForm({ current: "", next: "", confirm: "" });
      setTimeout(() => setPwSaved(false), 3000);
    } catch (err) {
      if (err?.status === 429) {
        setPwError("Demasiados intentos fallidos. Esperá unos minutos antes de volver a intentarlo.");
      } else if (err?.status === 400) {
        setPwError("Contraseña actual incorrecta.");
      } else {
        setPwError(err?.message || "No se pudo cambiar la contraseña.");
      }
    }
    finally { setPwSaving(false); }
  };

  const handleNotifToggle = async (key) => {
    const next = { ...notifs, [key]: !notifs[key] };
    setNotifs(next);
    if (!isMock) {
      setNotifSaving(true);
      // Backend requires all 4 fields — full replacement, not partial
      await api.patch("/profile/notifications", {
        emailNewLead:    next.emailNewLead,
        emailWeeklyStats: next.emailWeeklyStats,
        emailPromotions: next.emailPromotions,
        pushNewLead:     next.pushNewLead,
      }).catch(() => {});
      setNotifSaving(false);
    }
  };

  const handlePauseAllConfirm = async () => {
    setPausing(true);
    if (!isMock) {
      const res = await api.patch("/profile/vehicles/pause-all").catch(() => null);
      const n = res?.affected ?? 0;
      setPauseResult(n === 0
        ? "No había publicaciones activas."
        : `${n} publicación${n !== 1 ? "es" : ""} pausada${n !== 1 ? "s" : ""}.`);
    } else {
      setPauseResult("Publicaciones pausadas (modo demo).");
    }
    setPausing(false);
    setDangerModal(null);
    setTimeout(() => setPauseResult(""), 5000);
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      if (!isMock) await api.delete("/profile");
      clearTokens(); // token is immediately invalid after DELETE /profile
      await signOut();
      navigate("/");
    } catch { setDeleting(false); setDangerModal(null); }
  };

  const initials   = (form.fullName || email || "V").charAt(0).toUpperCase();
  const PLAN_NAMES = { basic: "Básico", premium: "Premium", featured: "Destacado" };

  if (loading) return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}><h2>Mi perfil</h2></div>
      <p style={{ padding: "2rem", color: "#94a3b8" }}>Cargando perfil…</p>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Datos personales + tipo de cuenta ── */}
      <div className={styles.panel}>
        <div className={styles.panelHeader}><h2>Mi perfil</h2></div>

        <div className={styles.avatarSection}>
          <label className={styles.avatarWrap} title="Cambiar foto de perfil">
            {avatar
              ? <img src={avatar} alt="avatar" className={styles.avatarImg} />
              : <div className={styles.avatarCircle}>{initials}</div>
            }
            <div className={styles.avatarOverlay}>
              {avatarUploading ? "…" : <Camera size={15} />}
            </div>
            <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} disabled={avatarUploading} />
          </label>
          <div>
            <strong className={styles.avatarName}>{form.fullName || email}</strong>
            <p className={styles.avatarSub}>
              {sellerType === "empresa" ? companyName || "Empresa"
                : sellerType === "concesionario" ? "Concesionario"
                : "Vendedor particular"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className={styles.profileForm}>

          {/* Datos personales */}
          <div className={styles.profileSection}>
            <h3 className={styles.profileSectionTitle}><User size={15} /> Datos personales</h3>
            <div className={styles.profileGrid}>
              <div className={styles.profileField}>
                <label>Nombre completo *</label>
                <input value={form.fullName} onChange={setField("fullName")} placeholder="Tu nombre completo" required />
              </div>
              <div className={styles.profileField}>
                <label>Email</label>
                <input value={email} disabled type="email" />
              </div>
              <div className={styles.profileField}>
                <label>Teléfono / WhatsApp *</label>
                <input value={form.phone} onChange={setField("phone")} placeholder="+503 7000-0000" required />
              </div>
              <div className={styles.profileField}>
                <label>Fecha de nacimiento</label>
                <input type="date" value={form.birthDate} onChange={setField("birthDate")} max={new Date().toISOString().split("T")[0]} />
              </div>
              <div className={styles.profileField}>
                <label>DUI <span className={styles.fieldNote}>XXXXXXXX-X</span></label>
                <input
                  value={form.dui}
                  onChange={(e) => setForm((p) => ({ ...p, dui: formatDUI(e.target.value) }))}
                  placeholder="00000000-0"
                  maxLength={10}
                  inputMode="numeric"
                />
              </div>
              <div className={styles.profileField}>
                <label>Género</label>
                <select value={form.gender} onChange={setField("gender")}>
                  <option value="">Prefiero no decir</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                </select>
              </div>
            </div>
          </div>

          {/* Dirección */}
          <div className={styles.profileSection}>
            <h3 className={styles.profileSectionTitle}><Building2 size={15} /> Dirección</h3>
            <div className={styles.profileGrid}>
              <div className={styles.profileField}>
                <label>Departamento</label>
                <select value={form.department} onChange={setField("department")}>
                  <option value="">Seleccioná un departamento</option>
                  {SV_DEPARTAMENTOS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className={styles.profileField}>
                <label>Municipio</label>
                <input value={form.municipality} onChange={setField("municipality")} placeholder="Tu municipio" />
              </div>
              <div className={`${styles.profileField} ${styles.colSpan2}`}>
                <label>Dirección</label>
                <input value={form.address} onChange={setField("address")} placeholder="Calle, colonia, número de casa…" />
              </div>
            </div>
          </div>

          {/* Tipo de cuenta */}
          <div className={styles.profileSection}>
            <h3 className={styles.profileSectionTitle}><Building2 size={15} /> Tipo de cuenta</h3>
            <div className={styles.sellerTypePills}>
              {[
                { id: "particular",    label: "Particular"    },
                { id: "concesionario", label: "Concesionario" },
                { id: "empresa",       label: "Empresa"       },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`${styles.sellerPill} ${sellerType === t.id ? styles.sellerPillActive : ""}`}
                  onClick={() => setSellerType(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
            {sellerType !== "particular" && (
              <div className={styles.profileGrid} style={{ marginTop: 14 }}>
                <div className={styles.profileField}>
                  <label>Nombre comercial</label>
                  <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Nombre de tu empresa o concesionario" />
                </div>
                <div className={styles.profileField}>
                  <label>Sitio web</label>
                  <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://tusitio.com" type="url" />
                </div>
                {sellerType === "empresa" && (
                  <div className={`${styles.profileField} ${styles.colSpan2}`}>
                    <label>Descripción breve</label>
                    <textarea
                      className={styles.profileTextarea}
                      value={companyDesc}
                      onChange={(e) => setCompanyDesc(e.target.value)}
                      placeholder="Contale a los compradores sobre tu empresa…"
                      rows={3}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className={styles.profileFooter}>
            {saved     && <span className={styles.savedMsg}><CheckCircle size={15} /> Cambios guardados</span>}
            {formError && <span style={{ color: "#dc2626", fontSize: 13 }}>{formError}</span>}
            <button type="submit" className={styles.saveBtn} disabled={saving}>
              <Save size={16} /> {saving ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>

      {/* ── Plan activo ── */}
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>Plan activo</h2>
          <Link to="/publicar/nuevo" className={styles.panelLink}>
            <TrendingUp size={14} /> Nueva publicación
          </Link>
        </div>
        <div className={styles.planSection}>
          {plan ? (
            <>
              <div className={styles.planTop}>
                <span className={styles.planBadge}>{PLAN_NAMES[plan.name] || plan.name}</span>
                {plan.expiresAt && (
                  <span className={styles.planExpiry}>
                    Vence el {new Date(plan.expiresAt).toLocaleDateString("es-SV")}
                  </span>
                )}
              </div>
              <p className={styles.planMeta}>
                {plan.vehiclesUsed ?? 0} de {plan.vehiclesLimit ?? "—"} publicaciones usadas
              </p>
              <div className={styles.planBar}>
                <div
                  className={styles.planBarFill}
                  style={{
                    width: plan.vehiclesLimit
                      ? `${Math.min(100, Math.round((plan.vehiclesUsed / plan.vehiclesLimit) * 100))}%`
                      : "0%",
                  }}
                />
              </div>
            </>
          ) : (
            <p style={{ color: "#94a3b8", fontSize: 13, margin: 0 }}>
              Sin plan activo. Publicá un vehículo para elegir un plan.
            </p>
          )}
        </div>
      </div>

      {/* ── Cambiar contraseña ── */}
      <div className={styles.panel}>
        <div className={styles.panelHeader}><h2><Lock size={16} style={{ marginRight: 6 }} />Cambiar contraseña</h2></div>
        <form onSubmit={handlePasswordChange} className={styles.profileForm}>
          <div className={styles.profileGrid}>
            <div className={styles.profileField}>
              <label>Contraseña actual</label>
              <input type="password" value={pwForm.current} onChange={(e) => setPwForm((p) => ({ ...p, current: e.target.value }))} placeholder="••••••••" required />
            </div>
            <div />
            <div className={styles.profileField}>
              <label>Nueva contraseña</label>
              <input type="password" value={pwForm.next} onChange={(e) => setPwForm((p) => ({ ...p, next: e.target.value }))} placeholder="Mínimo 8 caracteres" required minLength={8} />
            </div>
            <div className={styles.profileField}>
              <label>Confirmar contraseña</label>
              <input type="password" value={pwForm.confirm} onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))} placeholder="Repetí la nueva contraseña" required />
            </div>
          </div>
          <div className={styles.profileFooter}>
            {pwSaved && <span className={styles.savedMsg}><CheckCircle size={15} /> Contraseña actualizada</span>}
            {pwError && <span style={{ color: "#dc2626", fontSize: 13 }}>{pwError}</span>}
            <button type="submit" className={styles.saveBtn} disabled={pwSaving}>
              {pwSaving ? "Actualizando…" : "Cambiar contraseña"}
            </button>
          </div>
        </form>
      </div>

      {/* ── Notificaciones ── */}
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2><Bell size={16} style={{ marginRight: 6 }} />Notificaciones por email</h2>
          {notifSaving && <span style={{ fontSize: 12, color: "#94a3b8" }}>Guardando…</span>}
        </div>
        <div className={styles.notifList}>
          {[
            { key: "emailNewLead",     label: "Nueva consulta recibida",   desc: "Te avisamos cuando alguien envía un mensaje sobre tu vehículo."   },
            { key: "emailWeeklyStats", label: "Estadísticas semanales",    desc: "Resumen semanal de visitas y consultas de tus publicaciones."      },
            { key: "emailPromotions",  label: "Promociones y novedades",   desc: "Ofertas especiales, descuentos en planes y novedades del sitio."   },
            { key: "pushNewLead",      label: "Push: nueva consulta",      desc: "Notificación push en el navegador cuando llegue una consulta."     },
          ].map(({ key, label, desc }) => (
            <label key={key} className={styles.notifRow}>
              <div className={styles.notifText}>
                <span className={styles.notifLabel}>{label}</span>
                <span className={styles.notifDesc}>{desc}</span>
              </div>
              <input type="checkbox" className={styles.toggleInput} checked={notifs[key]} onChange={() => handleNotifToggle(key)} />
              <span className={styles.toggleTrack} />
            </label>
          ))}
        </div>
      </div>

      {/* ── Zona de peligro ── */}
      <div className={`${styles.panel} ${styles.dangerPanel}`}>
        <div className={styles.panelHeader}>
          <h2><ShieldAlert size={16} style={{ marginRight: 6, color: "#dc2626" }} />Zona de peligro</h2>
        </div>
        <div className={styles.dangerBody}>
          <div className={styles.dangerRow}>
            <div>
              <p className={styles.dangerTitle}>Pausar todas las publicaciones</p>
              <p className={styles.dangerDesc}>Oculta temporalmente todos tus vehículos activos del marketplace.</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
              <button className={styles.dangerBtn} onClick={() => setDangerModal("pauseAll")} type="button">
                Pausar todo
              </button>
              {pauseResult && (
                <span style={{ fontSize: 12, color: "#059669", fontWeight: 700 }}>{pauseResult}</span>
              )}
            </div>
          </div>
          <div className={`${styles.dangerRow} ${styles.dangerRowSep}`}>
            <div>
              <p className={styles.dangerTitle}>Eliminar mi cuenta</p>
              <p className={styles.dangerDesc}>Borra permanentemente tu cuenta, publicaciones y datos. Esta acción no se puede deshacer.</p>
            </div>
            <button className={`${styles.dangerBtn} ${styles.dangerBtnRed}`} onClick={() => setDangerModal("deleteAccount")} type="button">
              Eliminar cuenta
            </button>
          </div>
        </div>
      </div>

      {/* ── Modales ── */}
      {dangerModal === "pauseAll" && (
        <ConfirmModal
          type="pauseAll"
          userEmail={email}
          loading={pausing}
          onConfirm={handlePauseAllConfirm}
          onClose={() => setDangerModal(null)}
        />
      )}
      {dangerModal === "deleteAccount" && (
        <ConfirmModal
          type="deleteAccount"
          userEmail={email}
          loading={deleting}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDangerModal(null)}
        />
      )}

    </div>
  );
}

/* ── Main component ───────────────────────────── */
const NAV = [
  { id: "inicio",         label: "Inicio",            icon: <Home size={20} /> },
  { id: "publicaciones",  label: "Mis publicaciones", icon: <Car size={20} /> },
  { id: "consultas",      label: "Consultas",          icon: <MessageCircle size={20} /> },
  { id: "perfil",         label: "Mi perfil",          icon: <User size={20} /> },
];

const VALID_TABS = ["inicio", "publicaciones", "consultas", "perfil"];

const VendedorDashboard = () => {
  const { user }   = useAuth();
  const location   = useLocation();
  const navigate   = useNavigate();
  const tabParam   = new URLSearchParams(location.search).get("tab");
  const successParam = new URLSearchParams(location.search).get("success");
  const [view, setView]         = useState(VALID_TABS.includes(tabParam) ? tabParam : "inicio");
  const [showSuccess, setShowSuccess] = useState(successParam === "1");
  const [pubs, setPubs]         = useState([]);
  const [loadingPubs, setLoadingPubs] = useState(true);
  const [leads, setLeads]       = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(true);

  useEffect(() => {
    const tab = new URLSearchParams(location.search).get("tab");
    setView(VALID_TABS.includes(tab) ? tab : "inicio");
  }, [location.search]);

  useEffect(() => {
    if (!user) return;
    if (user.id?.startsWith("mock-")) {
      setLoadingPubs(false);
      setLoadingLeads(false);
      return;
    }
    const fetchPubs = async () => {
      setLoadingPubs(true);
      try {
        const res = await api.get("/profile/vehicles");
        setPubs((res.data || []).map(mapRowToPub));
      } catch {
        setPubs([]);
      }
      setLoadingPubs(false);
    };
    const fetchLeads = async () => {
      setLoadingLeads(true);
      try {
        const res = await api.get("/leads/me");
        setLeads((res.data || []).map(mapLead));
      } catch {
        setLeads([]);
      }
      setLoadingLeads(false);
    };
    fetchPubs();
    fetchLeads();
  }, [user]);

  const handleToggle = useCallback(async (pub) => {
    const newStatus = pub.status === "activo" ? "PAUSED" : "ACTIVE";
    try {
      await api.patch(`/vehicles/${pub.id}/status`, { status: newStatus });
      setPubs((prev) =>
        prev.map((p) =>
          p.id === pub.id ? { ...p, status: STATUS_LABEL[newStatus] || "activo" } : p
        )
      );
    } catch {
      // silently fail — vehicle card stays as-is
    }
  }, []);

  const handleEdit = useCallback((pub) => {
    navigate(`/editar/vehiculo/${pub.slug || pub.id}`);
  }, [navigate]);

  const handleDelete = useCallback(async (pub) => {
    if (!window.confirm(`¿Eliminar "${pub.titulo}"? Esta acción no se puede deshacer.`)) return;
    try {
      await api.patch(`/vehicles/${pub.id}/status`, { status: "DELETED" });
      setPubs((prev) => prev.filter((p) => p.id !== pub.id));
    } catch {
      // silently fail
    }
  }, []);

  const unread = leads.filter((c) => !c.leido).length;

  const stats = useMemo(() => ({
    publicaciones: pubs.length,
    consultas: leads.length,
    favoritos: 0,
  }), [pubs, leads]);

  const userName = user?.fullName?.split(" ")[0]
    || user?.email?.split("@")[0]
    || "Usuario";

  return (
    <div className={styles.page}>
      <Navbar />

      {showSuccess && (
        <div className={styles.successBanner}>
          <CheckCircle size={18} />
          <span>¡Tu publicación fue enviada con éxito!</span>
          <button className={styles.successClose} onClick={() => setShowSuccess(false)}>✕</button>
        </div>
      )}

      <header className={styles.pageHeader}>
        <div className={styles.pageHeaderInner}>
          <div>
            <h1 className={styles.pageHeaderTitle}>Hola, {userName} 👋</h1>
            <p className={styles.pageHeaderSub}>Bienvenido a tu panel de vendedor</p>
          </div>
          <Link to="/publicar/nuevo" className={styles.headerCta}>
            <PlusCircle size={17} /> Nueva publicación
          </Link>
        </div>
      </header>

      <div className={styles.shell}>
        <aside className={styles.sidebar}>
          <div>
            <div className={styles.sideUser}>
              <div className={styles.sideUserAvatar}>{userName.charAt(0).toUpperCase()}</div>
              <div className={styles.sideUserInfo}>
                <span className={styles.sideUserName}>{userName}</span>
                <span className={styles.sideUserRole}>Vendedor</span>
              </div>
            </div>
            <div className={styles.sideDivider} />

            <nav className={styles.sideNav}>
              {NAV.map((item) => (
                <button
                  key={item.id}
                  className={`${styles.sideItem} ${view === item.id ? styles.active : ""}`}
                  onClick={() => setView(item.id)}
                >
                  <span className={styles.sideIcon}>{item.icon}</span>
                  {item.label}
                  {item.id === "consultas" && unread > 0 && (
                    <span className={styles.sideBadge}>{unread}</span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className={styles.supportCard}>
            <div className={styles.supportIcon}><Headphones size={22} /></div>
            <h3>¿Necesitás ayuda?</h3>
            <p>Estamos para ayudarte con tu publicación.</p>
            <Link to="/contacto" className={styles.supportBtn}>
              Contactar soporte <ArrowRight size={16} />
            </Link>
          </div>
        </aside>

        <main className={styles.content}>
          {view === "inicio"        && <ViewInicio stats={stats} pubs={pubs} leads={leads} unread={unread} onNavigate={setView} />}
          {view === "publicaciones" && <ViewPublicaciones pubs={pubs} loading={loadingPubs} onToggle={handleToggle} onDelete={handleDelete} onEdit={handleEdit} />}
          {view === "consultas"     && <ViewConsultas leads={leads} loading={loadingLeads} />}
          {view === "perfil"        && <ViewPerfil />}
        </main>
      </div>
    </div>
  );
};

export default VendedorDashboard;
