import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import {
  LayoutDashboard, Users, Car, MessageCircle, LogOut,
  Search, Eye, Pause, Play, Trash2,
  UserCheck, UserX, CheckCircle, X, ShieldCheck, Phone, Mail, Calendar,
  DollarSign, TrendingUp, CreditCard, Award,
} from "lucide-react";
import { api } from "../../../lib/api";
import styles from "./AdminDashboard.module.css";

/* ── Badge helpers ──────────────────────────── */
const VEHICLE_STATUS = {
  ACTIVE:   { label: "Activo",     cls: "green"  },
  PENDING:  { label: "Pendiente",  cls: "yellow" },
  PAUSED:   { label: "Pausado",    cls: "yellow" },
  REJECTED: { label: "Rechazado",  cls: "red"    },
  SOLD:     { label: "Vendido",    cls: "gray"   },
  DELETED:  { label: "Eliminado",  cls: "gray"   },
  DRAFT:    { label: "Borrador",   cls: "gray"   },
};

const LEAD_STATUS = {
  NEW:         { label: "Nueva",      cls: "blue"   },
  CONTACTED:   { label: "Contactado", cls: "yellow" },
  NEGOTIATING: { label: "Negociando", cls: "yellow" },
  WON:         { label: "Ganada",     cls: "green"  },
  LOST:        { label: "Perdida",    cls: "gray"   },
};

const ROLE_MAP = {
  USER:   { label: "Usuario",  cls: "gray" },
  SELLER: { label: "Vendedor", cls: "blue" },
  ADMIN:  { label: "Admin",    cls: "red"  },
};

const vehicleBadge = (s) => VEHICLE_STATUS[s] || { label: s, cls: "gray" };
const leadBadge    = (s) => LEAD_STATUS[s]    || { label: s, cls: "gray" };
const roleBadge    = (r) => ROLE_MAP[r]        || { label: r, cls: "gray" };

const PAYMENT_STATUS = {
  APPROVED: { label: "Aprobado",  cls: "green"  },
  DECLINED: { label: "Rechazado", cls: "red"    },
  PENDING:  { label: "Pendiente", cls: "yellow" },
  VOIDED:   { label: "Anulado",   cls: "gray"   },
  ERROR:    { label: "Error",     cls: "red"    },
};

const PLAN_LABEL = { basic: "Básico", premium: "Premium", featured: "Destacado" };

/* ── Nav ───────────────────────────────────── */
const NAV = [
  { id: "overview",      label: "Resumen",       icon: LayoutDashboard },
  { id: "usuarios",      label: "Usuarios",      icon: Users           },
  { id: "publicaciones", label: "Publicaciones", icon: Car             },
  { id: "leads",         label: "Consultas",     icon: MessageCircle   },
  { id: "facturacion",   label: "Facturación",   icon: DollarSign      },
];

