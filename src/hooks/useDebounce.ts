import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for debouncing values
 * Delays updating the value until after the specified delay
 */
export const useDebounce = <T>(value: T, delay: number = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Custom hook for throttling function calls
 * Limits the rate at which a function can fire
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 1000,
): T => {
  const lastRun = useRef(Date.now());

  return ((...args) => {
    const now = Date.now();
    if (now - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = now;
    }
  }) as T;
};
