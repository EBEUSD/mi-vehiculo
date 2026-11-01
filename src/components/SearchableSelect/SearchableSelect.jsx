import { createPortal } from "react-dom";
import { useCallback, useEffect, useId, useRef, useState } from "react";
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
  // Permite escribir un valor que no está en la lista (ej. "otra marca")
  allowCustom = false,
}) => {
  const [open, setOpen]     = useState(false);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState(0);
  const [pos, setPos]       = useState({ top: 0, left: 0, width: 0, up: false });

  const triggerRef = useRef(null);
  const buttonRef  = useRef(null);
  const dropRef    = useRef(null);
  const inputRef   = useRef(null);

  const baseId   = useId();
  const listId   = `${baseId}-list`;
  const optionId = (i) => `${baseId}-opt-${i}`;

  // Calculate dropdown position from trigger rect
  const calcPos = useCallback(() => {
    if (!triggerRef.current) return;
    const r        = triggerRef.current.getBoundingClientRect();
    const maxH     = 300;
    const spaceBelow = window.innerHeight - r.bottom - 8;
    const up       = spaceBelow < maxH && r.top > maxH;
    setPos({ top: r.bottom + 6, bottom: window.innerHeight - r.top + 6, left: r.left, width: r.width, up });
  }, []);

  const close = (returnFocus = false) => {
    setOpen(false);
    setSearch("");
    if (returnFocus) buttonRef.current?.focus();
  };

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
  const selected = options.find((o) => o.value === value)
    || (allowCustom && value ? { value, label: value } : undefined);
  const customText = search.trim();
  const showCustom = allowCustom && customText &&
    !options.some((o) => (o.label || "").toLowerCase() === customText.toLowerCase());

  // Lista navegable con teclado: la opción "Usar X" (si aplica) va primero
  const items = showCustom ? [{ value: customText, custom: true }, ...filtered] : filtered;
  const activeIndex = items.length ? Math.min(active, items.length - 1) : -1;

  // Mantener visible la opción activa
  useEffect(() => {
    if (!open || activeIndex < 0) return;
    document.getElementById(`${baseId}-opt-${activeIndex}`)?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex, baseId]);

  const openList = () => {
    if (disabled) return;
    calcPos();
    setSearch("");
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  };

  const handleToggle = () => {
    if (disabled) return;
    if (open) close();
    else openList();
  };

  const handleSelect = (opt) => {
    onChange(opt.value);
    close(true);
  };

  const handleTriggerKeyDown = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      e.preventDefault();
      openList();
    }
  };

  const handleInputKeyDown = (e) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (items.length) setActive((activeIndex + 1) % items.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        if (items.length) setActive((activeIndex - 1 + items.length) % items.length);
        break;
      case "Home":
        if (items.length) { e.preventDefault(); setActive(0); }
        break;
      case "End":
        if (items.length) { e.preventDefault(); setActive(items.length - 1); }
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0) handleSelect(items[activeIndex]);
        break;
      case "Escape":
        e.preventDefault();
        e.stopPropagation();
        close(true);
        break;
      case "Tab":
        // Volver al trigger: el Tab nativo continúa desde ahí en el orden del documento
        close(true);
        break;
      default:
    }
  };

  // Cerrar si el foco sale del desplegable (el portal vive fuera del formulario)
  const handleInputBlur = (e) => {
    const next = e.relatedTarget;
    if (next && (dropRef.current?.contains(next) || triggerRef.current?.contains(next))) return;
    if (open) close();
  };

  const dropStyle = pos.up
    ? { position: "fixed", bottom: pos.bottom, left: pos.left, width: pos.width, zIndex: 9999 }
    : { position: "fixed", top:    pos.top,    left: pos.left, width: pos.width, zIndex: 9999 };

  return (
    <div ref={triggerRef} className={`${styles.wrap} ${compact ? styles.compact : ""}`}>
      <button
        ref={buttonRef}
        type="button"
        className={`${styles.trigger} ${open ? styles.triggerOpen : ""} ${disabled ? styles.triggerDisabled : ""}`}
        onClick={handleToggle}
        onKeyDown={handleTriggerKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
      >
        <span className={`${styles.triggerLabel} ${!selected ? styles.placeholder : ""}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={15} aria-hidden="true" className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`} />
      </button>

      {open && createPortal(
        <div
          ref={dropRef}
          className={`${styles.dropdown} ${pos.up ? styles.dropUp : ""}`}
          style={dropStyle}
          // Evita que el input pierda el foco al tocar opciones o la barra de scroll
          onMouseDown={(e) => { if (e.target !== inputRef.current) e.preventDefault(); }}
        >
          <div className={styles.searchRow}>
            <Search size={13} className={styles.searchIcon} aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              className={styles.searchInput}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder.replace(/\.+$/, "") || "Buscar"}
              aria-expanded="true"
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={activeIndex >= 0 ? optionId(activeIndex) : undefined}
              autoComplete="off"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setActive(0); }}
              onKeyDown={handleInputKeyDown}
              onBlur={handleInputBlur}
            />
            {search && (
              <button
                type="button"
                className={styles.clearSearch}
                aria-label="Limpiar búsqueda"
                tabIndex={-1}
                onMouseDown={(e) => { e.preventDefault(); setSearch(""); setActive(0); inputRef.current?.focus(); }}
              >
                <X size={12} aria-hidden="true" />
              </button>
            )}
          </div>

          <div className={styles.list} id={listId} role="listbox">
            {items.map((opt, i) => {
              const isSelected = !opt.custom && opt.value === value;
              return (
                <div
                  key={opt.custom ? "__custom__" : opt.value}
                  id={optionId(i)}
                  role="option"
                  aria-selected={isSelected}
                  className={`${styles.option} ${isSelected ? styles.optionSelected : ""} ${i === activeIndex ? styles.optionActive : ""}`}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => handleSelect(opt)}
                >
                  {opt.custom ? <>Usar &ldquo;{customText}&rdquo;</> : opt.label}
                  {isSelected && <span className={styles.checkmark} aria-hidden="true">✓</span>}
                </div>
              );
            })}
            {items.length === 0 && (
              <div className={styles.noResults} role="presentation">Sin resultados para &ldquo;{search}&rdquo;</div>
            )}
          </div>

          {filtered.length > 0 && (
            <div className={styles.footer} aria-hidden="true">
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
