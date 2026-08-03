import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import {
  LayoutDashboard, Users, Car, MessageCircle, LogOut,
  Search, TrendingUp, Eye, Pause, Play,
  Trash2, UserCheck, UserX, CheckCircle, XCircle,
  X, ShieldCheck, Phone, Mail, CreditCard, Calendar,
} from "lucide-react";
import styles from "./AdminDashboard.module.css";

/* ── Mock data ─────────────────────────────────── */
const INIT_USERS = [
  { id: 1,  nombre: "Carlos Mendoza",   email: "carlos.mendoza@gmail.com", telefono: "+503 7200-8891", dui: "04567890-1", fechaNac: "15/03/1985", rol: "vendedor",  estado: "activo",     docEstado: "verificado", pubs: 3, consultas: 12, fecha: "15/01/2026" },
  { id: 2,  nombre: "María García",     email: "maria.garcia@outlook.com", telefono: "+503 7134-7700", dui: "02789123-4", fechaNac: "22/09/1991", rol: "vendedor",  estado: "activo",     docEstado: "pendiente",  pubs: 1, consultas: 5,  fecha: "22/02/2026" },
  { id: 3,  nombre: "Juan Rodríguez",   email: "jrodriguez@yahoo.com",     telefono: "+503 7345-2090", dui: "03312045-6", fechaNac: "08/12/1990", rol: "comprador", estado: "activo",     docEstado: "sin_subir",  pubs: 0, consultas: 8,  fecha: "03/03/2026" },
  { id: 4,  nombre: "Ana López",        email: "analopez@gmail.com",       telefono: "+503 7551-0331", dui: "02934067-8", fechaNac: "30/05/1988", rol: "vendedor",  estado: "suspendido", docEstado: "rechazado",  pubs: 2, consultas: 3,  fecha: "10/03/2026" },
  { id: 5,  nombre: "Roberto Silva",    email: "rsilva@empresa.com",       telefono: "+503 7488-9002", dui: "02567890-1", fechaNac: "14/07/1982", rol: "vendedor",  estado: "activo",     docEstado: "verificado", pubs: 5, consultas: 28, fecha: "01/04/2026" },
  { id: 6,  nombre: "Florencia Torres", email: "flor.torres@gmail.com",    telefono: "+503 7672-1445", dui: "03890123-4", fechaNac: "03/02/1997", rol: "comprador", estado: "activo",     docEstado: "sin_subir",  pubs: 0, consultas: 4,  fecha: "14/04/2026" },
  { id: 7,  nombre: "Diego Martínez",   email: "diego.m@hotmail.com",      telefono: "+503 7251-2334", dui: "03156789-0", fechaNac: "19/11/1989", rol: "vendedor",  estado: "activo",     docEstado: "pendiente",  pubs: 2, consultas: 9,  fecha: "20/05/2026" },
  { id: 8,  nombre: "Valentina Cruz",   email: "vcruz@gmail.com",          telefono: "+503 7339-8770", dui: "04023456-7", fechaNac: "28/06/2000", rol: "comprador", estado: "activo",     docEstado: "sin_subir",  pubs: 0, consultas: 2,  fecha: "05/06/2026" },
  { id: 9,  nombre: "Martín Herrera",   email: "mherrera@hotmail.com",     telefono: "+503 7420-1882", dui: "02689012-3", fechaNac: "07/04/1984", rol: "vendedor",  estado: "activo",     docEstado: "verificado", pubs: 4, consultas: 17, fecha: "12/06/2026" },
  { id: 10, nombre: "Lucía Fernández",  email: "lucia.f@gmail.com",        telefono: "+503 7556-0220", dui: "03645678-9", fechaNac: "15/10/1995", rol: "comprador", estado: "activo",     docEstado: "sin_subir",  pubs: 0, consultas: 6,  fecha: "30/06/2026" },
];

