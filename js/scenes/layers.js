import { makeGlowSprite } from "../utils.js";

export function build(THREE, ctx) {
  const { palette, glowTexture, rng, createLabel } = ctx;
  const group = new THREE.Group();
  const layerCount = 5;
  const gap = 0.55;
  const startY = -((layerCount - 1) * gap) / 2;
  const names = ["Foundation", "Core", "Logic", "Interface", "Surface"];
  const layerMeshes = [];

  for (let i = 0; i < layerCount; i++) {
    const y = startY + i * gap;
    const radius = 1.9 - i * 0.12;
    const geo = new THREE.CylinderGeometry(radius, radius, 0.08, 48, 1, false);
    const t = i / (layerCount - 1);
    const color = new THREE.Color(palette.primaryHex).lerp(new THREE.Color(palette.secondaryHex), t);
    const mat = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.42,
      roughness: 0.4,
      metalness: 0.2,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = y;
    mesh.userData.baseY = y;
    mesh.userData.phase = i * 0.6;
    group.add(mesh);
    layerMeshes.push(mesh);

    const label = createLabel(names[i]);
    label.position.set(radius + 0.35, y, 0);
    group.add(label);

    for (let p = 0; p < 8; p++) {
      const angle = rng() * Math.PI * 2;
      const r = radius * 0.6 * rng();
      const sprite = makeGlowSprite(THREE, glowTexture, palette.particleHex, 0.06 + rng() * 0.04);
      sprite.position.set(Math.cos(angle) * r, y, Math.sin(angle) * r);
      sprite.userData.orbitR = r;
      sprite.userData.orbitAngle = angle;
      sprite.userData.orbitSpeed = 0.2 + rng() * 0.3;
      sprite.userData.y = y;
      group.add(sprite);
      mesh.userData.particles = mesh.userData.particles || [];
      mesh.userData.particles.push(sprite);
    }
  }

  return {
    group,
    update(elapsed, delta) {
      group.rotation.y = elapsed * 0.08;
      for (const mesh of layerMeshes) {
        mesh.position.y = mesh.userData.baseY + Math.sin(elapsed * 0.6 + mesh.userData.phase) * 0.05;
        for (const sprite of mesh.userData.particles) {
          sprite.userData.orbitAngle += sprite.userData.orbitSpeed * delta;
          sprite.position.set(
            Math.cos(sprite.userData.orbitAngle) * sprite.userData.orbitR,
            mesh.position.y,
            Math.sin(sprite.userData.orbitAngle) * sprite.userData.orbitR
          );
        }
      }
    },
  };
}
