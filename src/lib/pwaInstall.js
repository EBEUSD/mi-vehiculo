// Estado compartido de "Agregar a pantalla principal".
// El evento beforeinstallprompt se dispara una sola vez y muy temprano, así que
// se captura al importar el módulo (desde main.jsx) y lo usan el banner y el menú.

import { useSyncExternalStore } from "react";

export const isStandalone = () =>
  window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;

export const isIOS = () =>
  /iphone|ipad|ipod/i.test(window.navigator.userAgent) ||
  (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);

export const isTouchDevice = () => !window.matchMedia?.("(pointer: fine)").matches;

let state = { deferred: null, installed: isStandalone(), helpOpen: false };
const listeners = new Set();

const setState = (patch) => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
};

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  setState({ deferred: e });
});
window.addEventListener("appinstalled", () => setState({ deferred: null, installed: true, helpOpen: false }));

const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const useInstallState = () => useSyncExternalStore(subscribe, () => state);

// El menú ofrece la opción si el navegador permite instalar o, en celulares,
// para mostrar cómo hacerlo a mano (iOS y navegadores sin prompt nativo).
export const canOfferInstall = (s) => !s.installed && (!!s.deferred || isTouchDevice());

// Abre el diálogo nativo si existe; si no, muestra las instrucciones en el banner.
export const requestInstall = async () => {
  const { deferred } = state;
  if (!deferred) {
    setState({ helpOpen: true });
    return "help";
  }
  deferred.prompt();
  const { outcome } = await deferred.userChoice.catch(() => ({}));
  setState({ deferred: null });
  return outcome;
};

export const closeInstallHelp = () => setState({ helpOpen: false });
