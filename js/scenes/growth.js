import { makeGlowSprite } from "../utils.js";

export function build(THREE, ctx) {
  const { palette, glowTexture, createLabel } = ctx;
  const group = new THREE.Group();

  // Phyllotaxis spiral — a classic natural-growth pattern (sunflower seeds,
  // pinecones) built from the golden angle.
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const count = 180;
  const spiralGroup = new THREE.Group();
  const sprites = [];

  for (let i = 0; i < count; i++) {
    const t = i / count;
    const radius = 2.3 * Math.sqrt(t);
    const angle = i * goldenAngle;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const size = 0.05 + t * 0.14;
    const color = i % 2 === 0 ? palette.primaryHex : palette.secondaryHex;
    const sprite = makeGlowSprite(THREE, glowTexture, color, size);
    sprite.position.set(x, 0, z);
    sprite.userData.baseScale = size;
    sprite.userData.t = t;
    sprite.userData.delay = t * 1.0;
    spiralGroup.add(sprite);
    sprites.push(sprite);
  }
  group.add(spiralGroup);

  const stageLabels = ["Seed", "Growth", "Maturity"];
  const stagePositions = [0.05, 0.5, 0.95];
  stagePositions.forEach((t, i) => {
    const radius = 2.3 * Math.sqrt(t);
    const angle = Math.floor(t * count) * goldenAngle;
    const label = createLabel(stageLabels[i]);
    label.position.set(Math.cos(angle) * radius, 0.3, Math.sin(angle) * radius);
    group.add(label);
  });

  return {
    group,
    update(elapsed, delta) {
      spiralGroup.rotation.y = elapsed * 0.1;
      for (const sprite of sprites) {
        // Monotonic one-time reveal (each point grows in and stays) rather
        // than a repeating cycle, which read as the shape vanishing/resetting.
        const local = elapsed * 0.8 - sprite.userData.delay;
        const reveal = THREE.MathUtils.smoothstep(local, 0, 1);
        const pulse = 1 + Math.sin(elapsed * 2 + sprite.userData.t * 10) * 0.1 * reveal;
        const s = sprite.userData.baseScale * reveal * pulse;
        sprite.scale.set(s, s, 1);
      }
    },
  };
}
