// src/hooks/useDebounce.js
import { useState, useEffect } from "react";

/**
 * Delays updating a value until the user stops typing.
 *
 * Usage:
 *   const debounced = useDebounce(searchInput, 400);
 *   useEffect(() => { if (debounced) fetchResults(debounced); }, [debounced]);
 */
export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}