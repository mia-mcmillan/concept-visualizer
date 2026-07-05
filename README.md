# ◈ Concept Visualizer

Type any concept — "photosynthesis", "blockchain", "compound interest",
"the water cycle" — and get back a detailed, animated 3D illustration that
explains it, rendered as a blueprint-style technical schematic: deep blue
background, white/cyan wireframe linework, and monospace annotations.

## How it works

There's no backend and no LLM call. A keyword classifier
(`js/classifier.js`) maps your text to one of twelve visual metaphors —
**cycle, process, network, hierarchy, growth, balance, orbiting system,
transformation, layered system, wave/energy, connection**, or a generic
**abstract** sculptural fallback for anything unmatched. Each metaphor is a
hand-built, animated Three.js scene (`js/scenes/`) with its own geometry,
lighting, and motion. A deterministic hash of your text (`js/palette.js`)
picks a consistent color palette, so the same concept always looks the
same, while different concepts in the same category still read as a
family.

Rendering: WebGL via Three.js. Every scene is built with ordinary solid
materials, then re-skinned by `applyBlueprintStyle` (`js/utils.js`) into
the schematic look — solid meshes become near-invisible glass panes with
crisp wireframe edges added on top, particles shrink into reference dots —
so individual scene files don't need to know about the visual style. Subtle
`UnrealBloomPass` post-processing, floating HTML/CSS annotation labels
(`CSS2DRenderer`) anchored to 3D nodes, and an orbit-controlled camera that
auto-rotates over a drafting-table grid.

## Running it

No build step, no dependencies to install. Three.js is vendored locally in
`vendor/three/` (trimmed to just the modules this project uses).

```bash
# from the project folder, serve it with any static file server, e.g.:
npx http-server -p 8080
# then open http://localhost:8080
```

Opening `index.html` directly via `file://` will **not** work — ES module
import maps require an HTTP(S) origin.

## Controls

| Control | Action |
| --- | --- |
| Type a concept + **Visualize** | Classify and render a new scene |
| Example chips | Quick-load a curated concept |
| Drag / scroll on the canvas | Orbit / zoom the camera |
| ⟲ | Re-roll a new visual variation of the current concept |
| ⏸ / ▶ | Pause / resume the animation |
| 〰 | Reduce motion (slows animation, disables camera auto-rotate) |
| ⇩ | Download a PNG snapshot of the current scene |

## Project structure

- `index.html`, `style.css` — page shell, blueprint/schematic UI
- `js/main.js` — renderer/camera/lighting/post-processing setup, scene
  lifecycle, UI wiring
- `js/classifier.js` — keyword → metaphor category classifier
- `js/palette.js` — deterministic per-concept blueprint color palettes
- `js/utils.js` — shared helpers (glow sprites, tubes, particle flows, noise,
  and `applyBlueprintStyle`, the wireframe re-skin pass)
- `js/label.js` — floating CSS2D label helper
- `js/scenes/*.js` — one file per visual metaphor
- `vendor/three/` — vendored Three.js core + the addon modules in use
  (controls, postprocessing, CSS2DRenderer)

## Extending it

To add a new visual metaphor: add a category + keywords to
`CATEGORIES` in `js/classifier.js`, write a `build(THREE, ctx)` function in
`js/scenes/<name>.js` that returns `{ group, update(elapsed, delta) }`, and
register it in `js/scenes/index.js`.
