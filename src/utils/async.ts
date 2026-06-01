/** Small async / timing utilities. */

/** Resolve after `ms` milliseconds. */
export const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Debounce a function — trailing edge. Useful for write-through persistence and
 * search-as-you-type so we don't hammer the DB / storage on every keystroke.
 */
export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  wait: number,
): ((...args: Args) => void) & { flush: () => void; cancel: () => void } {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pending: Args | null = null;

  const run = () => {
    if (pending) {
      fn(...pending);
      pending = null;
    }
    timer = null;
  };

  const debounced = (...args: Args) => {
    pending = args;
    if (timer) clearTimeout(timer);
    timer = setTimeout(run, wait);
  };

  debounced.flush = () => {
    if (timer) clearTimeout(timer);
    run();
  };
  debounced.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = null;
    pending = null;
  };

  return debounced;
}
