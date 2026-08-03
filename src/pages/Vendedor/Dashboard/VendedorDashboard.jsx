import { useState, useEffect, useMemo } from "react";
import { supabase } from "../../../lib/supabase";
import { Link, useLocation } from "react-router-dom";
import {
  Home, Car, MessageCircle, Heart, PlusCircle,
  Headphones, ArrowRight, Eye, Edit2, Trash2, Pause,
  Play, CheckCircle, User, Save, Bell,
  TrendingUp, ChevronRight, ShieldCheck, Upload,
  CreditCard, AlertCircle, Loader2, Camera,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import Navbar from "../../../components/Navbar/Navbar";
import styles from "./VendedorDashboard.module.css";

/* ── Helpers ──────────────────────────────────── */
const mapRowToPub = (row) => ({
  id:        row.id,
  titulo:    [row.marca, row.modelo, row.version].filter(Boolean).join(" "),
  año:       row.anio || 0,
  km:        (row.kilometraje || 0).toLocaleString("en-US"),
  precio:    `$${new Intl.NumberFormat("en-US").format(row.precio || 0)}`,
  status:    row.status || "activo",
  vistas:    row.vistas || 0,
  consultas: 0,
  favoritos: 0,
});

const CONSULTAS = [
  { id: 1, nombre: "Juan García",    vehiculo: "Toyota Corolla XEI 2020",  msg: "Hola, me interesa el vehículo. ¿Sigue disponible? ¿Lo podría ver este fin de semana?", hora: "hace 2h",     leido: false },
  { id: 2, nombre: "María López",    vehiculo: "Honda Civic EX 2019",       msg: "¿El precio es negociable? ¿Aceptás permutas con diferencia?",                            hora: "hace 5h",     leido: false },
  { id: 3, nombre: "Carlos Pérez",   vehiculo: "Toyota Corolla XEI 2020",  msg: "¿Tiene los service al día? ¿Cuántos dueños tuvo? ¿Hubo algún golpe?",                    hora: "ayer",         leido: true  },
  { id: 4, nombre: "Ana Rodríguez",  vehiculo: "Ford Focus Trend 2018",     msg: "¿Se puede ver el fin de semana en zona norte?",                                          hora: "hace 3 días",  leido: true  },
  { id: 5, nombre: "Roberto Silva",  vehiculo: "Volkswagen Golf GTI 2021",  msg: "¿Por qué está pausado? ¿Tiene algún inconveniente el vehículo?",                         hora: "hace 5 días",  leido: true  },
];

const STATUS_META = {
  activo:  { label: "Activo",  color: "#059669", bg: "rgba(5,150,105,0.08)"  },
  pausado: { label: "Pausado", color: "#d97706", bg: "rgba(217,119,6,0.08)"  },
  vendido: { label: "Vendido", color: "#6b7a99", bg: "rgba(107,122,153,0.1)" },
};

/* ── Sub-views ────────────────────────────────── */
function ViewInicio({ stats, pubs, unread, onNavigate }) {
  const activas = pubs.filter((p) => p.status === "activo").length;
  const pausadas = pubs.filter((p) => p.status === "pausado").length;

  return (
    <>
      {/* Unread alert */}
      {unread > 0 && (
        <div className={styles.alertBanner}>
          <MessageCircle size={16} />
          <span>Tenés <strong>{unread}</strong> {unread === 1 ? "consulta sin leer" : "consultas sin leer"}</span>
          <button className={styles.alertBtn} onClick={() => onNavigate("consultas")}>
            Ver ahora <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Stats */}
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

      {/* Recent publications */}
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

      {/* Recent consultas */}
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>Últimas consultas</h2>
          <button className={styles.panelLink} onClick={() => onNavigate("consultas")}>
            Ver todas <ChevronRight size={14} />
          </button>
        </div>
        {CONSULTAS.slice(0, 3).map((c) => (
          <ConsultaRow key={c.id} c={c} />
        ))}
      </div>
    </>
  );
}

function PubCard({ pub, compact }) {
  const meta = STATUS_META[pub.status];
  return (
    <article className={`${styles.pubCard} ${compact ? styles.pubCardCompact : ""}`}>
      <div className={styles.pubImgPlaceholder}>
        <Car size={32} className={styles.pubImgIcon} />
      </div>
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
          <button className={styles.iconBtn} title="Editar"><Edit2 size={15} /></button>
          <button className={styles.iconBtn} title={pub.status === "activo" ? "Pausar" : "Activar"}>
            {pub.status === "activo" ? <Pause size={15} /> : <Play size={15} />}
          </button>
          <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} title="Eliminar"><Trash2 size={15} /></button>
        </div>
      )}
    </article>
  );
}

