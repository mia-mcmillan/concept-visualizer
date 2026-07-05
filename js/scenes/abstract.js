import { makeGlowSprite, noise3 } from "../utils.js";

const CORE_SHAPES = ["icosahedron", "octahedron", "dodecahedron", "torusKnot"];

export function build(THREE, ctx) {
  const { palette, glowTexture, rng, createLabel, concept } = ctx;
  const group = new THREE.Group();

  const shapeKind = CORE_SHAPES[Math.floor(rng() * CORE_SHAPES.length)];
  let coreGeo;
  if (shapeKind === "icosahedron") coreGeo = new THREE.IcosahedronGeometry(1.1, 1);
  else if (shapeKind === "octahedron") coreGeo = new THREE.OctahedronGeometry(1.2, 2);
  else if (shapeKind === "dodecahedron") coreGeo = new THREE.DodecahedronGeometry(1.1, 0);
  else coreGeo = new THREE.TorusKnotGeometry(0.85, 0.28, 160, 24);

  const coreMat = new THREE.MeshStandardMaterial({
    color: palette.primaryHex,
    emissive: palette.primaryHex,
    emissiveIntensity: 0.2,
    roughness: 0.35,
    metalness: 0.4,
    flatShading: shapeKind !== "torusKnot",
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  group.add(core);

  const wireMesh = new THREE.Mesh(
    coreGeo,
    new THREE.MeshBasicMaterial({
      color: palette.secondaryHex,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    })
  );
  wireMesh.scale.setScalar(1.02);
  group.add(wireMesh);

  const particleCount = 220;
  const particles = [];
  for (let i = 0; i < particleCount; i++) {
    const phi = Math.acos(2 * rng() - 1);
    const theta = rng() * Math.PI * 2;
    const r = 2.1 + rng() * 0.8;
    const base = new THREE.Vector3(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi)
    );
    const sprite = makeGlowSprite(THREE, glowTexture, palette.particleHex, 0.05 + rng() * 0.05);
    sprite.position.copy(base);
    group.add(sprite);
    particles.push({ sprite, base, seed: rng() * 100 });
  }

  const label = createLabel(concept || "Concept");
  label.position.set(0, 1.7, 0);
  group.add(label);

  const light = new THREE.PointLight(palette.tertiaryHex, 2, 10, 2);
  light.position.set(2, 2, 2);
  group.add(light);

  return {
    group,
    update(elapsed, delta) {
      core.rotation.y += delta * 0.25;
      core.rotation.x += delta * 0.08;
      wireMesh.rotation.copy(core.rotation);
      const pulse = 1 + Math.sin(elapsed * 1.1) * 0.05;
      core.scale.setScalar(pulse);
      wireMesh.scale.setScalar(1.02 * pulse);

      for (const p of particles) {
        const n = noise3(
          p.base.x * 0.5 + elapsed * 0.15,
          p.base.y * 0.5 + p.seed,
          p.base.z * 0.5 + elapsed * 0.1
        );
        const offset = p.base.clone().multiplyScalar(1 + n * 0.08);
        p.sprite.position.lerp(offset, 0.05);
      }
      group.rotation.y = elapsed * 0.04;
    },
  };
}
