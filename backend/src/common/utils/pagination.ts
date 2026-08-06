export function parsePage(value?: number | string | null, fallback = 1): number {
  const n = typeof value === 'string' ? Number.parseInt(value, 10) : value;
  if (typeof n !== 'number' || !Number.isInteger(n) || n <= 0) return fallback;
  return n;
}

export function parseLimit(value?: number | string | null, fallback = 10): number {
  const n = typeof value === 'string' ? Number.parseInt(value, 10) : value;
  if (typeof n !== 'number' || !Number.isInteger(n) || n <= 0) return fallback;
  return Math.min(n, 500);
}