function ConsultaRow({ c }) {
  return (
    <div className={`${styles.consultaItem} ${!c.leido ? styles.consultaUnread : ""}`}>
      <div className={styles.consultaAvatar}>{c.nombre.charAt(0)}</div>
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

function ViewPublicaciones({ pubs, loading }) {
  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2>Mis publicaciones</h2>
        <Link to="/publicar/nuevo" className={styles.quickBtn} style={{ fontSize: 13 }}>
          <PlusCircle size={15} /> Nueva
        </Link>
      </div>
      <div className={styles.filterRow}>
        {["Todas", "Activas", "Pausadas", "Vendidas"].map((f) => (
          <button key={f} className={`${styles.filterBtn} ${f === "Todas" ? styles.filterBtnActive : ""}`}>{f}</button>
        ))}
      </div>
      <div className={styles.pubsList}>
        {loading ? (
          <p style={{ padding: "1.5rem", color: "#6b7280", textAlign: "center" }}>Cargando publicaciones…</p>
        ) : pubs.length === 0 ? (
          <p style={{ padding: "1.5rem", color: "#6b7280", textAlign: "center" }}>Todavía no tenés publicaciones.</p>
        ) : (
          pubs.map((p) => <PubCard key={p.id} pub={p} />)
        )}
      </div>
    </div>
  );
}

function ViewConsultas() {
  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2>Consultas recibidas</h2>
        <span className={styles.badge2}>{CONSULTAS.filter((c) => !c.leido).length} sin leer</span>
      </div>
      <div className={styles.consultasList}>
        {CONSULTAS.map((c) => (
          <ConsultaRow key={c.id} c={c} />
        ))}
      </div>
    </div>
  );
}

const CLOUD_NAME    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const uploadDocToCloudinary = async (file) => {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", UPLOAD_PRESET);
  fd.append("folder", "documentos");
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: fd }
  );
  if (!res.ok) throw new Error("Error al subir");
  return (await res.json()).secure_url;
};

const SV_DEPARTAMENTOS = [
  "Ahuachapán","Cabañas","Chalatenango","Cuscatlán","La Libertad",
  "La Paz","La Unión","Morazán","San Miguel","San Salvador",
  "San Vicente","Santa Ana","Sonsonate","Usulután",
];

