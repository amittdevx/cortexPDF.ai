/**
 * ID + hashing helpers. No external deps — keeps the bundle light.
 *
 * `createId` is monotonic-ish (counter + entropy) and good enough for local
 * primary keys / React keys. `hashString` produces a stable short hash used to
 * key cached AI summaries by file content signature.
 */

let counter = 0;

/** A short, collision-resistant-enough id for local records. */
export function createId(prefix = 'id'): string {
  counter = (counter + 1) % 1_000_000;
  const entropy = Math.floor(Math.random() * 0xffffff).toString(36);
  const time = performance.now().toString(36).replace('.', '');
  return `${prefix}_${time}${counter.toString(36)}${entropy}`;
}

/** Stable 32-bit FNV-1a hash, returned as a base36 string. */
export function hashString(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}
