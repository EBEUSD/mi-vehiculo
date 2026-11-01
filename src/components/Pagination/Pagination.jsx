import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./Pagination.module.css";

// Páginas visibles: primera, última y una ventana alrededor de la actual
const buildPages = (current, total, siblings = 1) => {
  const pages = new Set([1, total]);
  for (let p = current - siblings; p <= current + siblings; p++) {
    if (p > 1 && p < total) pages.add(p);
  }
  // Evita un "…" que esconde una sola página
  if (current - siblings - 1 === 2) pages.add(2);
  if (current + siblings + 1 === total - 1) pages.add(total - 1);

  const sorted = [...pages].sort((a, b) => a - b);
  const out = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push(`gap-${p}`);
    out.push(p);
  });
  return out;
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (!totalPages || totalPages <= 1) return null;

  const current = Math.min(Math.max(1, currentPage), totalPages);
  const items = buildPages(current, totalPages);

  return (
    <nav className={styles.pagination} aria-label="Paginación">
      <button
        type="button"
        onClick={() => onPageChange(current - 1)}
        disabled={current === 1}
        aria-label="Página anterior"
      >
        <ChevronLeft size={16} aria-hidden="true" />
      </button>

      {items.map((item) =>
        typeof item === "string" ? (
          <span key={item} className={styles.ellipsis} aria-hidden="true">…</span>
        ) : (
          <button
            type="button"
            key={item}
            className={item === current ? styles.active : ""}
            onClick={() => onPageChange(item)}
            aria-label={`Página ${item}`}
            aria-current={item === current ? "page" : undefined}
          >
            {item}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onPageChange(current + 1)}
        disabled={current === totalPages}
        aria-label="Página siguiente"
      >
        <ChevronRight size={16} aria-hidden="true" />
      </button>
    </nav>
  );
};

export default Pagination;
