const BASE_URL = import.meta.env.DEV
  ? "/api/v1"
  : "https://marketplace-autos-backend.onrender.com/api/v1";

let _accessToken  = localStorage.getItem("mv_access")  || null;
let _refreshToken = localStorage.getItem("mv_refresh") || null;

export const setTokens = (access, refresh) => {
  _accessToken  = access;
  _refreshToken = refresh;
  if (access)  localStorage.setItem("mv_access",  access);  else localStorage.removeItem("mv_access");
  if (refresh) localStorage.setItem("mv_refresh", refresh); else localStorage.removeItem("mv_refresh");
};

export const clearTokens = () => setTokens(null, null);

export const getAccessToken = () => _accessToken;

const authHeaders = () => {
  const h = { "Content-Type": "application/json" };
  if (_accessToken) h["Authorization"] = `Bearer ${_accessToken}`;
  return h;
};

const handle = async (res) => {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const raw = json.message || json.error || json.msg || json.detail || `HTTP ${res.status}`;
    const msg = Array.isArray(raw) ? raw.join(" / ") : raw;
    const err = new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
    err.status = res.status;
    err.body   = json;
    throw err;
  }
  return json;
};

export const api = {
  get:    (path)        => fetch(`${BASE_URL}${path}`, { headers: authHeaders() }).then(handle),
  post:   (path, body)  => fetch(`${BASE_URL}${path}`, { method: "POST",  headers: authHeaders(), body: JSON.stringify(body) }).then(handle),
  patch:  (path, body)  => fetch(`${BASE_URL}${path}`, { method: "PATCH", headers: authHeaders(), body: JSON.stringify(body) }).then(handle),
  delete: (path)        => fetch(`${BASE_URL}${path}`, { method: "DELETE", headers: authHeaders() }).then(handle),

  // multipart — for image uploads (no Content-Type: browser sets boundary automatically)
  upload: (path, formData) => {
    const h = {};
    if (_accessToken) h["Authorization"] = `Bearer ${_accessToken}`;
    return fetch(`${BASE_URL}${path}`, { method: "POST", headers: h, body: formData }).then(handle);
  },
};
