// Helpers de precios en USD.

// Convierte texto libre ("15.000", "15,000", "$1,500", "15000.50") a número.
// Un punto/coma seguido de exactamente 3 dígitos se toma como separador de miles.
// Devuelve null si no hay un número válido.
export const parseMoney = (raw) => {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;

  let s = String(raw).trim().replace(/[\s$]|USD/gi, "");
  if (!s || /[^\d.,]/.test(s)) return null;

  const lastSep = Math.max(s.lastIndexOf("."), s.lastIndexOf(","));
  if (lastSep !== -1) {
    const decimals = s.slice(lastSep + 1);
    const intPart  = s.slice(0, lastSep).replace(/[.,]/g, "");
    // 3 dígitos después del último separador → miles ("15.000", "1,500")
    s = decimals.length === 3 ? `${intPart}${decimals}` : `${intPart}.${decimals}`;
  }

  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

// true si el texto representa un precio mayor a 0
export const isValidPrice = (raw) => {
  const n = parseMoney(raw);
  return n !== null && n > 0;
};

// Formatea en USD: 15000 → "$15,000"; 15000.5 → "$15,000.50"
export const formatUSD = (value, { suffix = false } = {}) => {
  const n = typeof value === "number" ? value : parseMoney(value);
  if (n === null || !Number.isFinite(n)) return "—";
  const text = `$${n.toLocaleString("en-US", {
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
  return suffix ? `${text} USD` : text;
};
