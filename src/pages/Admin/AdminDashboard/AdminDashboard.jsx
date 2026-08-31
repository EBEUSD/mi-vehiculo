import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import {
  LayoutDashboard, Users, Car, MessageCircle, LogOut,
  Search, Eye, Pause, Play, Trash2,
  UserCheck, UserX, CheckCircle, X, ShieldCheck, Phone, Mail, Calendar,
  DollarSign, TrendingUp, CreditCard, Award, Menu, Ban, AlertTriangle,
} from "lucide-react";
import { api } from "../../../lib/api";
import { supabase } from "../../../lib/supabase";
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
function UserProfileDrawer({ user, onClose, onChangeRole, onBlock, onDelete }) {
  const rb = roleBadge(user.role);
  const [saving, setSaving]               = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pubs, setPubs]                   = useState(null);

  useEffect(() => {
    api.get("/admin/vehicles?limit=200")
      .then((res) => {
        const list = (res.data || []).filter((v) => v.seller?.email === user.email);
        setPubs(list);
      })
      .catch(() => setPubs([]));
  }, [user.email]);

  const changeRole = async (role) => {
    if (saving) return;
    setSaving(true);
    try {
      await supabase.from("profiles").update({ role }).eq("id", user.id);
      onChangeRole(user.id, role);
    } catch { /* ignore */ }
    finally { setSaving(false); }
  };

  const toggleBlock = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const blocked = !user.blocked;
      await supabase.from("profiles").update({ blocked }).eq("id", user.id);
      onBlock(user.id, blocked);
    } catch { /* ignore */ }
    finally { setSaving(false); }
  };

  const deleteUser = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await supabase.from("profiles").delete().eq("id", user.id);
      onDelete(user.id);
      onClose();
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
            <div className={styles.drawerAvatar} style={user.blocked ? { opacity: 0.5 } : {}}>
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
                {user.blocked && (
                  <span className={`${styles.badge} ${styles.red}`}>
                    <Ban size={11} style={{ marginRight: 4 }} />Bloqueado
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
                <span className={styles.drawerFieldLabel}>DUI</span>
                <span className={styles.drawerFieldValue}>{user.dui || "—"}</span>
              </div>
            </div>
          </div>

          {/* ── Publicaciones ── */}
          <div className={styles.drawerSection}>
            <h4 className={styles.drawerSectionTitle}>
              Publicaciones {pubs !== null && <span style={{ fontWeight: 400, color: "#6b7280" }}>({pubs.length})</span>}
            </h4>
            {pubs === null && (
              <p style={{ color: "#9ca3af", fontSize: "0.82rem" }}>Cargando…</p>
            )}
            {pubs !== null && pubs.length === 0 && (
              <p style={{ color: "#9ca3af", fontSize: "0.82rem" }}>Sin publicaciones.</p>
            )}
            {pubs !== null && pubs.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {pubs.slice(0, 8).map((v) => {
                  const vs = VEHICLE_STATUS[v.status] || { label: v.status, cls: "grey" };
                  const titulo = v.title || `${v.brand?.name || ""} ${v.model?.name || ""} ${v.year || ""}`.trim();
                  const precio = v.price != null ? `$${Number(v.price).toLocaleString("en-US")}` : "—";
                  return (
                    <div key={v.id} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "0.5rem 0.625rem", background: "#f9fafb",
                      borderRadius: 8, gap: "0.5rem",
                    }}>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: "0.82rem", fontWeight: 600, color: "#111827",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>
                          {titulo || "Sin título"}
                        </p>
                        <p style={{ margin: 0, fontSize: "0.75rem", color: "#6b7280" }}>{precio}</p>
                      </div>
                      <span className={`${styles.badge} ${styles[vs.cls]}`} style={{ flexShrink: 0, fontSize: "0.72rem" }}>
                        {vs.label}
                      </span>
                    </div>
                  );
                })}
                {pubs.length > 8 && (
                  <p style={{ margin: 0, fontSize: "0.78rem", color: "#6b7280", textAlign: "center" }}>
                    +{pubs.length - 8} más
                  </p>
                )}
              </div>
            )}
          </div>

          <div className={styles.drawerSection}>
            <h4 className={styles.drawerSectionTitle}>Cambiar rol</h4>
            <div className={styles.docActions}>
              {user.role !== "SELLER" && (
                <button className={`${styles.actionBtn} ${styles.success}`} onClick={() => changeRole("SELLER")} disabled={saving}>
                  <UserCheck size={14} /> Hacer vendedor
                </button>
              )}
              {user.role !== "USER" && user.role !== "ADMIN" && (
                <button className={`${styles.actionBtn} ${styles.danger}`} onClick={() => changeRole("USER")} disabled={saving}>
                  <UserX size={14} /> Degradar a usuario
                </button>
              )}
              {user.role === "ADMIN" && (
                <p style={{ color: "#6b7280", fontSize: "0.85rem" }}>Los roles de admin no se modifican desde el panel.</p>
              )}
            </div>
          </div>

          {/* ── Zona de peligro ── */}
          <div style={{ margin: "1rem 0 0", border: "1.5px solid #fca5a5", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ background: "#fef2f2", padding: "0.6rem 1rem", display: "flex", alignItems: "center", gap: 6 }}>
              <AlertTriangle size={14} color="#dc2626" />
              <span style={{ fontWeight: 700, fontSize: "0.78rem", color: "#dc2626", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Zona de peligro
              </span>
            </div>
            <div style={{ padding: "0.875rem 1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>

              {/* Bloquear / Desbloquear */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem" }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: "0.85rem", color: "#111827" }}>
                    {user.blocked ? "Desbloquear cuenta" : "Bloquear acceso"}
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "#6b7280" }}>
                    {user.blocked
                      ? "Restaura el acceso del usuario a la plataforma."
                      : "Impide que el usuario inicie sesión. Reversible."}
                  </p>
                </div>
                <button
                  onClick={toggleBlock}
                  disabled={saving || user.role === "ADMIN"}
                  style={{
                    flexShrink: 0,
                    display: "flex", alignItems: "center", gap: 5,
                    padding: "0.4rem 0.875rem",
                    background: user.blocked ? "#f0fdf4" : "#fff7ed",
                    color: user.blocked ? "#16a34a" : "#c2410c",
                    border: `1.5px solid ${user.blocked ? "#86efac" : "#fed7aa"}`,
                    borderRadius: 7, fontWeight: 600, fontSize: "0.82rem",
                    cursor: "pointer", whiteSpace: "nowrap",
                    opacity: (saving || user.role === "ADMIN") ? 0.5 : 1,
                  }}
                >
                  <Ban size={13} />
                  {user.blocked ? "Desbloquear" : "Bloquear"}
                </button>
              </div>

              <div style={{ height: 1, background: "#fecaca" }} />

              {/* Eliminar */}
              {!confirmDelete ? (
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem" }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: "0.85rem", color: "#111827" }}>Eliminar cuenta</p>
                    <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "#6b7280" }}>
                      Borra al usuario del sistema. No se puede deshacer.
                    </p>
                  </div>
                  <button
                    onClick={() => setConfirmDelete(true)}
                    disabled={saving || user.role === "ADMIN"}
                    style={{
                      flexShrink: 0,
                      display: "flex", alignItems: "center", gap: 5,
                      padding: "0.4rem 0.875rem",
                      background: "#fef2f2", color: "#dc2626",
                      border: "1.5px solid #fca5a5",
                      borderRadius: 7, fontWeight: 600, fontSize: "0.82rem",
                      cursor: "pointer", whiteSpace: "nowrap",
                      opacity: (saving || user.role === "ADMIN") ? 0.5 : 1,
                    }}
                  >
                    <Trash2 size={13} /> Eliminar
                  </button>
                </div>
              ) : (
                <div style={{ background: "#fff1f2", borderRadius: 8, padding: "0.875rem" }}>
                  <p style={{ margin: "0 0 0.625rem", fontSize: "0.85rem", color: "#991b1b", fontWeight: 600 }}>
                    ¿Eliminar a <em>{user.fullName || user.email}</em>?
                  </p>
                  <p style={{ margin: "0 0 0.75rem", fontSize: "0.8rem", color: "#b91c1c" }}>
                    Esta acción es permanente. El usuario perderá acceso inmediatamente y no podrá recuperar su cuenta.
                  </p>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      onClick={deleteUser}
                      disabled={saving}
                      style={{
                        flex: 1, padding: "0.5rem", background: "#dc2626", color: "#fff",
                        border: "none", borderRadius: 7, fontWeight: 700, fontSize: "0.85rem",
                        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                      }}
                    >
                      <Trash2 size={14} /> {saving ? "Eliminando…" : "Sí, eliminar definitivamente"}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      style={{
                        padding: "0.5rem 0.875rem", background: "#fff", color: "#374151",
                        border: "1.5px solid #d1d5db", borderRadius: 7, fontWeight: 600,
                        fontSize: "0.85rem", cursor: "pointer",
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
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
  const [stats, setStats]       = useState(null);
  const [userCount, setUserCount] = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const fetchStats = api.get("/admin/stats").then((res) => setStats(res.data)).catch(() => {});
    const fetchUsers = supabase.from("profiles").select("id", { count: "exact", head: true })
      .then(({ count }) => setUserCount(count ?? 0)).catch(() => {});
    Promise.allSettled([fetchStats, fetchUsers]).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <p style={{ padding: "2rem", color: "#6b7280", textAlign: "center" }}>
        Cargando métricas…
      </p>
    );
  }

  const cards = [
    { label: "Usuarios registrados",  value: userCount                 ?? 0, icon: Users,         color: "blue"   },
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
function ViewUsuarios({ onViewProfile, refreshKey }) {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    let query = supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(200);
    if (roleFilter) query = query.eq("role", roleFilter);
    query
      .then(({ data }) => setProfiles(
        (data || []).map((u) => ({
          ...u,
          fullName:  u.full_name,
          createdAt: u.created_at,
          dui:       u.dui || "",
          blocked:   u.blocked || false,
          _count:    { vehicles: 0, leads: 0 },
        }))
      ))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [roleFilter, refreshKey]);

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
      ) : filtered.length === 0 ? (
        <p className={styles.empty}>Sin resultados</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "#f3f4f6" }}>
          {filtered.map((u) => {
            const rb = roleBadge(u.role);
            const initials = (u.fullName || u.email || "?").charAt(0).toUpperCase();
            const fecha = u.createdAt ? new Date(u.createdAt).toLocaleDateString("es-SV", { day: "numeric", month: "short", year: "numeric" }) : "—";
            return (
              <div
                key={u.id}
                style={{
                  display: "flex", alignItems: "center", gap: "1rem",
                  background: u.blocked ? "#fef9f9" : "#fff",
                  padding: "0.875rem 1.25rem",
                  borderLeft: u.blocked ? "3px solid #fca5a5" : "3px solid transparent",
                  transition: "background 0.15s",
                }}
              >
                {/* Avatar */}
                <div style={{
                  flexShrink: 0, width: 40, height: 40, borderRadius: "50%",
                  background: u.blocked ? "#fee2e2" : "#dbeafe",
                  color: u.blocked ? "#dc2626" : "#1d4ed8",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, fontSize: "1rem",
                }}>
                  {initials}
                </div>

                {/* Nombre + email */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                    <strong style={{ fontSize: "0.9rem", color: "#111827" }}>{u.fullName || "Sin nombre"}</strong>
                    <span className={styles.rolBadge} style={{ fontSize: "0.72rem", padding: "2px 8px" }}>{rb.label}</span>
                    {u.blocked && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 3, background: "#fef2f2", color: "#dc2626", border: "1px solid #fca5a5", borderRadius: 20, padding: "2px 8px", fontSize: "0.72rem", fontWeight: 600 }}>
                        <Ban size={10} /> Bloqueado
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "1rem", marginTop: 3, flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>{u.email}</span>
                    {u.dui && <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>DUI: {u.dui}</span>}
                    <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>Desde {fecha}</span>
                  </div>
                </div>

                {/* Acción */}
                <button
                  onClick={() => onViewProfile(u)}
                  style={{
                    flexShrink: 0, display: "flex", alignItems: "center", gap: 5,
                    padding: "0.4rem 0.875rem", background: "#f9fafb",
                    border: "1.5px solid #e5e7eb", borderRadius: 8,
                    fontWeight: 600, fontSize: "0.8rem", color: "#374151",
                    cursor: "pointer",
                  }}
                >
                  <Eye size={14} /> Ver perfil
                </button>
              </div>
            );
          })}
        </div>
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
  const [sideOpen, setSideOpen]       = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate("/admin/login", { replace: true });
  };

  const [refreshKey, setRefreshKey] = useState(0);

  const handleRoleChange = (id, role) => {
    setSelectedUser((prev) => (prev?.id === id ? { ...prev, role } : prev));
  };

  const handleBlock = (id, blocked) => {
    setSelectedUser((prev) => (prev?.id === id ? { ...prev, blocked } : prev));
    setRefreshKey((k) => k + 1);
  };

  const handleDelete = () => {
    setSelectedUser(null);
    setRefreshKey((k) => k + 1);
  };

  const goTo = (id) => { setView(id); setSideOpen(false); };

  return (
    <>
      {/* Mobile-only topbar */}
      <header className={styles.mobileHeader}>
        <div className={styles.mobileLogo}>
          <span className={styles.sideLogoIcon}>A</span>
          <span className={styles.mobileLogoText}>Admin Panel</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className={styles.mobileViewLabel}>
            {NAV.find((n) => n.id === view)?.label}
          </span>
          <button className={styles.burgerBtn} onClick={() => setSideOpen(true)}>
            <Menu size={20} />
          </button>
        </div>
      </header>

      {/* Sidebar overlay (mobile) */}
      {sideOpen && (
        <div className={styles.sideOverlay} onClick={() => setSideOpen(false)} />
      )}

      <div className={styles.shell}>
        {/* Sidebar */}
        <aside className={`${styles.sidebar} ${sideOpen ? styles.sidebarOpen : ""}`}>
          <div className={styles.sideTop}>
            <div className={styles.sideLogo}>
              <span className={styles.sideLogoIcon}>A</span>
              <span className={styles.sideLogoText}>Admin Panel</span>
            </div>

            <nav className={styles.sideNav}>
              {NAV.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  title={label}
                  className={`${styles.sideItem} ${view === id ? styles.sideActive : ""}`}
                  onClick={() => goTo(id)}
                >
                  <Icon size={17} />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>

          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={16} /> <span>Cerrar sesión</span>
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
            {view === "usuarios"      && <ViewUsuarios onViewProfile={setSelectedUser} refreshKey={refreshKey} />}
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
            onBlock={handleBlock}
            onDelete={handleDelete}
          />
        )}
      </div>
    </>
  );
};

export default AdminDashboard;
