export const rng = (seed) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
const hash = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s) }
const vnoise = (x, y) => {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf)
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}
export const fbm = (x, y) => { let s = 0, a = 0.5; for (let i = 0; i < 5; i++) { s += a * vnoise(x, y); x *= 2; y *= 2; a *= 0.5 } return s }
export const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }

// Flat city (|x|,|z| < 300). Mountains rise outside it. Beach + sea on the +Z side.
export function heightAt(x, z) {
  const d = Math.max(Math.abs(x), Math.abs(z))
  const edge = sstep(300, 450, d)
  const n = fbm(x * 0.004 + 10, z * 0.004 + 10)
  const hills = edge * (Math.max(0, n - 0.25) * 190 + fbm(x * 0.04, z * 0.04) * 4)
  const sea = sstep(315, 375, z + (fbm(x * 0.008, 0.5) - 0.5) * 40)
  return hills * (1 - sea) - 7 * sea
}
