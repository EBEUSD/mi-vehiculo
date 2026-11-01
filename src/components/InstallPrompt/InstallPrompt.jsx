import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Download, Share, X } from "lucide-react";
import styles from "./InstallPrompt.module.css";

const DISMISS_KEY = "mv_install_dismissed";
const DISMISS_DAYS = 7;
const VISITS_KEY = "mv_visits";
const SESSION_KEY = "mv_visit_counted";
const ENGAGEMENT_MS = 30000;

// No interrumpir flujos de cuenta, publicación ni paneles
const HIDDEN_PREFIXES = ["/login", "/reset-password", "/publicar", "/editar", "/vendedor", "/admin", "/oauth-landing"];
const isHiddenRoute = (pathname) =>
  HIDDEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));

const hasFinePointer = () => window.matchMedia?.("(pointer: fine)").matches;

// Cuenta una visita por sesión del navegador; se evalúa una vez al cargar la app
const visitCount = (() => {
  try {
    let n = Number(localStorage.getItem(VISITS_KEY)) || 0;
    if (!sessionStorage.getItem(SESSION_KEY)) {
      n += 1;
      localStorage.setItem(VISITS_KEY, String(n));
      sessionStorage.setItem(SESSION_KEY, "1");
    }
    return n;
  } catch {
    return 0;
  }
})();

const isStandalone = () =>
  window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;

const isIOS = () =>
  /iphone|ipad|ipod/i.test(window.navigator.userAgent) ||
  (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);

const recentlyDismissed = () => {
  try {
    const ts = Number(localStorage.getItem(DISMISS_KEY));
    return ts && Date.now() - ts < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
};

// "Agregar a pantalla principal": botón nativo en Android/Chrome, instrucciones en iOS Safari.
// Nunca en la primera carga: recién desde la segunda visita o tras ~30 s de uso.
const InstallPrompt = () => {
  const { pathname } = useLocation();
  const [deferred, setDeferred] = useState(null);
  const [showIOS, setShowIOS]   = useState(false);
  const [engaged, setEngaged]   = useState(visitCount >= 2);

  useEffect(() => {
    if (engaged) return;
    const t = setTimeout(() => setEngaged(true), ENGAGEMENT_MS);
    return () => clearTimeout(t);
  }, [engaged]);

  useEffect(() => {
    if (isStandalone() || recentlyDismissed()) return;

    const onPrompt = (e) => {
      e.preventDefault();
      setDeferred(e);
    };
    const onInstalled = () => setDeferred(null);

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);

    // iOS no dispara beforeinstallprompt: mostramos instrucciones tras unos segundos
    let timer;
    // En escritorio (puntero fino) solo se muestra si el navegador ofreció la instalación
    if (isIOS() && !hasFinePointer()) timer = setTimeout(() => setShowIOS(true), 4000);

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      clearTimeout(timer);
    };
  }, []);

  const dismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch { /* sin storage */ }
    setDeferred(null);
    setShowIOS(false);
  };

  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    const { outcome } = await deferred.userChoice.catch(() => ({}));
    if (outcome !== "accepted") dismiss();
    setDeferred(null);
  };

  if (!engaged || isHiddenRoute(pathname)) return null;
  if (!deferred && !showIOS) return null;

  return (
    <div className={styles.banner} role="dialog" aria-label="Agregar a pantalla principal">
      <img src="/pwa-192.png" alt="" className={styles.icon} />
      <div className={styles.text}>
        <strong>Agregá Mi Vehículo a tu pantalla principal</strong>
        {deferred ? (
          <span>Abrila como una app, más rápido y sin buscarla.</span>
        ) : (
          <span>
            Tocá <Share size={13} className={styles.inlineIcon} /> Compartir y luego
            “Agregar a pantalla de inicio”.
          </span>
        )}
      </div>
      {deferred && (
        <button type="button" className={styles.installBtn} onClick={install}>
          <Download size={15} /> Agregar
        </button>
      )}
      <button type="button" className={styles.closeBtn} onClick={dismiss} aria-label="Cerrar">
        <X size={16} />
      </button>
    </div>
  );
};

export default InstallPrompt;
