import { makeGlowSprite } from "../utils.js";

export function build(THREE, ctx) {
  const { palette, glowTexture, rng, createLabel } = ctx;
  const group = new THREE.Group();
  const nodeCount = 26;
  const nodes = [];

  for (let i = 0; i < nodeCount; i++) {
    const phi = Math.acos(2 * rng() - 1);
    const theta = rng() * Math.PI * 2;
    const r = 1.4 + rng() * 1.0;
    const pos = new THREE.Vector3(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi)
    );
    const isHub = i < 3;
    const sprite = makeGlowSprite(
      THREE,
      glowTexture,
      isHub ? palette.secondaryHex : palette.primaryHex,
      isHub ? 0.34 : 0.18 + rng() * 0.08
    );
    sprite.position.copy(pos);
    group.add(sprite);
    nodes.push({ sprite, base: pos.clone(), phase: rng() * Math.PI * 2, isHub });

    if (isHub) {
      const label = createLabel(`Node ${String.fromCharCode(65 + i)}`);
      label.position.copy(pos).add(new THREE.Vector3(0, 0.28, 0));
      group.add(label);
    }
  }

  // Connect each node to its k nearest neighbours.
  const lineGeoPositions = [];
  const k = 3;
  for (let i = 0; i < nodes.length; i++) {
    const distances = nodes
      .map((n, j) => ({ j, d: nodes[i].base.distanceTo(n.base) }))
      .filter((e) => e.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, k);
    for (const { j } of distances) {
      lineGeoPositions.push(
        nodes[i].base.x, nodes[i].base.y, nodes[i].base.z,
        nodes[j].base.x, nodes[j].base.y, nodes[j].base.z
      );
    }
  }
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(lineGeoPositions, 3));
  const lineMat = new THREE.LineBasicMaterial({
    color: palette.primaryHex,
    transparent: true,
    opacity: 0.25,
  });
  const lines = new THREE.LineSegments(lineGeo, lineMat);
  group.add(lines);

  // Traveling data-packet sprites along a subset of edges.
  const packetCount = 18;
  const packets = [];
  for (let i = 0; i < packetCount; i++) {
    const a = nodes[Math.floor(rng() * nodes.length)];
    const b = nodes[Math.floor(rng() * nodes.length)];
    if (a === b) continue;
    const sprite = makeGlowSprite(THREE, glowTexture, palette.particleHex, 0.1);
    group.add(sprite);
    packets.push({ sprite, a, b, t: rng(), speed: 0.15 + rng() * 0.15 });
  }

  return {
    group,
    update(elapsed, delta) {
      group.rotation.y = elapsed * 0.08;
      for (const n of nodes) {
        n.sprite.position.copy(n.base);
        n.sprite.position.multiplyScalar(1 + Math.sin(elapsed * 0.8 + n.phase) * 0.02);
      }
      for (const p of packets) {
        p.t += p.speed * delta;
        if (p.t > 1) {
          p.t = 0;
        }
        p.sprite.position.lerpVectors(p.a.base, p.b.base, p.t);
      }
    },
  };
}
