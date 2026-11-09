import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { api, clearTokens } from "../../../lib/api";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Home, Car, MessageCircle, Heart, PlusCircle,
  Headphones, ArrowRight, Eye, Edit2, Trash2, Pause,
  Play, CheckCircle, User, Save, ChevronRight, AlertCircle,
  Camera, Building2, TrendingUp, Bell, ShieldAlert, Lock,
  Share2, Sparkles, BadgeCheck, RotateCcw,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import Navbar from "../../../components/Navbar/Navbar";
import { usePricing } from "../../../lib/pricing";
import { redirectToFeatureCheckout, redirectToWompiCheckout } from "../../../lib/wompi";
import { apiErrorMessage, errorCode, productItemType, publishItem } from "../../../lib/publishing";
import { DEPARTAMENTOS, serviceTypeLabel } from "../../../lib/categories";
import { ITEM_RESOURCE } from "../../../lib/wompi";
import { validateImageFiles } from "../../../lib/images";
import useSafeTimeout from "../../../hooks/useSafeTimeout";
import { isValidSvPhone, normalizeSvPhone } from "../../../lib/phone";
import styles from "./VendedorDashboard.module.css";

/* ── Helpers ──────────────────────────────────── */
const STATUS_LABEL = {
  ACTIVE: "activo", DRAFT: "borrador", PAUSED: "pausado", SOLD: "vendido",
  PENDING: "pendiente", REJECTED: "rechazado", EXPIRED: "vencido",
};

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
  pendiente: { label: "Pendiente de aprobación", color: "#1d4ed8", bg: "rgba(29,78,216,0.08)" },
  rechazado: { label: "Rechazada", color: "#dc2626", bg: "rgba(220,38,38,0.08)" },
  vencido:   { label: "Vencida",   color: "#6b7a99", bg: "rgba(107,122,153,0.1)" },
  borrador:  { label: "Borrador",  color: "#6b7a99", bg: "rgba(107,122,153,0.1)" },
};

// Solo activas y pausadas se pueden pausar/activar; pendientes y rechazadas las resuelve el equipo
const canToggle = (status) => status === "activo" || status === "pausado";
// Borradores y vencidas se publican eligiendo un plan otra vez
const needsPlan = (status) => status === "borrador" || status === "vencido";
// Se puede destacar una publicación activa, pendiente o pausada
const canFeature = (status) => status === "activo" || status === "pendiente" || status === "pausado";
const isFeatured = (pub) => Boolean(pub.featuredUntil) && new Date(pub.featuredUntil) > new Date();
const shortDate = (iso) => new Date(iso).toLocaleDateString("es-SV", { day: "numeric", month: "short" });

// Campos comunes de vehículos, productos y servicios
const pubBase = (row) => ({
  id:             row.id,
  slug:           row.slug || "",
  status:         STATUS_LABEL[row.status] || "activo",
  vistas:         row.views || 0,
  consultas:      0,
  favoritos:      0,
  image:          row.images?.find((i) => i.isPrimary)?.url || row.images?.[0]?.url || null,
  featuredUntil:  row.featuredUntil || null,
  expiresAt:      row.expiresAt || null,
  moderationNotes: row.moderationNotes || "",
});

const money = (n) => `${new Intl.NumberFormat("en-US").format(n || 0)}`;

const mapRowToPub = (row) => ({
  ...pubBase(row),
  titulo:    [row.brand?.name, row.model?.name, row.version].filter(Boolean).join(" "),
  año:       row.year || 0,
  km:        (row.mileage || 0).toLocaleString("en-US"),
  precio:    money(row.price),
  type:      "vehicle",
  itemType:  "vehicle",
});

const mapProductToPub = (row) => ({
  ...pubBase(row),
  titulo:    row.title || "—",
  tipo:      row.category?.name || "Producto",
  año:       "",
  km:        "",
  precio:    money(row.price),
  type:      "product",
  itemType:  productItemType(row),
});

const mapServiceToPub = (row) => ({
  ...pubBase(row),
  titulo:    row.title || "—",
  tipo:      serviceTypeLabel(row.serviceType),
  año:       "",
  km:        "",
  precio:    row.price ? `${row.priceNote ? `${row.priceNote} ` : ""}${money(row.price)}` : "A convenir",
  type:      "service",
  itemType:  "servicio",
});

const statusEndpoint = (pub) => `/${ITEM_RESOURCE[pub.itemType]}/${pub.id}/status`;

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

const PUB_PATH = { product: "producto", service: "servicio", vehicle: "vehiculo" };
const pubPath = (pub) => `/${PUB_PATH[pub.type]}/${pub.slug}`;