function ViewPerfil({ user }) {
  const [form, setForm] = useState({
    nombre:       user?.user_metadata?.full_name || "",
    email:        user?.email || "",
    telefono:     user?.user_metadata?.phone || "",
    dui:          "",
    fechaNac:     "",
    departamento: "San Salvador",
    ciudad:       "",
  });
  const [saved, setSaved] = useState(false);

  // DUI photo state
  const [duiFile, setDuiFile]       = useState(null);
  const [duiPreview, setDuiPreview] = useState(null);
  const [duiUploading, setDuiUploading] = useState(false);
  const [duiUrl, setDuiUrl]         = useState(null);

  // Selfie state
  const [selfieFile, setSelfieFile]       = useState(null);
  const [selfiePreview, setSelfiePreview] = useState(null);
  const [selfieUploading, setSelfieUploading] = useState(false);
  const [selfieUrl, setSelfieUrl]         = useState(null);

  const [docStatus] = useState("sin_subir"); // sin_subir | pendiente | verificado | rechazado
  const [uploadError, setUploadError] = useState("");

  const set = (k) => (e) => { setForm((p) => ({ ...p, [k]: e.target.value })); setSaved(false); };

  const handleDuiChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setDuiFile(file);
    setDuiPreview(URL.createObjectURL(file));
    setDuiUploading(true);
    setUploadError("");
    try {
      const url = await uploadDocToCloudinary(file);
      setDuiUrl(url);
    } catch {
      setUploadError("Error al subir el DUI. Intentá de nuevo.");
    } finally {
      setDuiUploading(false);
    }
  };

  const handleSelfieChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelfieFile(file);
    setSelfiePreview(URL.createObjectURL(file));
    setSelfieUploading(true);
    setUploadError("");
    try {
      const url = await uploadDocToCloudinary(file);
      setSelfieUrl(url);
    } catch {
      setUploadError("Error al subir la selfie. Intentá de nuevo.");
    } finally {
      setSelfieUploading(false);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const bothUploaded = duiUrl && selfieUrl;

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}><h2>Mi perfil</h2></div>

      <div className={styles.avatarSection}>
        <div className={styles.avatarCircle}>{form.nombre.charAt(0).toUpperCase()}</div>
        <div>
          <strong className={styles.avatarName}>{form.nombre}</strong>
          <p className={styles.avatarSub}>Cuenta de vendedor</p>
        </div>
      </div>

      <form onSubmit={handleSave} className={styles.profileForm}>
        {/* Datos personales */}
        <div className={styles.profileSection}>
          <h3 className={styles.profileSectionTitle}><User size={15} /> Datos personales</h3>
          <div className={styles.profileGrid}>
            <div className={styles.profileField}>
              <label>Nombre completo</label>
              <input value={form.nombre} onChange={set("nombre")} placeholder="Tu nombre completo" />
            </div>
            <div className={styles.profileField}>
              <label>Email</label>
              <input value={form.email} onChange={set("email")} placeholder="tu@email.com" type="email" />
            </div>
            <div className={styles.profileField}>
              <label>Teléfono / WhatsApp <span className={styles.fieldNote}>— único por cuenta</span></label>
              <input value={form.telefono} onChange={set("telefono")} placeholder="+503 7000-0000" />
            </div>
            <div className={styles.profileField}>
              <label>DUI <span className={styles.fieldNote}>— único por cuenta</span></label>
              <input value={form.dui} onChange={set("dui")} placeholder="00000000-0" maxLength={10} />
            </div>
            <div className={styles.profileField}>
              <label>Fecha de nacimiento</label>
              <input value={form.fechaNac} onChange={set("fechaNac")} placeholder="DD/MM/AAAA" />
            </div>
          </div>
        </div>

        {/* Ubicación */}
        <div className={styles.profileSection}>
          <h3 className={styles.profileSectionTitle}><TrendingUp size={15} /> Ubicación</h3>
          <div className={styles.profileGrid}>
            <div className={styles.profileField}>
              <label>Departamento</label>
              <select value={form.departamento} onChange={set("departamento")}>
                {SV_DEPARTAMENTOS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className={styles.profileField}>
              <label>Municipio / Ciudad</label>
              <input value={form.ciudad} onChange={set("ciudad")} placeholder="Tu municipio" />
            </div>
          </div>
        </div>

        {/* Verificación de identidad */}
        <div className={styles.profileSection}>
          <h3 className={styles.profileSectionTitle}><ShieldCheck size={15} /> Verificación de identidad</h3>

          <div className={styles.docVerifSection}>
            {/* Status banner */}
            {docStatus === "sin_subir" && (
              <div className={`${styles.docBanner} ${styles.docBannerWarning}`}>
                <AlertCircle size={16} />
                <div>
                  <strong>Identidad no verificada</strong>
                  <p>Para publicar vehículos necesitás verificar tu identidad con tu DUI. La revisión es manual y tarda hasta 24 hs.</p>
                </div>
              </div>
            )}
            {docStatus === "pendiente" && (
              <div className={`${styles.docBanner} ${styles.docBannerInfo}`}>
                <ShieldCheck size={16} />
                <div><strong>En revisión</strong><p>Tus documentos están siendo revisados. Te notificaremos por email.</p></div>
              </div>
            )}
            {docStatus === "verificado" && (
              <div className={`${styles.docBanner} ${styles.docBannerSuccess}`}>
                <CheckCircle size={16} />
                <div><strong>Identidad verificada ✓</strong><p>Tu DUI fue verificado correctamente.</p></div>
              </div>
            )}
            {docStatus === "rechazado" && (
              <div className={`${styles.docBanner} ${styles.docBannerDanger}`}>
                <AlertCircle size={16} />
                <div><strong>Documentos rechazados</strong><p>La imagen no era legible o no coincidía. Subí fotos nuevas.</p></div>
              </div>
            )}

            {uploadError && (
              <p className={styles.docUploadError}><AlertCircle size={13} /> {uploadError}</p>
            )}

            {docStatus !== "verificado" && (
              <div className={styles.docUploadsGrid}>
                {/* DUI photo */}
                <div className={styles.docUploadItem}>
                  <p className={styles.docUploadItemLabel}><CreditCard size={14} /> Foto frontal del DUI</p>
                  <label className={`${styles.docUploadZone} ${duiUrl ? styles.docUploadDone : ""}`}>
                    <input type="file" accept="image/*" onChange={handleDuiChange} hidden />
                    {duiUploading ? (
                      <><Loader2 size={22} className={styles.docSpin} /><span className={styles.docUploadLabel}>Subiendo…</span></>
                    ) : duiPreview ? (
                      <img src={duiPreview} alt="DUI" className={styles.docPreviewImg} />
                    ) : (
                      <><Upload size={20} color="#94a3b8" /><span className={styles.docUploadLabel}>Subir foto del DUI</span><span className={styles.docUploadSub}>JPG o PNG · máx. 5 MB</span></>
                    )}
                    {duiUrl && !duiUploading && (
                      <span className={styles.docUploadCheck}><CheckCircle size={16} /></span>
                    )}
                  </label>
                </div>

                {/* Selfie */}
                <div className={styles.docUploadItem}>
                  <p className={styles.docUploadItemLabel}><Camera size={14} /> Selfie sosteniendo el DUI</p>
                  <label className={`${styles.docUploadZone} ${selfieUrl ? styles.docUploadDone : ""}`}>
                    <input type="file" accept="image/*" onChange={handleSelfieChange} hidden />
                    {selfieUploading ? (
                      <><Loader2 size={22} className={styles.docSpin} /><span className={styles.docUploadLabel}>Subiendo…</span></>
                    ) : selfiePreview ? (
                      <img src={selfiePreview} alt="Selfie" className={styles.docPreviewImg} />
                    ) : (
                      <><Camera size={20} color="#94a3b8" /><span className={styles.docUploadLabel}>Subir selfie con DUI</span><span className={styles.docUploadSub}>Sostenelo cerca de tu rostro</span></>
                    )}
                    {selfieUrl && !selfieUploading && (
                      <span className={styles.docUploadCheck}><CheckCircle size={16} /></span>
                    )}
                  </label>
                </div>
              </div>
            )}

            {bothUploaded && (
              <p className={styles.docFileName}><CheckCircle size={13} /> Ambas fotos listas — se enviarán al guardar</p>
            )}
          </div>
        </div>

        {/* Notificaciones */}
        <div className={styles.profileSection}>
          <h3 className={styles.profileSectionTitle}><Bell size={15} /> Notificaciones</h3>
          <div className={styles.toggleList}>
            {[
              { label: "Nuevas consultas por email", defaultOn: true },
              { label: "Actualizaciones de la plataforma", defaultOn: false },
              { label: "Recordatorios de publicaciones vencidas", defaultOn: true },
            ].map((n) => (
              <label key={n.label} className={styles.toggleRow}>
                <span>{n.label}</span>
                <input type="checkbox" defaultChecked={n.defaultOn} className={styles.toggleInput} />
                <span className={styles.toggleTrack} />
              </label>
            ))}
          </div>
        </div>

        <div className={styles.profileFooter}>
          {saved && <span className={styles.savedMsg}><CheckCircle size={15} /> Cambios guardados</span>}
          <button type="submit" className={styles.saveBtn} disabled={duiUploading || selfieUploading}>
            <Save size={16} /> Guardar cambios
          </button>
        </div>
      </form>
    </div>
  );
}

