// Deterministic per-concept blueprint palettes. Same text always yields the
// same palette; different concepts in the same category still read as a
// family. Every palette stays inside the drafting-table blue/cyan/white
// range — categories nudge the hue and which line tone dominates rather
// than jumping around the color wheel the way a neon palette would.

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

// Base hue offset + spread per category, kept within a blueprint-blue band
// (roughly cyan to indigo) so the whole app reads as one drafting system.
const CATEGORY_HUE = {
  cycle: { hue: 190, spread: 10 },
  process: { hue: 205, spread: 10 },
  network: { hue: 225, spread: 12 },
  hierarchy: { hue: 210, spread: 8 },
  growth: { hue: 185, spread: 10 },
  balance: { hue: 215, spread: 10 },
  orbit: { hue: 220, spread: 12 },
  transformation: { hue: 230, spread: 12 },
  layers: { hue: 200, spread: 8 },
  wave: { hue: 195, spread: 10 },
  connection: { hue: 205, spread: 10 },
  abstract: { hue: 210, spread: 20 },
};

export function getPalette(text, category) {
  const seed = hashString(text || "concept");
  const cfg = CATEGORY_HUE[category] || CATEGORY_HUE.abstract;
  const jitter = (seed % 1000) / 1000; // 0..1
  const hue = (cfg.hue + (jitter - 0.5) * cfg.spread + 360) % 360;
  const lineHue = (hue + ((seed % 21) - 10) + 360) % 360;

  return {
    seed,
    // Deep drafting-table blue the whole scene sits on.
    background: hsl(hue, 58, 15),
    // Crisp white/cyan linework — the "ink" the wireframes are drawn in.
    primary: hsl(lineHue, 30, 93),
    // Slightly cooler line tone for secondary parts of a scene.
    secondary: hsl(lineHue, 45, 80),
    // A warm highlighter accent, used sparingly for emphasis marks.
    tertiary: hsl(38, 80, 68),
    particle: hsl(lineHue, 25, 96),
    primaryHex: hslToHex(lineHue, 30, 93),
    secondaryHex: hslToHex(lineHue, 45, 80),
    tertiaryHex: hslToHex(38, 80, 68),
    particleHex: hslToHex(lineHue, 25, 96),
    backgroundHex: hslToHex(hue, 58, 15),
    fogHex: hslToHex(hue, 55, 12),
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
