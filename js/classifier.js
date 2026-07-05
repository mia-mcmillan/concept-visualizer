// Maps free-text concepts to a small library of 3D visual metaphors.
// Pure keyword scoring — no network calls, deterministic, instant.

export const CATEGORIES = {
  cycle: {
    label: "Cycle",
    description:
      "Rendered as a recurring ring — stages flow one into the next and loop back to the start.",
    keywords: [
      "cycle", "cycles", "cyclical", "water cycle", "carbon cycle", "nitrogen cycle",
      "seasons", "season", "rotation", "recurring", "circadian", "life cycle",
      "rock cycle", "sleep cycle", "moon phases", "menstrual", "loop", "repeat",
      "revolution", "orbit period", "recycling", "renewal",
    ],
  },
  process: {
    label: "Process",
    description:
      "Rendered as a linear pipeline — matter or information moves station to station toward an output.",
    keywords: [
      "process", "pipeline", "supply chain", "assembly", "workflow", "manufacturing",
      "digestion", "digestive", "production line", "value chain", "logistics",
      "compilation", "compiler", "algorithm", "recipe", "procedure", "sequence",
      "steps", "checkout", "onboarding", "distillation",
    ],
  },
  network: {
    label: "Network",
    description:
      "Rendered as a graph of glowing nodes — value emerges from the connections between them, not any single node.",
    keywords: [
      "network", "internet", "social network", "neural network", "blockchain",
      "graph", "web", "connections", "nodes", "mesh", "protocol", "peer to peer",
      "distributed system", "social media", "ecosystem of", "community", "crowd",
      "swarm", "collaboration", "brain", "synapse", "neuron",
    ],
  },
  hierarchy: {
    label: "Hierarchy",
    description:
      "Rendered as a branching tree — structure flows from a single root down through levels of specialization.",
    keywords: [
      "hierarchy", "tree", "org chart", "organization chart", "family tree",
      "taxonomy", "decision tree", "classification", "chain of command",
      "management", "bureaucracy", "file system", "directory structure",
      "phylogeny", "evolution tree", "class structure", "caste",
    ],
  },
  growth: {
    label: "Growth",
    description:
      "Rendered as an expanding, self-similar form — change compounds on itself over time.",
    keywords: [
      "growth", "grow", "evolution", "evolve", "compound interest", "compounding",
      "economic growth", "expansion", "scaling", "viral", "population growth",
      "inflation", "exponential", "startup growth", "photosynthesis",
      "germination", "maturity", "development",
    ],
  },
  balance: {
    label: "Balance",
    description:
      "Rendered as two forces held in tension around a fulcrum — stability comes from equilibrium, not stillness.",
    keywords: [
      "balance", "equilibrium", "supply and demand", "yin yang", "duality",
      "tradeoff", "trade-off", "symmetry", "justice", "fairness", "homeostasis",
      "checks and balances", "work life balance", "diplomacy tension", "compromise",
      "opposing forces", "counterweight",
    ],
  },
  orbit: {
    label: "Orbiting System",
    description:
      "Rendered as bodies in orbit — a central force holds independent elements in a stable, moving system.",
    keywords: [
      "orbit", "solar system", "atom", "atomic", "gravity", "planet", "planets",
      "satellite", "moon", "electron", "nucleus", "galaxy", "black hole",
      "gravitational", "kepler", "celestial", "cosmos", "universe", "star system",
    ],
  },
  transformation: {
    label: "Transformation",
    description:
      "Rendered as one form continuously morphing into another — identity changes while material is conserved.",
    keywords: [
      "transformation", "transform", "metamorphosis", "phase change", "reaction",
      "chemical reaction", "state change", "change management", "caterpillar",
      "butterfly", "melting", "freezing", "evaporation", "condensation",
      "conversion", "disruption", "innovation", "revolution industrial",
    ],
  },
  layers: {
    label: "Layered System",
    description:
      "Rendered as stacked, translucent strata — each level depends on the ones beneath it.",
    keywords: [
      "layers", "layer", "abstraction", "osi model", "sediment", "sedimentary",
      "strata", "architecture", "stack", "tech stack", "geology", "atmosphere",
      "atmospheric layers", "earth's layers", "skin layers", "onion",
      "abstraction layer", "protocol stack",
    ],
  },
  wave: {
    label: "Wave / Energy",
    description:
      "Rendered as propagating waveforms — energy travels through a medium without the medium itself traveling.",
    keywords: [
      "wave", "waves", "sound", "light", "frequency", "vibration",
      "electromagnetism", "electromagnetic", "energy", "resonance", "radio",
      "signal", "oscillation", "pulse", "tide", "tides", "quantum", "photon",
      "radiation",
    ],
  },
  connection: {
    label: "Connection",
    description:
      "Rendered as two clusters joined by a living bridge — exchange flows both ways across the link.",
    keywords: [
      "connection", "bridge", "empathy", "communication", "trade", "diplomacy",
      "relationship", "bond", "friendship", "love", "partnership", "negotiation",
      "collaboration between", "alliance", "marriage", "team", "trust",
      "globalization", "language translation",
    ],
  },
};

const PRIORITY = [
  "orbit", "wave", "network", "hierarchy", "layers", "cycle",
  "process", "transformation", "growth", "balance", "connection",
];

export function classify(rawText) {
  const text = (rawText || "").toLowerCase().trim();
  if (!text) return { category: "abstract", matched: null, confidence: 0 };

  let best = { category: null, score: 0, matched: null };

  for (const key of PRIORITY) {
    const { keywords } = CATEGORIES[key];
    for (const kw of keywords) {
      if (text.includes(kw)) {
        // Longer keyword matches are more specific -> weighted higher.
        const score = kw.length + (text === kw ? 5 : 0);
        if (score > best.score) {
          best = { category: key, score, matched: kw };
        }
      }
    }
  }

  if (!best.category) {
    return { category: "abstract", matched: null, confidence: 0 };
  }
  return { category: best.category, matched: best.matched, confidence: best.score };
}

export function categoryMeta(category) {
  if (category === "abstract") {
    return {
      label: "Abstract Form",
      description:
        "No strong metaphor matched, so this is a sculptural abstraction generated uniquely from your concept's text.",
    };
  }
  return CATEGORIES[category];
}
