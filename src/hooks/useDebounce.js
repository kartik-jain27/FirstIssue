import { useEffect, useState } from 'react';

/**
 * Returns a debounced copy of a value after the requested delay.
 * @param {unknown} value Value to debounce.
 * @param {number} delay Delay in milliseconds.
 * @returns {unknown}
 */
export function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(timeoutId);
  }, [value, delay]);

  return debouncedValue;
}
