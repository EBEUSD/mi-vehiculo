import { api } from "./api";

const MEM      = {};
const SS_KEY   = (path) => `mv_cat_${path}`;
const TTL      = 30 * 60 * 1000; // 30 min

const readSS = (path) => {
  try {
    const raw = sessionStorage.getItem(SS_KEY(path));
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > TTL) { sessionStorage.removeItem(SS_KEY(path)); return null; }
    return data;
  } catch { return null; }
};

const writeSS = (path, data) => {
  try { sessionStorage.setItem(SS_KEY(path), JSON.stringify({ data, ts: Date.now() })); } catch { /* storage lleno o bloqueado */ }
};

const INFLIGHT = {};

const get = async (path) => {
  if (MEM[path])      return MEM[path];
  const cached = readSS(path);
  if (cached)         { MEM[path] = cached; return cached; }

  // Dos componentes pidiendo lo mismo a la vez comparten la request
  if (!INFLIGHT[path]) {
    INFLIGHT[path] = api.get(path)
      .then((res) => {
        const data = res.data || [];
        MEM[path]  = data;
        writeSS(path, data);
        return data;
      })
      .finally(() => { delete INFLIGHT[path]; });
  }
  return INFLIGHT[path];
};

// Fire-and-forget: wake up the server + pre-cache brands
export const warmupCatalog = () => {
  if (readSS("/catalog/brands")) return; // already cached — server already warm
  get("/catalog/brands").catch(() => {});
};

export const catalogCache = { get };
