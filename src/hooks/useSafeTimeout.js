import { useCallback, useEffect, useRef } from "react";

// setTimeout que se cancela solo al desmontar el componente.
export default function useSafeTimeout() {
  const timers = useRef(new Set());

  useEffect(() => {
    const set = timers.current;
    return () => { set.forEach(clearTimeout); set.clear(); };
  }, []);

  return useCallback((fn, ms) => {
    const id = setTimeout(() => { timers.current.delete(id); fn(); }, ms);
    timers.current.add(id);
    return id;
  }, []);
}
