// Deterministic per-concept color palettes. Same text always yields the same
// palette; different concepts in the same category still read as a family.

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function hsl(h, s, l) {
  return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
}

// Base hue + spread per category, tuned so each metaphor has a coherent mood.
const CATEGORY_HUE = {
  cycle: { hue: 175, spread: 20 },
  process: { hue: 28, spread: 18 },
  network: { hue: 300, spread: 25 },
  hierarchy: { hue: 40, spread: 15 },
  growth: { hue: 140, spread: 20 },
  balance: { hue: 268, spread: 18 },
  orbit: { hue: 215, spread: 22 },
  transformation: { hue: 320, spread: 25 },
  layers: { hue: 24, spread: 20 },
  wave: { hue: 195, spread: 22 },
  connection: { hue: 165, spread: 20 },
  abstract: { hue: 0, spread: 360 },
};

export function getPalette(text, category) {
  const seed = hashString(text || "concept");
  const cfg = CATEGORY_HUE[category] || CATEGORY_HUE.abstract;
  const jitter = (seed % 1000) / 1000; // 0..1
  const hue = (cfg.hue + (jitter - 0.5) * cfg.spread + 360) % 360;
  const accentHue = (hue + 40 + (seed % 30)) % 360;

  return {
    seed,
    background: hsl(hue, 45, 4),
    primary: hsl(hue, 85, 62),
    secondary: hsl(accentHue, 80, 66),
    tertiary: hsl((hue + 200) % 360, 70, 70),
    particle: hsl(hue, 90, 78),
    primaryHex: hslToHex(hue, 85, 62),
    secondaryHex: hslToHex(accentHue, 80, 66),
    tertiaryHex: hslToHex((hue + 200) % 360, 70, 70),
    particleHex: hslToHex(hue, 90, 78),
    fogHex: hslToHex(hue, 40, 3),
  };
}

function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x) => Math.round(255 * x).toString(16).padStart(2, "0");
  return parseInt(`${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`, 16);
}

export function seededRandom(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function next() {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
