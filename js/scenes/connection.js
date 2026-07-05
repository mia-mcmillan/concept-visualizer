import { makeGlowSprite } from "../utils.js";

function makeCluster(THREE, center, count, color, glowTexture, rng) {
  const group = new THREE.Group();
  group.position.copy(center);
  const nodes = [];
  for (let i = 0; i < count; i++) {
    const pos = new THREE.Vector3(
      (rng() - 0.5) * 1.1,
      (rng() - 0.5) * 1.1,
      (rng() - 0.5) * 1.1
    );
    const sprite = makeGlowSprite(THREE, glowTexture, color, 0.14 + rng() * 0.08);
    sprite.position.copy(pos);
    group.add(sprite);
    nodes.push({ sprite, base: pos.clone(), phase: rng() * Math.PI * 2 });
  }
  return { group, nodes };
}

export function build(THREE, ctx) {
  const { palette, glowTexture, rng, createLabel } = ctx;
  const group = new THREE.Group();

  const clusterA = makeCluster(THREE, new THREE.Vector3(-2.1, 0, 0), 10, palette.primaryHex, glowTexture, rng);
  const clusterB = makeCluster(THREE, new THREE.Vector3(2.1, 0, 0), 10, palette.secondaryHex, glowTexture, rng);
  group.add(clusterA.group, clusterB.group);

  const labelA = createLabel("A");
  labelA.position.set(-2.1, 1.1, 0);
  const labelB = createLabel("B");
  labelB.position.set(2.1, 1.1, 0);
  group.add(labelA, labelB);

  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2.1, 0, 0),
    new THREE.Vector3(-0.8, 0.5, 0.3),
    new THREE.Vector3(0, 0, -0.3),
    new THREE.Vector3(0.8, -0.4, 0.3),
    new THREE.Vector3(2.1, 0, 0),
  ]);
  const tubeGeo = new THREE.TubeGeometry(curve, 100, 0.045, 10, false);
  const tubeMat = new THREE.MeshStandardMaterial({
    color: palette.tertiaryHex,
    emissive: palette.tertiaryHex,
    emissiveIntensity: 0.4,
    transparent: true,
    opacity: 0.5,
  });
  const tube = new THREE.Mesh(tubeGeo, tubeMat);
  group.add(tube);

  const bridgeLabel = createLabel("Exchange");
  bridgeLabel.position.set(0, 0.55, 0);
  group.add(bridgeLabel);

  const packetCount = 16;
  const packets = [];
  for (let i = 0; i < packetCount; i++) {
    const forward = i % 2 === 0;
    const sprite = makeGlowSprite(
      THREE,
      glowTexture,
      forward ? palette.primaryHex : palette.secondaryHex,
      0.09
    );
    group.add(sprite);
    packets.push({ sprite, t: rng(), speed: 0.08 + rng() * 0.05, forward });
  }

  return {
    group,
    update(elapsed, delta) {
      for (const c of [clusterA, clusterB]) {
        c.group.rotation.y = elapsed * 0.15;
        for (const n of c.nodes) {
          n.sprite.position.copy(n.base);
          n.sprite.position.y += Math.sin(elapsed * 1.2 + n.phase) * 0.08;
        }
      }
      for (const p of packets) {
        p.t += p.speed * delta;
        if (p.t > 1) p.t = 0;
        const tt = p.forward ? p.t : 1 - p.t;
        const point = curve.getPointAt(tt);
        p.sprite.position.copy(point);
      }
      group.position.y = Math.sin(elapsed * 0.3) * 0.05;
    },
  };
}
