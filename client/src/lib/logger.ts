export function logger(...args: unknown[]): void {
  if (import.meta.env.VITE_DEBUG) {
    // eslint-disable-next-line no-console
    console.log(...args);
  }
}