const INIT_PUBS = [
  { id: 1, vehiculo: "Toyota Corolla XEI 2020",    vendedor: "Carlos Mendoza",  precio: "$12,500", estado: "activo",  vistas: 234, fecha: "20/05/2026" },
  { id: 2, vehiculo: "Honda Civic EX 2019",         vendedor: "Carlos Mendoza",  precio: "$10,800", estado: "activo",  vistas: 187, fecha: "21/05/2026" },
  { id: 3, vehiculo: "VW Golf GTI 2021",            vendedor: "Carlos Mendoza",  precio: "$18,500", estado: "pausado", vistas: 95,  fecha: "22/05/2026" },
  { id: 4, vehiculo: "Ford Focus Trend 2018",       vendedor: "Carlos Mendoza",  precio: "$8,900",  estado: "vendido", vistas: 312, fecha: "01/04/2026" },
  { id: 5, vehiculo: "Chevrolet Tracker Premier 2022", vendedor: "Roberto Silva",   precio: "$21,000", estado: "activo",  vistas: 445, fecha: "15/06/2026" },
  { id: 6, vehiculo: "Peugeot 208 Allure 2023",    vendedor: "María García",    precio: "$14,900", estado: "activo",  vistas: 156, fecha: "10/06/2026" },
  { id: 7, vehiculo: "Renault Kwid Zen 2022",       vendedor: "Diego Martínez",  precio: "$9,200",  estado: "activo",  vistas: 89,  fecha: "25/06/2026" },
  { id: 8, vehiculo: "Fiat Cronos Drive 2021",      vendedor: "Ana López",       precio: "$11,500", estado: "pausado", vistas: 67,  fecha: "18/06/2026" },
  { id: 9, vehiculo: "Jeep Renegade Sport 2021",    vendedor: "Martín Herrera",  precio: "$23,500", estado: "activo",  vistas: 521, fecha: "02/07/2026" },
  { id:10, vehiculo: "Nissan Versa Sense 2022",     vendedor: "Martín Herrera",  precio: "$13,200", estado: "activo",  vistas: 98,  fecha: "05/07/2026" },
];

const INIT_CONSULTAS = [
  { id: 1, de: "Juan Rodríguez",   para: "Carlos Mendoza",  vehiculo: "Toyota Corolla XEI 2020",  msg: "Hola, ¿sigue disponible? ¿Lo puedo ver el fin de semana?", hora: "hace 2h",    leido: false },
  { id: 2, de: "Florencia Torres", para: "Carlos Mendoza",  vehiculo: "Honda Civic EX 2019",       msg: "¿El precio es negociable? ¿Aceptás permuta con diferencia?", hora: "hace 5h",    leido: false },
  { id: 3, de: "Valentina Cruz",   para: "Roberto Silva",   vehiculo: "Chevrolet Tracker Premier 2022", msg: "¿Tiene los service al día? ¿Cuántos dueños tuvo?",           hora: "ayer",        leido: true  },
  { id: 4, de: "Lucía Fernández",  para: "María García",    vehiculo: "Peugeot 208 Allure 2023",   msg: "¿Se puede ver el fin de semana en zona norte?",              hora: "hace 3 días", leido: true  },
  { id: 5, de: "Juan Rodríguez",   para: "Diego Martínez",  vehiculo: "Renault Kwid Zen 2022",     msg: "¿Por qué el precio bajó? ¿Tiene algún inconveniente?",       hora: "hace 5 días", leido: true  },
  { id: 6, de: "Florencia Torres", para: "Martín Herrera",  vehiculo: "Jeep Renegade Sport 2021",  msg: "Muy interesada. ¿Tiene cuentakilómetros digital?",            hora: "hace 1 día",  leido: false },
];

/* ── Nav ────────────────────────────────────────── */
const NAV = [
  { id: "overview",      label: "Resumen",       icon: LayoutDashboard },
  { id: "usuarios",      label: "Usuarios",      icon: Users           },
  { id: "publicaciones", label: "Publicaciones", icon: Car             },
  { id: "consultas",     label: "Consultas",     icon: MessageCircle   },
];

/* ── Helpers ────────────────────────────────────── */
const estadoBadge = (e) => {
  const map = {
    activo:     { label: "Activo",     cls: "green"  },
    suspendido: { label: "Suspendido", cls: "red"    },
    pausado:    { label: "Pausado",    cls: "yellow" },
    vendido:    { label: "Vendido",    cls: "gray"   },
    leido:      { label: "Leído",      cls: "gray"   },
    noleido:    { label: "Sin leer",   cls: "blue"   },
  };
  return map[e] || { label: e, cls: "gray" };
};

