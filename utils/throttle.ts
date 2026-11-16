/**
 * Creates a throttled function that invokes func at most once per every
 * waitMs milliseconds. The first call executes immediately (leading edge).
 *
 * If keyResolver is provided, throttling is tracked independently per key (e.g. account ID),
 * allowing distinct items to be interacted with without blocking each other.
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  waitMs: number,
  keyResolver?: (...args: Parameters<T>) => string
): ((...args: Parameters<T>) => ReturnType<T> | undefined) & {
  cancel: (key?: string) => void;
} {
  const lastCallTimes = new Map<string, number>();
  let globalLastCallTime = 0;

  const throttled = (...args: Parameters<T>): ReturnType<T> | undefined => {
    const now = Date.now();
    if (keyResolver) {
      const key = keyResolver(...args);
      const lastCall = lastCallTimes.get(key) ?? 0;
      if (now - lastCall >= waitMs) {
        lastCallTimes.set(key, now);
        return func(...args);
      }
      return undefined;
    }

    if (now - globalLastCallTime >= waitMs) {
      globalLastCallTime = now;
      return func(...args);
    }
    return undefined;
  };

  throttled.cancel = (key?: string) => {
    if (key) {
      lastCallTimes.delete(key);
    } else {
      lastCallTimes.clear();
      globalLastCallTime = 0;
    }
  };

  return throttled;
}