/* ── Main component ───────────────────────────── */
const NAV = [
  { id: "inicio",         label: "Inicio",             icon: <Home size={20} /> },
  { id: "publicaciones",  label: "Mis publicaciones",  icon: <Car size={20} /> },
  { id: "consultas",      label: "Consultas",           icon: <MessageCircle size={20} /> },
  { id: "perfil",         label: "Mi perfil",           icon: <User size={20} /> },
];

const VALID_TABS = ["inicio", "publicaciones", "consultas", "perfil"];

const VendedorDashboard = () => {
  const { user }   = useAuth();
  const location   = useLocation();
  const tabParam   = new URLSearchParams(location.search).get("tab");
  const [view, setView] = useState(VALID_TABS.includes(tabParam) ? tabParam : "inicio");
  const [pubs, setPubs]         = useState([]);
  const [loadingPubs, setLoadingPubs] = useState(true);

  useEffect(() => {
    const tab = new URLSearchParams(location.search).get("tab");
    setView(VALID_TABS.includes(tab) ? tab : "inicio");
  }, [location.search]);

  useEffect(() => {
    if (!user) return;
    if (user.id.startsWith("mock-")) {
      setLoadingPubs(false);
      return;
    }
    const fetchPubs = async () => {
      setLoadingPubs(true);
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });
      if (!error && data) setPubs(data.map(mapRowToPub));
      setLoadingPubs(false);
    };
    fetchPubs();
  }, [user]);

  const stats = useMemo(() => ({
    publicaciones: pubs.length,
    consultas: CONSULTAS.length,
    favoritos: pubs.reduce((a, p) => a + p.favoritos, 0),
  }), [pubs]);

  const unread = CONSULTAS.filter((c) => !c.leido).length;
  const userName = user?.user_metadata?.full_name?.split(" ")[0] || "Usuario";

  return (
    <div className={styles.page}>
      <Navbar />

      {/* Dashboard header */}
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
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div>
            {/* User section */}
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

        {/* Content */}
        <main className={styles.content}>
          {view === "inicio"        && <ViewInicio stats={stats} pubs={pubs} unread={unread} onNavigate={setView} />}
          {view === "publicaciones" && <ViewPublicaciones pubs={pubs} loading={loadingPubs} />}
          {view === "consultas"     && <ViewConsultas />}
          {view === "perfil"        && <ViewPerfil user={user} />}
        </main>
      </div>
    </div>
  );
};

export default VendedorDashboard;
