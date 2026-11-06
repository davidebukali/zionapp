import { useEffect, useMemo, useState } from "react";
import { debounce } from "../utils/debounce";
import { DEBOUNCE_DELAY_MS } from "../constants";

/**
 * Custom hook that debounces any rapidly changing value by delayMs.
 * Uses the global utils/debounce under the hood.
 */
export function useDebounce<T>(
  value: T,
  delayMs: number = DEBOUNCE_DELAY_MS
): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  const debouncedSetter = useMemo(
    () =>
      debounce((newValue: T) => {
        setDebouncedValue(newValue);
      }, delayMs),
    [delayMs]
  );

  useEffect(() => {
    debouncedSetter(value);

    return () => {
      debouncedSetter.cancel();
    };
  }, [value, debouncedSetter]);

  return debouncedValue;
}

