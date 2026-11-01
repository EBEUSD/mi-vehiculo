import { supabase } from "./supabase";

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

// Token vencido (401): se renueva una vez con Supabase y se repite la request
let _refreshing = null;
const refreshAccessToken = () => {
  if (!_refreshing) {
    _refreshing = supabase.auth.refreshSession()
      .then(({ data, error }) => {
        if (error || !data?.session) return false;
        setTokens(data.session.access_token, data.session.refresh_token);
        return true;
      })
      .catch(() => false)
      .finally(() => { _refreshing = null; });
  }
  return _refreshing;
};

const request = async (path, init = {}) => {
  const send = () => fetch(`${BASE_URL}${path}`, { ...init, headers: init.headers() });
  let res = await send();
  if (res.status === 401 && _accessToken && await refreshAccessToken()) res = await send();
  return handle(res);
};

const uploadHeaders = () => {
  const h = {};
  if (_accessToken) h["Authorization"] = `Bearer ${_accessToken}`;
  return h;
};

export const api = {
  get:    (path)        => request(path, { headers: authHeaders }),
  post:   (path, body)  => request(path, { method: "POST",   headers: authHeaders, body: JSON.stringify(body) }),
  patch:  (path, body)  => request(path, { method: "PATCH",  headers: authHeaders, body: JSON.stringify(body) }),
  delete: (path)        => request(path, { method: "DELETE", headers: authHeaders }),

  // multipart — for image uploads (no Content-Type: browser sets boundary automatically)
  upload: (path, formData) => request(path, { method: "POST", headers: uploadHeaders, body: formData }),
};