function PubCard({ pub, compact, onToggle, onDelete, onEdit, onHighlight, onRepublish }) {
  const meta = STATUS_META[pub.status] || STATUS_META.activo;
  const [copied, setCopied] = useState(false);
  const later = useSafeTimeout();

  const handleShare = async () => {
    const url = `${window.location.origin}${pubPath(pub)}`;
    if (navigator.share) {
      try { await navigator.share({ title: pub.titulo, url }); } catch { /* cancelado */ }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      later(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copiá el link de tu publicación:", url);
    }
  };
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
        <span className={styles.pubMeta}>
          {pub.type !== "vehicle"
            ? `${pub.tipo || "Producto"} · ${pub.precio}`
            : `${pub.año} · ${pub.km} km · ${pub.precio}`
          }
        </span>
        {!compact && (isFeatured(pub) || (pub.expiresAt && pub.status === "activo")) && (
          <span className={styles.pubDates}>
            {isFeatured(pub) && <span className={styles.pubFeatured}><Sparkles size={12} /> Destacada hasta el {shortDate(pub.featuredUntil)}</span>}
            {pub.expiresAt && pub.status === "activo" && <span>Vence el {shortDate(pub.expiresAt)}</span>}
          </span>
        )}
        {!compact && pub.status === "rechazado" && pub.moderationNotes && (
          <span className={styles.pubNotes}>Motivo: {pub.moderationNotes}</span>
        )}
        <div className={styles.pubStats}>
          <span><Eye size={13} /> {pub.vistas}</span>
          <span><MessageCircle size={13} /> {pub.consultas}</span>
          <span><Heart size={13} /> {pub.favoritos}</span>
        </div>
      </div>
      {!compact && (
        <div className={styles.pubActions}>
          {pub.slug && pub.status === "activo" && (
            <Link
              to={pubPath(pub)}
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
          {canToggle(pub.status) && (
            <button
              className={styles.iconBtn}
              title={pub.status === "activo" ? "Pausar" : "Activar"}
              onClick={() => onToggle && onToggle(pub)}
            >
              {pub.status === "activo" ? <Pause size={15} /> : <Play size={15} />}
            </button>
          )}
          {pub.slug && pub.status === "activo" && (
            <button
              className={styles.iconBtn}
              title={copied ? "¡Link copiado!" : "Compartir"}
              onClick={handleShare}
            >
              {copied ? <CheckCircle size={15} /> : <Share2 size={15} />}
            </button>
          )}
          {needsPlan(pub.status) && (
            <button
              className={styles.iconBtn}
              title={pub.status === "vencido" ? "Volver a publicar" : "Publicar"}
              onClick={() => onRepublish && onRepublish(pub)}
            >
              <RotateCcw size={15} />
            </button>
          )}
          {canFeature(pub.status) && (
            <button
              className={styles.iconBtn}
              title={isFeatured(pub) ? "Extender destaque" : "Destacar"}
              onClick={() => onHighlight && onHighlight(pub)}
            >
              <Sparkles size={15} />
            </button>
          )}
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

// Destacar: se paga con Wompi y el backend aplica el destaque (POST /:id/feature).
// Si ya estaba destacada, los días se suman desde la fecha de fin actual.
function HighlightModal({ pub, onClose }) {
  const { highlights } = usePricing();
  const [dias, setDias] = useState(highlights[0]?.dias);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const opt = highlights.find((o) => o.dias === dias) || highlights[0];

  const handlePay = async () => {
    setPaying(true);
    setError("");
    try {
      await redirectToFeatureCheckout({ days: opt.dias, itemId: pub.id, itemType: pub.itemType });
    } catch (err) {
      setError(apiErrorMessage(err, "No se pudo iniciar el pago. Intentá de nuevo."));
      setPaying(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalIconWrap} style={{ background: "#eef4ff" }}>
          <Sparkles size={26} style={{ color: "#1d4ed8" }} />
        </div>
        <h3 className={styles.modalTitle}>{isFeatured(pub) ? "Extender destaque" : "Destacar publicación"}</h3>
        <p className={styles.modalDesc}>
          <strong>{pub.titulo}</strong> se resaltará y aparecerá en las primeras posiciones de búsqueda.
          {isFeatured(pub) && <> Hoy está destacada hasta el {shortDate(pub.featuredUntil)}: los días se suman a partir de esa fecha.</>}
        </p>
        <div className={styles.highlightOptions}>
          {highlights.map((o) => (
            <button
              key={o.dias}
              type="button"
              className={`${styles.highlightOption} ${o.dias === opt?.dias ? styles.highlightOptionActive : ""}`}
              onClick={() => setDias(o.dias)}
            >
              <strong>${o.precio}</strong>
              <span>{o.dias} días</span>
            </button>
          ))}
        </div>
        {error && <p className={styles.inlineError} role="alert">{error}</p>}
        <div className={styles.modalActions}>
          <button className={styles.modalCancelBtn} onClick={onClose} type="button">Cancelar</button>
          <button
            type="button"
            className={`${styles.modalConfirmBtn} ${styles.modalConfirmBlue}`}
            onClick={handlePay}
            disabled={paying || !opt}
          >
            {paying ? "Redirigiendo…" : `Pagar destaque — $${opt?.precio}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// Borrador o vencida: se vuelve a elegir plan. El gratuito consume el cupo anual.
function RepublishModal({ pub, onClose, onPublished }) {
  const { plans, freeQuota } = usePricing();
  const freeLeft = freeQuota ? freeQuota.remaining > 0 : true;
  const [planId, setPlanId] = useState(freeLeft ? "gratuito" : "basico");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const plan = plans.find((p) => p.id === planId);

  const handleConfirm = async () => {
    setBusy(true);
    setError("");
    try {
      if (plan.precio !== null) {
        await redirectToWompiCheckout({ plan: planId, itemId: pub.id, itemType: pub.itemType });
        return;
      }
      const res = await publishItem({ itemType: pub.itemType, itemId: pub.id, plan: planId });
      onPublished(pub, res);
    } catch (err) {
      setError(apiErrorMessage(err, "No se pudo publicar. Intentá de nuevo."));
      setBusy(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalIconWrap} style={{ background: "#eef4ff" }}>
          <RotateCcw size={26} style={{ color: "#1d4ed8" }} />
        </div>
        <h3 className={styles.modalTitle}>{pub.status === "vencido" ? "Volver a publicar" : "Publicar"}</h3>
        <p className={styles.modalDesc}>
          Elegí el plan para <strong>{pub.titulo}</strong>. La duración empieza a contar cuando la publicación queda activa.
        </p>
        <div className={styles.highlightOptions}>
          {plans.map((p) => {
            const disabled = p.precio === null && !freeLeft;
            return (
              <button
                key={p.id}
                type="button"
                className={`${styles.highlightOption} ${p.id === planId ? styles.highlightOptionActive : ""}`}
                onClick={() => setPlanId(p.id)}
                disabled={disabled}
                title={disabled ? "Ya usaste tu publicación gratuita de este año" : undefined}
              >
                <strong>{p.precio === null ? "Gratis" : `$${p.precio}`}</strong>
                <span>{p.nombre} · {p.dias} días</span>
              </button>
            );
          })}
        </div>
        {!freeLeft && (
          <p className={styles.modalDesc} style={{ fontSize: 12.5 }}>Ya usaste tu publicación gratuita de este año.</p>
        )}
        {error && <p className={styles.inlineError} role="alert">{error}</p>}
        <div className={styles.modalActions}>
          <button className={styles.modalCancelBtn} onClick={onClose} type="button">Cancelar</button>
          <button
            type="button"
            className={`${styles.modalConfirmBtn} ${styles.modalConfirmBlue}`}
            onClick={handleConfirm}
            disabled={busy || !plan}
          >
            {busy ? "Procesando…" : plan?.precio === null ? "Publicar gratis" : `Pagar y publicar — $${plan?.precio}`}
          </button>
        </div>
      </div>
    </div>
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

const FILTER_TABS = ["Todas", "Activas", "Pendientes", "Pausadas", "Vencidas", "Vendidas"];
const FILTER_STATUS = { Todas: null, Activas: "activo", Pendientes: "pendiente", Pausadas: "pausado", Vencidas: "vencido", Vendidas: "vendido" };

function ViewPublicaciones({ pubs, loading, onToggle, onDelete, onEdit, onHighlight, onRepublish }) {
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
          visible.map((p) => <PubCard key={p.id} pub={p} onToggle={onToggle} onDelete={onDelete} onEdit={onEdit} onHighlight={onHighlight} onRepublish={onRepublish} />)
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

const formatDUI = (val) => {
  const d = val.replace(/\D/g, "").slice(0, 9);
  return d.length <= 8 ? d : `${d.slice(0, 8)}-${d.slice(8)}`;
};

const formatNIT = (val) => {
  const d = val.replace(/\D/g, "").slice(0, 14);
  return [d.slice(0, 4), d.slice(4, 10), d.slice(10, 13), d.slice(13, 14)].filter(Boolean).join("-");
};

const DOC_TYPES = [
  { value: "DUI",                label: "DUI",                   placeholder: "00000000-0",    note: "XXXXXXXX-X" },
  { value: "TARJETA_RESIDENCIA", label: "Tarjeta de residencia", placeholder: "Número de carné" },
  { value: "PASAPORTE",          label: "Pasaporte",             placeholder: "Número de pasaporte" },
];

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

function ViewPerfil({ onPausedAll }) {
  const { user, signOut, refreshUser } = useAuth();
  const navigate = useNavigate();
  const later    = useSafeTimeout();
  const isMock   = !!user?.id?.startsWith("mock-");

  // Personal data — extended
  const [form, setForm] = useState({
    fullName:     user?.user_metadata?.full_name || "",
    phone:        user?.user_metadata?.phone     || "",
    birthDate:    "",
    docType:      user?.user_metadata?.document_type   || "DUI",
    docNumber:    user?.user_metadata?.document_number || user?.user_metadata?.dui || "",
    nit:          user?.user_metadata?.nit             || "",
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
  // Si GET /profile falla no se permite guardar (evita pisar datos reales con vacíos)
  const [loadError, setLoadError] = useState("");

  // Avatar
  const [avatar, setAvatar]               = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError]         = useState("");
  const avatarBlobRef = useRef(null);

  // Seller type — mismo dato que account_type (registro / completar perfil / primera publicación)
  const meta0 = user?.user_metadata || {};
  const [sellerType, setSellerType]   = useState(meta0.account_type === "EMPRESA" ? "empresa" : "particular");
  const [companyName, setCompanyName] = useState(meta0.company_name || "");
  const [companyNrc, setCompanyNrc]         = useState(meta0.nrc || "");
  const [companyAddress, setCompanyAddress] = useState(meta0.company_address || "");
  const [companyPhone, setCompanyPhone]     = useState(meta0.company_phone || "");
  const [companyDesc, setCompanyDesc] = useState("");
  const [website, setWebsite]         = useState("");
  // Cuenta verificada por el equipo: tipo, documento, NIT, NRC y razón social quedan fijos
  const [verified, setVerified]       = useState(!!user?.verified);

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
  const [notifError, setNotifError]   = useState("");

  // Danger zone modal
  const [dangerModal,  setDangerModal]  = useState(null); // null | "pauseAll" | "deleteAccount"
  const [pausing,      setPausing]      = useState(false);
  const [deleting,     setDeleting]     = useState(false);
  const [pauseResult,  setPauseResult]  = useState(null); // { msg, error }

  useEffect(() => {
    if (isMock) return;
    let ignore = false;
    api.get("/profile")
      .then((res) => {
        if (ignore) return;
        const d = res.data;
        const meta = user?.user_metadata || {};
        setForm({
          fullName:     d.fullName     || "",
          phone:        d.phone        || "",
          birthDate:    d.birthDate    || "",
          docType:      d.documentType   || meta.document_type || "DUI",
          docNumber:    d.documentNumber || d.dui || meta.document_number || "",
          nit:          d.nit            || meta.nit || "",
          gender:       d.gender       || "",
          department:   d.department   || "",
          municipality: d.municipality || "",
          address:      d.address      || "",
        });
        setEmail(d.email || "");
        setAvatar(d.avatarUrl || null);
        const accountType = d.accountType || meta.account_type;
        const fromApi = d.sellerType ? SELLER_TYPE_FROM_API(d.sellerType) : "particular";
        setSellerType(accountType === "EMPRESA" && fromApi === "particular" ? "empresa" : fromApi);
        setCompanyName(d.companyName || meta.company_name || "");
        setCompanyNrc(d.nrc || meta.nrc || "");
        setCompanyAddress(d.companyAddress || meta.company_address || "");
        setCompanyPhone(d.companyPhone || meta.company_phone || "");
        setVerified(!!d.verified);
        setCompanyDesc(d.companyDescription || "");
        setWebsite(d.website || "");
        setPlan(d.plan || null);
        if (d.notifications) {
          // Merge API response into state — keep defaults for any missing key
          setNotifs((prev) => ({ ...prev, ...d.notifications }));
        }
      })
      .catch((err) => {
        if (!ignore) setLoadError(err?.message || "No se pudo cargar tu perfil.");
      })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, [isMock]); // eslint-disable-line react-hooks/exhaustive-deps -- user_metadata solo como respaldo inicial

  // Liberar la vista previa local del avatar (modo demo)
  useEffect(() => () => {
    if (avatarBlobRef.current) URL.revokeObjectURL(avatarBlobRef.current);
  }, []);

  const setField = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleAvatarChange = async (e) => {
    const picked = e.target.files?.[0];
    e.target.value = "";
    if (!picked) return;
    const { valid, error } = validateImageFiles([picked]);
    if (!valid.length) { setAvatarError(error); return; }
    const file = valid[0];
    setAvatarError("");
    setAvatarUploading(true);
    try {
      if (isMock) {
        if (avatarBlobRef.current) URL.revokeObjectURL(avatarBlobRef.current);
        avatarBlobRef.current = URL.createObjectURL(file);
        setAvatar(avatarBlobRef.current);
        return;
      }
      const fd = new FormData();
      fd.append("avatar", file);
      const res = await api.upload("/profile/avatar", fd);
      setAvatar(res.data?.avatarUrl || res.avatarUrl || avatar);
    } catch (err) {
      setAvatarError(err?.message || "No se pudo subir la foto. Intentá de nuevo.");
    } finally { setAvatarUploading(false); }
  };

  // Agencia/Lote y Empresa cuentan como cuenta de empresa (verificación con NIT y dirección)
  const isBusiness = sellerType !== "particular";

  const handleSave = async (e) => {
    e.preventDefault();
    if (loadError) return;
    if (form.docType !== "DUI" && !form.nit.trim()) {
      setFormError("Con tarjeta de residencia o pasaporte el NIT es obligatorio.");
      return;
    }
    if (form.nit && !/^\d{4}-\d{6}-\d{3}-\d$/.test(form.nit)) {
      setFormError("NIT inválido. Formato: 0000-000000-000-0");
      return;
    }
    if (isBusiness && companyPhone && !isValidSvPhone(companyPhone)) {
      setFormError("El teléfono de la empresa debe tener 8 dígitos.");
      return;
    }
    if (isMock) { setSaved(true); later(() => setSaved(false), 2000); return; }
    setSaving(true); setFormError("");
    const { docType, docNumber, nit, ...personal } = form;
    // Con la cuenta verificada el backend rechaza cambios de identidad (IDENTITY_LOCKED): no se envían
    const identity = verified ? {} : {
      accountType:    isBusiness ? "EMPRESA" : "PARTICULAR",
      documentType:   docType,
      documentNumber: docNumber,
      dui:            docType === "DUI" ? docNumber : "",
      nit,
      ...(isBusiness ? { companyName: companyName.trim(), nrc: companyNrc.trim() } : {}),
    };
    try {
      await api.patch("/profile", {
        ...personal,
        ...identity,
        sellerType:         SELLER_TYPE_TO_API[sellerType] || "individual",
        companyDescription: isBusiness ? companyDesc : undefined,
        website:            isBusiness ? website     : undefined,
        ...(isBusiness ? {
          companyAddress: companyAddress.trim(),
          companyPhone:   normalizeSvPhone(companyPhone) || "",
        } : {}),
      });
      // Refrescar el usuario del contexto (nombre en navbar, metadata)
      if (typeof refreshUser === "function") {
        try { await refreshUser(); } catch { /* no bloquea el guardado */ }
      }
      setSaved(true);
      later(() => setSaved(false), 3000);
    } catch (err) { setFormError(apiErrorMessage(err, "No se pudo guardar. Intentá de nuevo.")); }
    finally { setSaving(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm) { setPwError("Las contraseñas no coinciden."); return; }
    if (pwForm.next.length < 8)         { setPwError("Mínimo 8 caracteres."); return; }
    if (isMock) { setPwSaved(true); later(() => setPwSaved(false), 2500); return; }
    setPwSaving(true); setPwError("");
    try {
      await api.patch("/auth/password", { currentPassword: pwForm.current, newPassword: pwForm.next });
      setPwSaved(true);
      setPwForm({ current: "", next: "", confirm: "" });
      later(() => setPwSaved(false), 3000);
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
    const prev = notifs;
    const next = { ...notifs, [key]: !notifs[key] };
    setNotifs(next);
    setNotifError("");
    if (isMock) return;
    setNotifSaving(true);
    try {
      // Backend requires all 4 fields — full replacement, not partial
      await api.patch("/profile/notifications", {
        emailNewLead:    next.emailNewLead,
        emailWeeklyStats: next.emailWeeklyStats,
        emailPromotions: next.emailPromotions,
        pushNewLead:     next.pushNewLead,
      });
    } catch (err) {
      setNotifs(prev); // volver al estado anterior
      setNotifError(err?.message || "No se pudo guardar la preferencia. Intentá de nuevo.");
    } finally {
      setNotifSaving(false);
    }
  };

  const showPauseResult = (msg, error = false) => {
    setPauseResult({ msg, error });
    later(() => setPauseResult(null), 5000);
  };

  const handlePauseAllConfirm = async () => {
    setPausing(true);
    try {
      if (isMock) {
        showPauseResult("Publicaciones pausadas (modo demo).");
      } else {
        const res = await api.patch("/profile/vehicles/pause-all");
        const n = res?.affected ?? res?.data?.affected ?? 0;
        showPauseResult(n === 0
          ? "No había publicaciones activas."
          : `${n} publicación${n !== 1 ? "es" : ""} pausada${n !== 1 ? "s" : ""}.`);
      }
      onPausedAll?.();
    } catch (err) {
      showPauseResult(err?.message || "No se pudieron pausar las publicaciones. Intentá de nuevo.", true);
    } finally {
      setPausing(false);
      setDangerModal(null);
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      if (!isMock) await api.delete("/profile");
      clearTokens(); // token is immediately invalid after DELETE /profile
      await signOut();
      navigate("/");
    } catch (err) {
      setDeleting(false);
      setDangerModal(null);
      showPauseResult(err?.message || "No se pudo eliminar la cuenta. Contactá soporte si el problema persiste.", true);
    }
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

        {loadError && (
          <div className={styles.loadErrorBanner} role="alert">
            <AlertCircle size={16} />
            <span>{loadError} No se pueden guardar cambios hasta recargar tus datos.</span>
            <button type="button" onClick={() => window.location.reload()}>Recargar</button>
          </div>
        )}

        <div className={styles.avatarSection}>
          <label className={styles.avatarWrap} title="Cambiar foto de perfil">
            {avatar
              ? <img src={avatar} alt="avatar" className={styles.avatarImg} />
              : <div className={styles.avatarCircle}>{initials}</div>
            }
            <div className={styles.avatarOverlay}>
              {avatarUploading ? "…" : <Camera size={15} />}
            </div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className={styles.visuallyHidden}
              aria-label="Cambiar foto de perfil"
              onChange={handleAvatarChange}
              disabled={avatarUploading}
            />
          </label>
          <div>
            <strong className={styles.avatarName}>{form.fullName || email}</strong>
            <p className={styles.avatarSub}>
              {sellerType === "empresa" ? companyName || "Empresa"
                : sellerType === "concesionario" ? "Agencia/Lote"
                : "Vendedor particular"}
              {verified && <span className={styles.verifiedBadge}><BadgeCheck size={13} /> Verificada</span>}
            </p>
            {avatarError && <p className={styles.inlineError} role="alert">{avatarError}</p>}
          </div>
        </div>

        <form onSubmit={handleSave} className={styles.profileForm}>

          {/* Datos personales */}
          <div className={styles.profileSection}>
            <h3 className={styles.profileSectionTitle}><User size={15} /> Datos personales</h3>
            {verified && (
              <p className={styles.lockedNote}>
                <Lock size={13} /> Tu cuenta está verificada: el tipo de cuenta, el documento, el NIT y la razón social
                ya no se pueden cambiar desde acá. Si necesitás corregirlos, <Link to="/contacto">contactá a soporte</Link>.
              </p>
            )}
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
                <label>Tipo de documento</label>
                <select
                  value={form.docType}
                  onChange={(e) => setForm((p) => ({ ...p, docType: e.target.value, docNumber: "" }))}
                  disabled={verified}
                >
                  {DOC_TYPES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>
              <div className={styles.profileField}>
                <label>
                  Número de documento
                  {form.docType === "DUI" && <span className={styles.fieldNote}> XXXXXXXX-X</span>}
                </label>
                <input
                  value={form.docNumber}
                  onChange={(e) => setForm((p) => ({
                    ...p,
                    docNumber: p.docType === "DUI"
                      ? formatDUI(e.target.value)
                      : e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 20),
                  }))}
                  placeholder={DOC_TYPES.find((d) => d.value === form.docType)?.placeholder}
                  maxLength={form.docType === "DUI" ? 10 : 20}
                  inputMode={form.docType === "DUI" ? "numeric" : "text"}
                  disabled={verified}
                />
              </div>
              <div className={styles.profileField}>
                <label>
                  NIT{form.docType === "DUI" ? " (opcional)" : " *"}
                  <span className={styles.fieldNote}> 0000-000000-000-0</span>
                </label>
                <input
                  value={form.nit}
                  onChange={(e) => setForm((p) => ({ ...p, nit: formatNIT(e.target.value) }))}
                  placeholder="0614-010190-101-1"
                  maxLength={17}
                  inputMode="numeric"
                  disabled={verified}
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
                  {DEPARTAMENTOS.map((d) => <option key={d} value={d}>{d}</option>)}
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
                { id: "concesionario", label: "Agencia/Lote"  },
                { id: "empresa",       label: "Empresa"       },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`${styles.sellerPill} ${sellerType === t.id ? styles.sellerPillActive : ""}`}
                  onClick={() => setSellerType(t.id)}
                  disabled={verified && (t.id === "particular") !== (sellerType === "particular")}
                >
                  {t.label}
                </button>
              ))}
            </div>
            {sellerType !== "particular" && (
              <div className={styles.profileGrid} style={{ marginTop: 14 }}>
                <div className={styles.profileField}>
                  <label>Nombre comercial</label>
                  <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Nombre de tu empresa o agencia" disabled={verified} />
                </div>
                <div className={styles.profileField}>
                  <label>Sitio web</label>
                  <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://tusitio.com" type="url" />
                </div>
                <div className={styles.profileField}>
                  <label>NRC (opcional)</label>
                  <input value={companyNrc} onChange={(e) => setCompanyNrc(e.target.value.replace(/[^0-9-]/g, "").slice(0, 10))} placeholder="123456-7" inputMode="numeric" disabled={verified} />
                </div>
                <div className={styles.profileField}>
                  <label>Teléfono de la empresa</label>
                  <input value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} placeholder="+503 2200-0000" type="tel" />
                </div>
                <div className={`${styles.profileField} ${styles.colSpan2}`}>
                  <label>Dirección de la empresa</label>
                  <input value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} placeholder="Calle, número, municipio y departamento" />
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
            <button type="submit" className={styles.saveBtn} disabled={saving || !!loadError}>
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
        {notifError && <p className={styles.inlineError} role="alert" style={{ padding: "0 20px" }}>{notifError}</p>}
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
              <input type="checkbox" className={styles.toggleInput} checked={notifs[key]} disabled={notifSaving} onChange={() => handleNotifToggle(key)} />
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
                <span className={pauseResult.error ? styles.inlineError : styles.inlineOk} role="status">{pauseResult.msg}</span>
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
  const navigate   = useNavigate();
  const later      = useSafeTimeout();
  const [searchParams, setSearchParams] = useSearchParams();
  // La pestaña vive en la URL: back/forward y links del navbar funcionan
  const tabParam = searchParams.get("tab");
  const view     = VALID_TABS.includes(tabParam) ? tabParam : "inicio";
  const setView  = useCallback((id) => setSearchParams({ tab: id }), [setSearchParams]);
  // success=1 → publicada; success=pending → quedó pendiente de aprobación
  const [showSuccess, setShowSuccess] = useState(() => searchParams.get("success"));
  const [pubs, setPubs]         = useState([]);
  const [loadingPubs, setLoadingPubs] = useState(true);
  const [pubsError, setPubsError]   = useState("");
  const [actionError, setActionError] = useState("");
  const [highlightPub, setHighlightPub] = useState(null);
  const [republishPub, setRepublishPub] = useState(null);
  const [leads, setLeads]       = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const isMockUser = !!user?.id?.startsWith("mock-");

  // Mostrar el banner una vez y sacar success de la URL
  useEffect(() => {
    if (!searchParams.get("success")) return;
    const next = new URLSearchParams(searchParams);
    next.delete("success");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (!user || isMockUser) return;
    let ignore = false;
    const fetchPubs = async () => {
      setLoadingPubs(true);
      setPubsError("");
      try {
        const results = await Promise.allSettled([
          api.get("/profile/vehicles"),
          api.get("/profile/products"),
          api.get("/services/me"),
        ]);
        if (ignore) return;
        const mappers = [mapRowToPub, mapProductToPub, mapServiceToPub];
        const rows = results.flatMap((r, i) =>
          r.status === "fulfilled" ? (r.value.data || []).map(mappers[i]) : []);
        if (results.every((r) => r.status !== "fulfilled")) {
          setPubsError("No se pudieron cargar las publicaciones. Revisá tu conexión.");
        }
        setPubs(rows);
      } catch {
        if (ignore) return;
        setPubsError("Error al cargar las publicaciones. Intentá recargar la página.");
        setPubs([]);
      }
      setLoadingPubs(false);
    };
    const fetchLeads = async () => {
      setLoadingLeads(true);
      try {
        const res = await api.get("/leads/me");
        if (!ignore) setLeads((res.data || []).map(mapLead));
      } catch {
        if (!ignore) setLeads([]);
      }
      if (!ignore) setLoadingLeads(false);
    };
    fetchPubs();
    fetchLeads();
    return () => { ignore = true; };
  }, [user, isMockUser]);

  const showActionError = useCallback((msg) => {
    setActionError(msg);
    later(() => setActionError(""), 4000);
  }, [later]);

  const updatePub = useCallback((id, data) => {
    setPubs((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
  }, []);

  const handleToggle = useCallback(async (pub) => {
    try {
      if (pub.status === "activo") {
        await api.patch(statusEndpoint(pub), { status: "PAUSED" });
        updatePub(pub.id, { status: "pausado" });
        return;
      }
      // Reactivar solo por /publish: si sigue vigente no se cobra; puede quedar PENDING
      const res = await publishItem({ itemType: pub.itemType, itemId: pub.id });
      updatePub(pub.id, {
        status: STATUS_LABEL[res.status] || "activo",
        ...(res.expiresAt ? { expiresAt: res.expiresAt } : {}),
      });
    } catch (err) {
      const code = errorCode(err);
      // Pausada con el plan vencido: hay que elegir un plan otra vez
      if (code === "INVALID_PLAN" || code === "PAYMENT_REQUIRED") {
        updatePub(pub.id, { status: "vencido" });
        setRepublishPub({ ...pub, status: "vencido" });
        return;
      }
      if (code === "PENDING_REVIEW") { updatePub(pub.id, { status: "pendiente" }); return; }
      showActionError(apiErrorMessage(err, "No se pudo cambiar el estado. Intentá de nuevo."));
    }
  }, [showActionError, updatePub]);

  const handlePublished = useCallback((pub, res) => {
    setRepublishPub(null);
    updatePub(pub.id, {
      status: STATUS_LABEL[res.status] || "activo",
      expiresAt: res.expiresAt || null,
    });
  }, [updatePub]);

  const handleEdit = useCallback((pub) => {
    if (pub.type === "product") navigate(`/editar/producto/${pub.id}`);
    else if (pub.type === "service") navigate(`/editar/servicio/${pub.id}`);
    else navigate(`/editar/vehiculo/${pub.slug || pub.id}`);
  }, [navigate]);

  const handleDelete = useCallback(async (pub) => {
    if (!window.confirm(`¿Eliminar "${pub.titulo}"? Esta acción no se puede deshacer.`)) return;
    try {
      await api.patch(statusEndpoint(pub), { status: "DELETED" });
      setPubs((prev) => prev.filter((p) => p.id !== pub.id));
    } catch (err) {
      showActionError(err?.message || "No se pudo eliminar la publicación. Intentá de nuevo.");
    }
  }, [showActionError]);

  // "Pausar todo" solo afecta vehículos activos
  const handlePausedAll = useCallback(() => {
    setPubs((prev) => prev.map((p) =>
      p.type === "vehicle" && p.status === "activo" ? { ...p, status: "pausado" } : p
    ));
  }, []);

  const unread = leads.filter((c) => !c.leido).length;

  const stats = useMemo(() => ({
    publicaciones: pubs.length,
    consultas: leads.length,
    favoritos: 0,
  }), [pubs, leads]);

  const userName = user?.user_metadata?.full_name?.split(" ")[0]
    || user?.email?.split("@")[0]
    || "Usuario";

  return (
    <div className={styles.page}>
      <title>Mi panel | Mi Vehículo</title>
      <Navbar />

      {showSuccess && (
        <div className={styles.successBanner}>
          <CheckCircle size={18} />
          <span>
            {showSuccess === "pending"
              ? "¡Listo! Tu publicación quedó pendiente de aprobación: la revisamos y te avisamos cuando esté visible."
              : showSuccess === "featured"
                ? "¡Listo! Tu publicación ya está destacada."
                : "¡Tu publicación fue enviada con éxito!"}
          </span>
          <button className={styles.successClose} onClick={() => setShowSuccess(false)} aria-label="Cerrar aviso">✕</button>
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
          {(actionError || pubsError) && (
            <div style={{
              background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)",
              color: "#ef4444", borderRadius: 8, padding: "10px 14px",
              fontSize: 13, marginBottom: 16, display: "flex", alignItems: "center", gap: 8,
            }}>
              <span>⚠</span>
              <span>{actionError || pubsError}</span>
            </div>
          )}
          {view === "inicio"        && <ViewInicio stats={stats} pubs={pubs} leads={leads} unread={unread} onNavigate={setView} />}
          {view === "publicaciones" && <ViewPublicaciones pubs={pubs} loading={loadingPubs && !isMockUser} onToggle={handleToggle} onDelete={handleDelete} onEdit={handleEdit} onHighlight={setHighlightPub} onRepublish={setRepublishPub} />}
          {view === "consultas"     && <ViewConsultas leads={leads} loading={loadingLeads && !isMockUser} />}
          {view === "perfil"        && <ViewPerfil onPausedAll={handlePausedAll} />}
        </main>
      </div>

      {highlightPub && <HighlightModal pub={highlightPub} onClose={() => setHighlightPub(null)} />}
      {republishPub && <RepublishModal pub={republishPub} onClose={() => setRepublishPub(null)} onPublished={handlePublished} />}
    </div>
  );
};

export default VendedorDashboard;