/* ── User Drawer ────────────────────────────── */
function UserProfileDrawer({ user, onClose, onChangeRole }) {
  const rb = roleBadge(user.role);
  const [saving, setSaving] = useState(false);

  const changeRole = async (role) => {
    if (saving) return;
    setSaving(true);
    try {
      await api.patch(`/admin/profiles/${user.id}/role`, { role });
      onChangeRole(user.id, role);
    } catch { /* ignore */ }
    finally { setSaving(false); }
  };

  return (
    <div className={styles.drawerOverlay} onClick={onClose}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>

        <div className={styles.drawerHead}>
          <h2 className={styles.drawerTitle}>Perfil de usuario</h2>
          <button className={styles.drawerClose} onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <div className={styles.drawerBody}>

          <div className={styles.drawerProfile}>
            <div className={styles.drawerAvatar}>
              {(user.fullName || user.email || "?").charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className={styles.drawerName}>{user.fullName || "—"}</h3>
              <div className={styles.drawerBadges}>
                <span className={styles.rolBadge}>{rb.label}</span>
                {user.role === "ADMIN" && (
                  <span className={`${styles.badge} ${styles.red}`}>
                    <ShieldCheck size={11} style={{ marginRight: 4 }} />Admin
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className={styles.drawerSection}>
            <h4 className={styles.drawerSectionTitle}>Datos personales</h4>
            <div className={styles.drawerGrid}>
              <div className={styles.drawerField}>
                <span className={styles.drawerFieldLabel}><Mail size={11} /> Email</span>
                <span className={styles.drawerFieldValue}>{user.email}</span>
              </div>
              <div className={styles.drawerField}>
                <span className={styles.drawerFieldLabel}><Phone size={11} /> Teléfono</span>
                <span className={styles.drawerFieldValue}>{user.phone || "—"}</span>
              </div>
              <div className={styles.drawerField}>
                <span className={styles.drawerFieldLabel}><Calendar size={11} /> Registro</span>
                <span className={styles.drawerFieldValue}>
                  {new Date(user.createdAt).toLocaleDateString("es-SV")}
                </span>
              </div>
              <div className={styles.drawerField}>
                <span className={styles.drawerFieldLabel}>Actividad</span>
                <span className={styles.drawerFieldValue}>
                  {user._count?.vehicles ?? 0} publicaciones · {user._count?.leads ?? 0} consultas
                </span>
              </div>
            </div>
          </div>

          <div className={styles.drawerSection}>
            <h4 className={styles.drawerSectionTitle}>Cambiar rol</h4>
            <div className={styles.docActions}>
              {user.role !== "SELLER" && (
                <button
                  className={`${styles.actionBtn} ${styles.success}`}
                  onClick={() => changeRole("SELLER")}
                  disabled={saving}
                >
                  <UserCheck size={14} /> Hacer vendedor
                </button>
              )}
              {user.role !== "USER" && user.role !== "ADMIN" && (
                <button
                  className={`${styles.actionBtn} ${styles.danger}`}
                  onClick={() => changeRole("USER")}
                  disabled={saving}
                >
                  <UserX size={14} /> Degradar a usuario
                </button>
              )}
              {user.role === "ADMIN" && (
                <p style={{ color: "#6b7280", fontSize: "0.85rem" }}>
                  Los roles de admin no se modifican desde el panel.
                </p>
              )}
            </div>
          </div>

        </div>

        <div className={styles.drawerFooter}>
          <button className={styles.drawerCancelBtn} onClick={onClose}>Cerrar</button>
        </div>

      </div>
    </div>
  );
}

/* ── Overview ───────────────────────────────── */
function Overview() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/stats")
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <p style={{ padding: "2rem", color: "#6b7280", textAlign: "center" }}>
        Cargando métricas…
      </p>
    );
  }

  const cards = [
    { label: "Usuarios registrados",  value: stats?.profiles?.total    ?? 0, icon: Users,         color: "blue"   },
    { label: "Publicaciones activas", value: stats?.vehicles?.active   ?? 0, icon: Car,           color: "green"  },
    { label: "En revisión",           value: stats?.vehicles?.pending  ?? 0, icon: CheckCircle,   color: "yellow" },
    { label: "Consultas recibidas",   value: stats?.leads?.total       ?? 0, icon: MessageCircle, color: "purple" },
  ];

  return (
    <>
      <div className={styles.statsGrid}>
        {cards.map((s) => {
          const Icon = s.icon;
          return (
            <article key={s.label} className={`${styles.statCard} ${styles[s.color]}`}>
              <div className={styles.statIconWrap}><Icon size={22} /></div>
              <div>
                <strong>{s.value.toLocaleString("en-US")}</strong>
                <span>{s.label}</span>
              </div>
            </article>
          );
        })}
      </div>

      {stats && (
        <div className={styles.twoCol}>
          <div className={styles.panel}>
            <div className={styles.panelHead}><h2>Vistas de publicaciones</h2></div>
            <div style={{ padding: "1.5rem" }}>
              <strong style={{ fontSize: "2rem", display: "block" }}>
                {(stats.views?.total ?? 0).toLocaleString("en-US")}
              </strong>
              <p style={{ color: "#6b7280", marginTop: "0.25rem" }}>vistas acumuladas</p>
            </div>
          </div>
          <div className={styles.panel}>
            <div className={styles.panelHead}><h2>Clicks en WhatsApp</h2></div>
            <div style={{ padding: "1.5rem" }}>
              <strong style={{ fontSize: "2rem", display: "block" }}>
                {(stats.whatsappClicks?.total ?? 0).toLocaleString("en-US")}
              </strong>
              <p style={{ color: "#6b7280", marginTop: "0.25rem" }}>
                de {(stats.vehicles?.total ?? 0).toLocaleString("en-US")} publicaciones totales
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ── ViewUsuarios ───────────────────────────── */
function ViewUsuarios({ onViewProfile }) {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = roleFilter ? `?role=${roleFilter}&limit=100` : "?limit=100";
    api.get(`/admin/profiles${params}`)
      .then((res) => setProfiles(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [roleFilter]);

  const filtered = profiles.filter((u) => {
    const q = search.toLowerCase();
    return !q || (u.fullName || "").toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  return (
    <div className={styles.panel}>
      <div className={styles.panelHead}>
        <h2>Usuarios <span className={styles.count}>{profiles.length}</span></h2>
        <div className={styles.controls}>
          <div className={styles.searchBox}>
            <Search size={15} />
            <input
              placeholder="Buscar por nombre o email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className={styles.select}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="SELLER">Vendedores</option>
            <option value="USER">Usuarios</option>
            <option value="ADMIN">Admins</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p style={{ padding: "2rem", color: "#6b7280", textAlign: "center" }}>Cargando usuarios…</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Usuario</th><th>Rol</th><th>Publicaciones</th><th>Consultas</th><th>Registro</th><th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => {
              const rb = roleBadge(u.role);
              return (
                <tr key={u.id}>
                  <td>
                    <div className={styles.userCell}>
                      <span className={styles.avatar}>
                        {(u.fullName || u.email || "?").charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <strong>{u.fullName || "—"}</strong>
                        <small>{u.email}</small>
                      </div>
                    </div>
                  </td>
                  <td><span className={styles.rolBadge}>{rb.label}</span></td>
                  <td className={styles.muted}>{u._count?.vehicles ?? 0}</td>
                  <td className={styles.muted}>{u._count?.leads ?? 0}</td>
                  <td className={styles.muted}>{new Date(u.createdAt).toLocaleDateString("es-SV")}</td>
                  <td>
                    <div className={styles.rowActions}>
                      <button
                        className={styles.iconAction}
                        onClick={() => onViewProfile(u)}
                        title="Ver perfil"
                      >
                        <Eye size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className={styles.empty}>Sin resultados</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* ── ViewPublicaciones ──────────────────────── */
function ViewPublicaciones() {
  const [vehicles, setVehicles]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = statusFilter ? `?status=${statusFilter}&limit=100` : "?limit=100";
    api.get(`/admin/vehicles${params}`)
      .then((res) => setVehicles(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [statusFilter]);

  const changeStatus = async (id, status, extra = {}) => {
    try {
      await api.patch(`/admin/vehicles/${id}/status`, { status, ...extra });
      setVehicles((prev) => prev.map((v) => v.id === id ? { ...v, status } : v));
    } catch { /* ignore */ }
  };

  const filtered = vehicles.filter((v) => {
    const q = search.toLowerCase();
    return (
      !q ||
      (v.title || "").toLowerCase().includes(q) ||
      (v.seller?.fullName || "").toLowerCase().includes(q) ||
      (v.seller?.email || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className={styles.panel}>
      <div className={styles.panelHead}>
        <h2>Publicaciones <span className={styles.count}>{vehicles.length}</span></h2>
        <div className={styles.controls}>
          <div className={styles.searchBox}>
            <Search size={15} />
            <input
              placeholder="Buscar vehículo o vendedor…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className={styles.select}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="ACTIVE">Activos</option>
            <option value="PENDING">Pendientes</option>
            <option value="PAUSED">Pausados</option>
            <option value="REJECTED">Rechazados</option>
            <option value="SOLD">Vendidos</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p style={{ padding: "2rem", color: "#6b7280", textAlign: "center" }}>Cargando publicaciones…</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Vehículo</th><th>Vendedor</th><th>Precio</th><th>Vistas</th><th>Estado</th><th>Fecha</th><th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => {
              const b     = vehicleBadge(v.status);
              const price = v.price ? `$${Number(v.price).toLocaleString("en-US")}` : "—";
              return (
                <tr key={v.id}>
                  <td><span className={styles.vehicleCell}>{v.title || `${v.brand?.name || ""} ${v.year || ""}`}</span></td>
                  <td className={styles.muted}>{v.seller?.fullName || v.seller?.email || "—"}</td>
                  <td className={styles.price}>{price}</td>
                  <td className={styles.muted}>
                    <Eye size={13} style={{ marginRight: 4 }} />{v._count?.vehicleViews ?? 0}
                  </td>
                  <td><span className={`${styles.badge} ${styles[b.cls]}`}>{b.label}</span></td>
                  <td className={styles.muted}>{new Date(v.createdAt).toLocaleDateString("es-SV")}</td>
                  <td>
                    <div className={styles.rowActions}>
                      {v.status === "PENDING" && (
                        <button
                          className={`${styles.actionBtn} ${styles.success}`}
                          onClick={() => changeStatus(v.id, "ACTIVE")}
                          title="Aprobar"
                        >
                          <CheckCircle size={14} /> Aprobar
                        </button>
                      )}
                      {v.status === "ACTIVE" && (
                        <button
                          className={styles.iconAction}
                          onClick={() => changeStatus(v.id, "PAUSED")}
                          title="Pausar"
                        >
                          <Pause size={14} />
                        </button>
                      )}
                      {v.status === "PAUSED" && (
                        <button
                          className={styles.iconAction}
                          onClick={() => changeStatus(v.id, "ACTIVE")}
                          title="Reactivar"
                        >
                          <Play size={14} />
                        </button>
                      )}
                      {v.status !== "DELETED" && v.status !== "SOLD" && (
                        <button
                          className={`${styles.iconAction} ${styles.iconDanger}`}
                          onClick={() => changeStatus(v.id, "DELETED")}
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className={styles.empty}>Sin resultados</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* ── ViewLeads ──────────────────────────────── */
function ViewLeads() {
  const [leads, setLeads]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/leads?limit=100")
      .then((res) => setLeads(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/leads/${id}/status`, { status });
      setLeads((prev) => prev.map((l) => l.id === id ? { ...l, status } : l));
    } catch { /* ignore */ }
  };

  const newCount = leads.filter((l) => l.status === "NEW").length;

  return (
    <div className={styles.panel}>
      <div className={styles.panelHead}>
        <h2>Consultas <span className={styles.count}>{leads.length}</span></h2>
        {newCount > 0 && <span className={styles.unreadChip}>{newCount} nuevas</span>}
      </div>

      {loading ? (
        <p style={{ padding: "2rem", color: "#6b7280", textAlign: "center" }}>Cargando consultas…</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr><th>De</th><th>Vehículo</th><th>Mensaje</th><th>Fecha</th><th>Estado</th></tr>
          </thead>
          <tbody>
            {leads.map((l) => {
              const b = leadBadge(l.status);
              return (
                <tr key={l.id} className={l.status === "NEW" ? styles.unreadRow : ""}>
                  <td>
                    <div className={styles.userCell}>
                      <span className={styles.avatar}>
                        {(l.name || l.email || "?").charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <strong>{l.name || "—"}</strong>
                        <small>{l.email}</small>
                      </div>
                    </div>
                  </td>
                  <td className={styles.vehicleCell}>{l.vehicle?.title || "—"}</td>
                  <td className={styles.msgCell}>{l.message}</td>
                  <td className={styles.muted}>{new Date(l.createdAt).toLocaleDateString("es-SV")}</td>
                  <td>
                    {l.status === "NEW" ? (
                      <button
                        className={`${styles.badge} ${styles.blue} ${styles.badgeBtn}`}
                        onClick={() => updateStatus(l.id, "CONTACTED")}
                      >
                        Marcar contactado
                      </button>
                    ) : (
                      <span className={`${styles.badge} ${styles[b.cls]}`}>{b.label}</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {leads.length === 0 && (
              <tr><td colSpan={5} className={styles.empty}>Sin consultas</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* ── ViewFacturacion ────────────────────────── */
const PRESETS = [
  { id: "today", label: "Hoy"           },
  { id: "7d",    label: "7 días"        },
  { id: "30d",   label: "30 días"       },
  { id: "90d",   label: "90 días"       },
  { id: "custom", label: "Personalizado" },
];

function ViewFacturacion() {
  const [preset, setPreset]         = useState("30d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo]     = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [stats, setStats]           = useState(null);
  const [payments, setPayments]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [backendReady, setBackendReady] = useState(true);

  const getRange = () => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const today = fmt(now);
    if (preset === "custom") return { from: customFrom || today, to: customTo || today };
    const d = new Date(now);
    const offsets = { today: 0, "7d": 7, "30d": 30, "90d": 90 };
    d.setDate(d.getDate() - (offsets[preset] || 30));
    return { from: fmt(d), to: today };
  };

  useEffect(() => {
    const { from, to } = getRange();
    if (!from || !to) return;
    setLoading(true);

    const qs   = `from=${from}&to=${to}`;
    const pqs  = `${qs}${planFilter ? `&plan=${planFilter}` : ""}${statusFilter ? `&status=${statusFilter}` : ""}&limit=50`;

    Promise.all([
      api.get(`/admin/payments/stats?${qs}`),
      api.get(`/admin/payments?${pqs}`),
    ])
      .then(([s, p]) => {
        setStats(s.data || null);
        setPayments(Array.isArray(p.data) ? p.data : []);
        setBackendReady(true);
      })
      .catch((err) => {
        const code = err?.status || err?.response?.status;
        if (code === 404 || code === 501) setBackendReady(false);
      })
      .finally(() => setLoading(false));
  }, [preset, customFrom, customTo, planFilter, statusFilter]);

  const fmtMoney = (n) =>
    n != null
      ? `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : "—";
  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("es-SV") : "—");

  if (!backendReady && !loading) {
    return (
      <div className={styles.panel} style={{ padding: "3rem 2rem", textAlign: "center" }}>
        <DollarSign size={42} style={{ color: "#94a3b8", marginBottom: "1rem" }} />
        <p style={{ fontWeight: 800, fontSize: "1.05rem", color: "#0f172a", margin: "0 0 0.4rem" }}>
          Módulo no disponible aún
        </p>
        <p style={{ color: "#64748b", fontSize: "0.9rem", lineHeight: 1.6, maxWidth: 420, margin: "0 auto 1.5rem" }}>
          El backend necesita implementar los endpoints de facturación.
        </p>
        <div style={{
          display: "inline-block", textAlign: "left", background: "#f1f5f9",
          borderRadius: 10, padding: "12px 20px", fontFamily: "monospace",
          fontSize: "0.8rem", color: "#475569", lineHeight: 2.2,
        }}>
          GET /admin/payments/stats?from&amp;to<br />
          GET /admin/payments?from&amp;to&amp;plan&amp;status&amp;limit
        </div>
      </div>
    );
  }

  const statCards = [
    { label: "Total recaudado",         value: fmtMoney(stats?.totalRevenue),  icon: DollarSign, color: "green"  },
    { label: "Ingresos del período",    value: fmtMoney(stats?.periodRevenue), icon: TrendingUp, color: "blue"   },
    { label: "Transacciones aprobadas", value: stats?.approvedCount ?? "—",    icon: CreditCard, color: "purple" },
    { label: "Plan más vendido",
      value: PLAN_LABEL[stats?.topPlan] || stats?.topPlan || "—",              icon: Award,      color: "yellow" },
  ];

  const chartDays = stats?.daily || [];
  const chartMax  = Math.max(...chartDays.map((d) => d.amount || 0), 1);

  return (
    <>
      {/* Filter bar */}
      <div className={styles.panel}>
        <div className={styles.panelHead}>
          <h2>Período</h2>
          <div className={styles.controls}>
            <div className={styles.presetBtns}>
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`${styles.presetBtn} ${preset === p.id ? styles.presetBtnActive : ""}`}
                  onClick={() => setPreset(p.id)}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {preset === "custom" && (
              <div className={styles.customDateRow}>
                <input
                  type="date"
                  className={styles.select}
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                />
                <span style={{ color: "#94a3b8" }}>—</span>
                <input
                  type="date"
                  className={styles.select}
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <p style={{ padding: "2rem", color: "#6b7280", textAlign: "center" }}>Cargando facturación…</p>
      ) : (
        <>
          {/* Stats */}
          <div className={styles.statsGrid}>
            {statCards.map((s) => {
              const Icon = s.icon;
              return (
                <article key={s.label} className={`${styles.statCard} ${styles[s.color]}`}>
                  <div className={styles.statIconWrap}><Icon size={22} /></div>
                  <div>
                    <strong>{typeof s.value === "number" ? s.value.toLocaleString("en-US") : s.value}</strong>
                    <span>{s.label}</span>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Revenue chart */}
          {chartDays.length > 0 && (
            <div className={styles.panel}>
              <div className={styles.panelHead}><h2>Ingresos por día</h2></div>
              <div className={styles.chartWrap}>
                <div className={styles.chartBars}>
                  {chartDays.map((d, i) => (
                    <div key={i} className={styles.chartBarCol} title={`${d.date}: ${fmtMoney(d.amount)}`}>
                      <div
                        className={styles.chartBar}
                        style={{ height: `${Math.max(4, Math.round(((d.amount || 0) / chartMax) * 120))}px` }}
                      />
                      {(i === 0 || i === Math.floor(chartDays.length / 2) || i === chartDays.length - 1) && (
                        <span className={styles.chartXLabel}>
                          {new Date(d.date).toLocaleDateString("es-SV", { day: "2-digit", month: "short" })}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Transactions table */}
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <h2>Transacciones <span className={styles.count}>{payments.length}</span></h2>
              <div className={styles.controls}>
                <select className={styles.select} value={planFilter} onChange={(e) => setPlanFilter(e.target.value)}>
                  <option value="">Todos los planes</option>
                  <option value="basic">Básico</option>
                  <option value="premium">Premium</option>
                  <option value="featured">Destacado</option>
                </select>
                <select className={styles.select} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="">Todos los estados</option>
                  <option value="APPROVED">Aprobados</option>
                  <option value="DECLINED">Rechazados</option>
                  <option value="PENDING">Pendientes</option>
                </select>
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Fecha</th><th>Usuario</th><th>Vehículo</th><th>Plan</th>
                    <th>Monto</th><th>Estado</th><th>Referencia</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => {
                    const b = PAYMENT_STATUS[p.status] || { label: p.status || "—", cls: "gray" };
                    return (
                      <tr key={p.id}>
                        <td className={styles.muted}>{fmtDate(p.createdAt)}</td>
                        <td>
                          <div className={styles.userCell}>
                            <span className={styles.avatar}>
                              {(p.user?.fullName || p.user?.email || "?").charAt(0).toUpperCase()}
                            </span>
                            <div>
                              <strong>{p.user?.fullName || "—"}</strong>
                              <small>{p.user?.email || ""}</small>
                            </div>
                          </div>
                        </td>
                        <td className={styles.vehicleCell}>{p.vehicle?.title || "—"}</td>
                        <td><span className={styles.rolBadge}>{PLAN_LABEL[p.plan] || p.plan || "—"}</span></td>
                        <td className={styles.price}>{fmtMoney(p.amount)}</td>
                        <td><span className={`${styles.badge} ${styles[b.cls]}`}>{b.label}</span></td>
                        <td className={styles.muted} style={{ fontFamily: "monospace", fontSize: "0.78rem" }}>
                          {p.reference ? `${p.reference.substring(0, 20)}…` : "—"}
                        </td>
                      </tr>
                    );
                  })}
                  {payments.length === 0 && (
                    <tr><td colSpan={7} className={styles.empty}>Sin transacciones en este período</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
}

/* ── Main ───────────────────────────────────── */
const AdminDashboard = () => {
  const navigate    = useNavigate();
  const { signOut } = useAuth();
  const [view, setView]               = useState("overview");
  const [selectedUser, setSelectedUser] = useState(null);

  const handleLogout = async () => {
    await signOut();
    navigate("/admin/login", { replace: true });
  };

  const handleRoleChange = (id, role) => {
    setSelectedUser((prev) => (prev?.id === id ? { ...prev, role } : prev));
  };

  return (
    <div className={styles.shell}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sideTop}>
          <div className={styles.sideLogo}>
            <span className={styles.sideLogoIcon}>A</span>
            <span className={styles.sideLogoText}>Admin Panel</span>
          </div>

          <nav className={styles.sideNav}>
            {NAV.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`${styles.sideItem} ${view === id ? styles.sideActive : ""}`}
                onClick={() => setView(id)}
              >
                <Icon size={17} />
                {label}
              </button>
            ))}
          </nav>
        </div>

        <button className={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={16} /> Cerrar sesión
        </button>
      </aside>

      {/* Main content */}
      <div className={styles.main}>
        <header className={styles.topBar}>
          <div>
            <h1 className={styles.viewTitle}>
              {NAV.find((n) => n.id === view)?.label}
            </h1>
            <p className={styles.viewSub}>Mi Vehículo · Backoffice</p>
          </div>
        </header>

        <div className={styles.content}>
          {view === "overview"      && <Overview />}
          {view === "usuarios"      && <ViewUsuarios onViewProfile={setSelectedUser} />}
          {view === "publicaciones" && <ViewPublicaciones />}
          {view === "leads"         && <ViewLeads />}
          {view === "facturacion"   && <ViewFacturacion />}
        </div>
      </div>

      {selectedUser && (
        <UserProfileDrawer
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onChangeRole={handleRoleChange}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
