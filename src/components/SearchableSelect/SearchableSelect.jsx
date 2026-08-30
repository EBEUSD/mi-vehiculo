import { createPortal } from "react-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import styles from "./SearchableSelect.module.css";

const SearchableSelect = ({
  options = [],
  value = "",
  onChange,
  placeholder = "Seleccioná una opción",
  searchPlaceholder = "Buscar...",
  disabled = false,
  compact = false,
}) => {
  const [open, setOpen]     = useState(false);
  const [search, setSearch] = useState("");
  const [pos, setPos]       = useState({ top: 0, left: 0, width: 0, up: false });

  const triggerRef = useRef(null);
  const dropRef    = useRef(null);
  const inputRef   = useRef(null);

  // Calculate dropdown position from trigger rect
  const calcPos = useCallback(() => {
    if (!triggerRef.current) return;
    const r        = triggerRef.current.getBoundingClientRect();
    const maxH     = 300;
    const spaceBelow = window.innerHeight - r.bottom - 8;
    const up       = spaceBelow < maxH && r.top > maxH;
    setPos({ top: r.bottom + 6, bottom: window.innerHeight - r.top + 6, left: r.left, width: r.width, up });
  }, []);

  // Close on outside click (must exclude both trigger and portal)
  useEffect(() => {
    const handler = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        (!dropRef.current   || !dropRef.current.contains(e.target))
      ) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Reposition on scroll/resize while open
  useEffect(() => {
    if (!open) return;
    window.addEventListener("scroll", calcPos, true);
    window.addEventListener("resize", calcPos);
    return () => {
      window.removeEventListener("scroll", calcPos, true);
      window.removeEventListener("resize", calcPos);
    };
  }, [open, calcPos]);

  // Auto-focus search when opened
  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const q        = search.toLowerCase();
  const filtered = options.filter((o) => (o.label || "").toLowerCase().includes(q));
  const selected = options.find((o) => o.value === value);

  const handleToggle = () => {
    if (disabled) return;
    if (!open) calcPos();
    setOpen((p) => !p);
    setSearch("");
  };

  const handleSelect = (opt) => {
    onChange(opt.value);
    setOpen(false);
    setSearch("");
  };

  const dropStyle = pos.up
    ? { position: "fixed", bottom: pos.bottom, left: pos.left, width: pos.width, zIndex: 9999 }
    : { position: "fixed", top:    pos.top,    left: pos.left, width: pos.width, zIndex: 9999 };

  return (
    <div ref={triggerRef} className={`${styles.wrap} ${compact ? styles.compact : ""}`}>
      <button
        type="button"
        className={`${styles.trigger} ${open ? styles.triggerOpen : ""} ${disabled ? styles.triggerDisabled : ""}`}
        onClick={handleToggle}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={`${styles.triggerLabel} ${!selected ? styles.placeholder : ""}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={15} className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`} />
      </button>

      {open && createPortal(
        <div
          ref={dropRef}
          className={`${styles.dropdown} ${pos.up ? styles.dropUp : ""}`}
          style={dropStyle}
          role="listbox"
        >
          <div className={styles.searchRow}>
            <Search size={13} className={styles.searchIcon} />
            <input
              ref={inputRef}
              type="text"
              className={styles.searchInput}
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                className={styles.clearSearch}
                onMouseDown={(e) => { e.preventDefault(); setSearch(""); inputRef.current?.focus(); }}
              >
                <X size={12} />
              </button>
            )}
          </div>

          <div className={styles.list}>
            {filtered.length === 0 ? (
              <div className={styles.noResults}>Sin resultados para &ldquo;{search}&rdquo;</div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={opt.value === value}
                  className={`${styles.option} ${opt.value === value ? styles.optionSelected : ""}`}
                  onClick={() => handleSelect(opt)}
                >
                  {opt.label}
                  {opt.value === value && <span className={styles.checkmark}>✓</span>}
                </button>
              ))
            )}
          </div>

          {filtered.length > 0 && (
            <div className={styles.footer}>
              {filtered.length} {filtered.length === 1 ? "opción" : "opciones"}
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
};

export default SearchableSelect;