/* ── User Profile Drawer ────────────────────────── */
function UserProfileDrawer({ user, onClose, onToggleEstado, onUpdateDocEstado }) {
  const docConfig = {
    verificado: { label: "Verificado",             cls: styles.docVerificado },
    pendiente:  { label: "Pendiente de revisión",  cls: styles.docPendiente  },
    rechazado:  { label: "Documento rechazado",    cls: styles.docRechazado  },
    sin_subir:  { label: "Sin documento subido",   cls: styles.docSinSubir   },
  };
  const doc = docConfig[user.docEstado] || docConfig.sin_subir;
  const eb  = estadoBadge(user.estado);

  return (
    <div className={styles.drawerOverlay} onClick={onClose}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className={styles.drawerHead}>
          <h2 className={styles.drawerTitle}>Perfil de usuario</h2>
          <button className={styles.drawerClose} onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <div className={styles.drawerBody}>

          {/* Identity block */}
          <div className={styles.drawerProfile}>
            <div className={styles.drawerAvatar}>{user.nombre.charAt(0)}</div>
            <div>
              <h3 className={styles.drawerName}>{user.nombre}</h3>
              <div className={styles.drawerBadges}>
                <span className={styles.rolBadge}>{user.rol}</span>
                <span className={`${styles.badge} ${styles[eb.cls]}`}>{eb.label}</span>
                {user.docEstado === "verificado" && (
                  <span className={`${styles.badge} ${styles.green}`}>
                    <ShieldCheck size={11} style={{ marginRight: 4 }} />Identidad verificada
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Personal data */}
          <div className={styles.drawerSection}>
            <h4 className={styles.drawerSectionTitle}>Datos personales</h4>
            <div className={styles.drawerGrid}>
              <div className={styles.drawerField}>
                <span className={styles.drawerFieldLabel}><Mail size={11} /> Email</span>
                <span className={styles.drawerFieldValue}>{user.email}</span>
              </div>
              <div className={styles.drawerField}>
                <span className={styles.drawerFieldLabel}><Phone size={11} /> Teléfono</span>
                <span className={styles.drawerFieldValue}>{user.telefono || "—"}</span>
              </div>
              <div className={styles.drawerField}>
                <span className={styles.drawerFieldLabel}><CreditCard size={11} /> DUI</span>
                <span className={styles.drawerFieldValue}>{user.dui || "—"}</span>
              </div>
              <div className={styles.drawerField}>
                <span className={styles.drawerFieldLabel}><Calendar size={11} /> Nacimiento</span>
                <span className={styles.drawerFieldValue}>{user.fechaNac || "—"}</span>
              </div>
              <div className={styles.drawerField}>
                <span className={styles.drawerFieldLabel}>Registro</span>
                <span className={styles.drawerFieldValue}>{user.fecha}</span>
              </div>
              <div className={styles.drawerField}>
                <span className={styles.drawerFieldLabel}>Publicaciones</span>
                <span className={styles.drawerFieldValue}>{user.pubs} &nbsp;·&nbsp; {user.consultas} consultas</span>
              </div>
            </div>
          </div>

          {/* Document verification */}
          <div className={styles.drawerSection}>
            <h4 className={styles.drawerSectionTitle}><ShieldCheck size={12} style={{ marginRight: 5 }} />Verificación de identidad</h4>
            <div className={styles.docCard}>
              <div className={styles.docCardTop}>
                <span className={`${styles.docStatus} ${doc.cls}`}>{doc.label}</span>
                {user.docEstado === "verificado" && <CheckCircle size={15} color="#059669" />}
                {user.docEstado === "rechazado"  && <XCircle     size={15} color="#dc2626" />}
              </div>

              {user.docEstado === "pendiente" && (
                <p className={styles.docNote}>El usuario subió una foto de su documento. Revisá y decidí si la aprobás o rechazás.</p>
              )}
              {user.docEstado === "sin_subir" && (
                <p className={styles.docNote}>El usuario aún no subió foto de su documento de identidad.</p>
              )}
              {user.docEstado === "rechazado" && (
                <p className={styles.docNote}>El documento fue rechazado. El usuario debe subir una imagen válida y legible.</p>
              )}
              {user.docEstado === "verificado" && (
                <p className={styles.docNote}>Identidad confirmada. El DUI coincide con los datos registrados.</p>
              )}

              {(user.docEstado === "pendiente" || user.docEstado === "verificado") && (
                <div className={styles.docImgPlaceholder}>
                  <CreditCard size={20} color="#94a3b8" />
                  <span>Foto del DUI &nbsp;·&nbsp; {user.dui}</span>
                </div>
              )}

              {user.docEstado === "pendiente" && (
                <div className={styles.docActions}>
                  <button
                    className={`${styles.actionBtn} ${styles.success}`}
                    onClick={() => onUpdateDocEstado(user.id, "verificado")}
                  >
                    <CheckCircle size={14} /> Verificar documento
                  </button>
                  <button
                    className={`${styles.actionBtn} ${styles.danger}`}
                    onClick={() => onUpdateDocEstado(user.id, "rechazado")}
                  >
                    <XCircle size={14} /> Rechazar
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Anti-multicuenta */}
          <div className={styles.drawerSection}>
            <h4 className={styles.drawerSectionTitle}>Control de multicuentas</h4>
            <div className={styles.multicuentaCard}>
              <div className={styles.multicuentaRow}>
                <CreditCard size={14} color="#64748b" />
                <span className={styles.multicuentaText}>
                  DNI <strong>{user.dni || "no registrado"}</strong>
                  {user.dni ? " — sin cuentas duplicadas detectadas" : " — datos incompletos"}
                </span>
              </div>
              <div className={styles.multicuentaRow}>
                <Phone size={14} color="#64748b" />
                <span className={styles.multicuentaText}>
                  Tel. <strong>{user.telefono || "no registrado"}</strong>
                  {user.telefono ? " — sin cuentas duplicadas detectadas" : " — datos incompletos"}
                </span>
              </div>
              <p className={styles.multicuentaNote}>
                La plataforma restringe una cuenta por DNI y número de teléfono.
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className={styles.drawerFooter}>
          <button
            className={`${styles.actionBtn} ${user.estado === "activo" ? styles.danger : styles.success}`}
            onClick={() => onToggleEstado(user.id)}
          >
            {user.estado === "activo"
              ? <><UserX size={14} /> Suspender cuenta</>
              : <><UserCheck size={14} /> Activar cuenta</>
            }
          </button>
          <button className={styles.drawerCancelBtn} onClick={onClose}>
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}

/* ── Views ──────────────────────────────────────── */
function Overview({ users, pubs, consultas }) {
  const unread = consultas.filter((c) => !c.leido).length;
  const stats = [
    { label: "Usuarios registrados", value: users.length,                   icon: Users,          color: "blue"   },
    { label: "Publicaciones activas", value: pubs.filter(p => p.estado === "activo").length, icon: Car, color: "green"  },
    { label: "Consultas sin leer",    value: unread,                         icon: MessageCircle,  color: "yellow" },
    { label: "Vehículos vendidos",    value: pubs.filter(p => p.estado === "vendido").length, icon: TrendingUp, color: "purple" },
  ];

  return (
    <>
      <div className={styles.statsGrid}>
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <article key={s.label} className={`${styles.statCard} ${styles[s.color]}`}>
              <div className={styles.statIconWrap}><Icon size={22} /></div>
              <div>
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            </article>
          );
        })}
      </div>

      <div className={styles.twoCol}>
        {/* Recent users */}
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <h2>Últimos usuarios</h2>
          </div>
          <table className={styles.table}>
            <thead>
              <tr><th>Nombre</th><th>Rol</th><th>Estado</th><th>Registro</th></tr>
            </thead>
            <tbody>
              {[...users].slice(-5).reverse().map((u) => {
                const b = estadoBadge(u.estado);
                return (
                  <tr key={u.id}>
                    <td>
                      <div className={styles.userCell}>
                        <span className={styles.avatar}>{u.nombre.charAt(0)}</span>
                        <div>
                          <strong>{u.nombre}</strong>
                          <small>{u.email}</small>
                        </div>
                      </div>
                    </td>
                    <td><span className={styles.rolBadge}>{u.rol}</span></td>
                    <td><span className={`${styles.badge} ${styles[b.cls]}`}>{b.label}</span></td>
                    <td className={styles.muted}>{u.fecha}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Recent pubs */}
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <h2>Últimas publicaciones</h2>
          </div>
          <table className={styles.table}>
            <thead>
              <tr><th>Vehículo</th><th>Precio</th><th>Estado</th><th>Vistas</th></tr>
            </thead>
            <tbody>
              {[...pubs].slice(-5).reverse().map((p) => {
                const b = estadoBadge(p.estado);
                return (
                  <tr key={p.id}>
                    <td><span className={styles.vehicleCell}>{p.vehiculo}</span></td>
                    <td className={styles.price}>{p.precio}</td>
                    <td><span className={`${styles.badge} ${styles[b.cls]}`}>{b.label}</span></td>
                    <td className={styles.muted}><Eye size={13} /> {p.vistas}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function ViewUsuarios({ users, onViewProfile, onToggleEstado }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("todos");

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchQ = !q || u.nombre.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchF = filter === "todos" || u.rol === filter || u.estado === filter;
    return matchQ && matchF;
  });

  return (
    <div className={styles.panel}>
      <div className={styles.panelHead}>
        <h2>Usuarios <span className={styles.count}>{users.length}</span></h2>
        <div className={styles.controls}>
          <div className={styles.searchBox}>
            <Search size={15} />
            <input placeholder="Buscar por nombre o email…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className={styles.select} value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="todos">Todos</option>
            <option value="vendedor">Vendedores</option>
            <option value="comprador">Compradores</option>
            <option value="suspendido">Suspendidos</option>
          </select>
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Usuario</th><th>Rol</th><th>Publicaciones</th><th>Consultas</th><th>Estado</th><th>Registro</th><th></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((u) => {
            const b = estadoBadge(u.estado);
            return (
              <tr key={u.id}>
                <td>
                  <div className={styles.userCell}>
                    <span className={styles.avatar}>{u.nombre.charAt(0)}</span>
                    <div>
                      <strong>{u.nombre}</strong>
                      <small>{u.email}</small>
                    </div>
                  </div>
                </td>
                <td><span className={styles.rolBadge}>{u.rol}</span></td>
                <td className={styles.muted}>{u.pubs}</td>
                <td className={styles.muted}>{u.consultas}</td>
                <td><span className={`${styles.badge} ${styles[b.cls]}`}>{b.label}</span></td>
                <td className={styles.muted}>{u.fecha}</td>
                <td>
                  <div className={styles.rowActions}>
                    <button
                      className={styles.iconAction}
                      onClick={() => onViewProfile(u)}
                      title="Ver perfil"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      className={`${styles.actionBtn} ${u.estado === "activo" ? styles.danger : styles.success}`}
                      onClick={() => onToggleEstado(u.id)}
                      title={u.estado === "activo" ? "Suspender" : "Activar"}
                    >
                      {u.estado === "activo" ? <UserX size={15} /> : <UserCheck size={15} />}
                      {u.estado === "activo" ? "Suspender" : "Activar"}
                    </button>
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
    </div>
  );
}

function ViewPublicaciones({ pubs, setPubs }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("todos");

  const filtered = pubs.filter((p) => {
    const q = search.toLowerCase();
    const matchQ = !q || p.vehiculo.toLowerCase().includes(q) || p.vendedor.toLowerCase().includes(q);
    const matchF = filter === "todos" || p.estado === filter;
    return matchQ && matchF;
  });

  const togglePause = (id) =>
    setPubs((prev) =>
      prev.map((p) =>
        p.id === id && p.estado !== "vendido"
          ? { ...p, estado: p.estado === "activo" ? "pausado" : "activo" }
          : p
      )
    );

  const deletePub = (id) => setPubs((prev) => prev.filter((p) => p.id !== id));

  return (
    <div className={styles.panel}>
      <div className={styles.panelHead}>
        <h2>Publicaciones <span className={styles.count}>{pubs.length}</span></h2>
        <div className={styles.controls}>
          <div className={styles.searchBox}>
            <Search size={15} />
            <input placeholder="Buscar vehículo o vendedor…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className={styles.select} value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="todos">Todos</option>
            <option value="activo">Activos</option>
            <option value="pausado">Pausados</option>
            <option value="vendido">Vendidos</option>
          </select>
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr><th>Vehículo</th><th>Vendedor</th><th>Precio</th><th>Vistas</th><th>Estado</th><th>Fecha</th><th></th></tr>
        </thead>
        <tbody>
          {filtered.map((p) => {
            const b = estadoBadge(p.estado);
            return (
              <tr key={p.id}>
                <td><span className={styles.vehicleCell}>{p.vehiculo}</span></td>
                <td className={styles.muted}>{p.vendedor}</td>
                <td className={styles.price}>{p.precio}</td>
                <td className={styles.muted}><Eye size={13} style={{ marginRight: 4 }} />{p.vistas}</td>
                <td><span className={`${styles.badge} ${styles[b.cls]}`}>{b.label}</span></td>
                <td className={styles.muted}>{p.fecha}</td>
                <td>
                  <div className={styles.rowActions}>
                    {p.estado !== "vendido" && (
                      <button
                        className={styles.iconAction}
                        onClick={() => togglePause(p.id)}
                        title={p.estado === "activo" ? "Pausar" : "Activar"}
                      >
                        {p.estado === "activo" ? <Pause size={14} /> : <Play size={14} />}
                      </button>
                    )}
                    <button
                      className={`${styles.iconAction} ${styles.iconDanger}`}
                      onClick={() => deletePub(p.id)}
                      title="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
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
    </div>
  );
}

function ViewConsultas({ consultas, setConsultas }) {
  const markRead = (id) =>
    setConsultas((prev) => prev.map((c) => (c.id === id ? { ...c, leido: true } : c)));

  const unread = consultas.filter((c) => !c.leido).length;

  return (
    <div className={styles.panel}>
      <div className={styles.panelHead}>
        <h2>Consultas <span className={styles.count}>{consultas.length}</span></h2>
        {unread > 0 && <span className={styles.unreadChip}>{unread} sin leer</span>}
      </div>

      <table className={styles.table}>
        <thead>
          <tr><th>De</th><th>Para</th><th>Vehículo</th><th>Mensaje</th><th>Cuando</th><th>Estado</th></tr>
        </thead>
        <tbody>
          {consultas.map((c) => (
            <tr key={c.id} className={!c.leido ? styles.unreadRow : ""}>
              <td>
                <div className={styles.userCell}>
                  <span className={styles.avatar}>{c.de.charAt(0)}</span>
                  <strong>{c.de}</strong>
                </div>
              </td>
              <td className={styles.muted}>{c.para}</td>
              <td className={styles.vehicleCell}>{c.vehiculo}</td>
              <td className={styles.msgCell}>{c.msg}</td>
              <td className={styles.muted}>{c.hora}</td>
              <td>
                {c.leido ? (
                  <span className={`${styles.badge} ${styles.gray}`}>Leído</span>
                ) : (
                  <button className={`${styles.badge} ${styles.blue} ${styles.badgeBtn}`} onClick={() => markRead(c.id)}>
                    Marcar leído
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Main ───────────────────────────────────────── */
const AdminDashboard = () => {
  const navigate  = useNavigate();
  const { signOut } = useAuth();
  const [view, setView]               = useState("overview");
  const [users, setUsers]             = useState(INIT_USERS);
  const [pubs, setPubs]               = useState(INIT_PUBS);
  const [consultas, setConsultas]     = useState(INIT_CONSULTAS);
  const [selectedUser, setSelectedUser] = useState(null);

  const unreadCount = consultas.filter((c) => !c.leido).length;

  const toggleUserEstado = (id) =>
    setUsers((prev) =>
      prev.map((u) => u.id === id ? { ...u, estado: u.estado === "activo" ? "suspendido" : "activo" } : u)
    );

  const updateDocEstado = (id, docEstado) =>
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, docEstado } : u)));

  const handleLogout = async () => {
    await signOut();
    navigate("/admin/login", { replace: true });
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
                {id === "consultas" && unreadCount > 0 && (
                  <span className={styles.sideBadge}>{unreadCount}</span>
                )}
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
          {view === "overview"      && <Overview users={users} pubs={pubs} consultas={consultas} />}
          {view === "usuarios"      && (
            <ViewUsuarios
              users={users}
              onViewProfile={setSelectedUser}
              onToggleEstado={toggleUserEstado}
            />
          )}
          {view === "publicaciones" && <ViewPublicaciones pubs={pubs} setPubs={setPubs} />}
          {view === "consultas"     && <ViewConsultas consultas={consultas} setConsultas={setConsultas} />}
        </div>
      </div>

      {selectedUser && (
        <UserProfileDrawer
          user={users.find((u) => u.id === selectedUser.id) || selectedUser}
          onClose={() => setSelectedUser(null)}
          onToggleEstado={(id) => {
            toggleUserEstado(id);
            setSelectedUser((prev) => ({
              ...prev,
              estado: prev.estado === "activo" ? "suspendido" : "activo",
            }));
          }}
          onUpdateDocEstado={(id, docEstado) => {
            updateDocEstado(id, docEstado);
            setSelectedUser((prev) => ({ ...prev, docEstado }));
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
