// "Volver a donde estaba" después de iniciar sesión.
// Solo rutas internas: evita redirecciones abiertas (?next=https://otro-sitio).

const KEY = "mv_next";
const NO_RETURN = ["/login", "/oauth-landing", "/completar-perfil"];

export const safeNext = (raw) => {
  if (typeof raw !== "string" || !raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) return null;
  if (NO_RETURN.some((p) => raw === p || raw.startsWith(p + "?") || raw.startsWith(p + "/"))) return null;
  return raw;
};

// Para el login con Google/Apple, que sale del sitio y vuelve por /oauth-landing
export const rememberNext = (path) => {
  try {
    if (safeNext(path)) sessionStorage.setItem(KEY, path);
    else sessionStorage.removeItem(KEY);
  } catch { /* storage bloqueado */ }
};

export const takeNext = () => {
  try {
    const v = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    return safeNext(v);
  } catch { return null; }
};

export const loginHref = (path, view) => {
  const params = new URLSearchParams();
  if (view) params.set("view", view);
  if (safeNext(path)) params.set("next", path);
  const qs = params.toString();
  return qs ? `/login?${qs}` : "/login";
};
