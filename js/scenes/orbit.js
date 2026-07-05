export function build(THREE, ctx) {
  const { palette, rng, createLabel } = ctx;
  const group = new THREE.Group();

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.55, 32, 32),
    new THREE.MeshStandardMaterial({
      color: palette.secondaryHex,
      emissive: palette.secondaryHex,
      emissiveIntensity: 0.8,
      roughness: 0.25,
      metalness: 0.3,
    })
  );
  group.add(core);
  const coreLabel = createLabel("Core");
  coreLabel.position.set(0, 0.85, 0);
  core.add(coreLabel);

  const light = new THREE.PointLight(palette.secondaryHex, 6, 8, 2);
  core.add(light);

  const satelliteCount = 5;
  const satellites = [];

  for (let i = 0; i < satelliteCount; i++) {
    const radius = 1.2 + i * 0.55;
    const inclination = (rng() - 0.5) * 1.1;
    const speed = 0.5 / (i * 0.6 + 1);
    const size = 0.12 + rng() * 0.14;

    const orbitPivot = new THREE.Group();
    orbitPivot.rotation.x = inclination;
    orbitPivot.rotation.z = rng() * Math.PI;
    group.add(orbitPivot);

    const ringGeo = new THREE.RingGeometry(radius - 0.01, radius + 0.01, 96);
    const ringMat = new THREE.MeshBasicMaterial({
      color: palette.primaryHex,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    orbitPivot.add(ring);

    const satMat = new THREE.MeshStandardMaterial({
      color: i % 2 === 0 ? palette.primaryHex : palette.tertiaryHex,
      emissive: i % 2 === 0 ? palette.primaryHex : palette.tertiaryHex,
      emissiveIntensity: 0.5,
      roughness: 0.4,
      metalness: 0.3,
    });
    const sat = new THREE.Mesh(new THREE.SphereGeometry(size, 20, 20), satMat);
    orbitPivot.add(sat);

    satellites.push({ pivot: orbitPivot, sat, radius, speed, angle: rng() * Math.PI * 2 });
  }

  return {
    group,
    update(elapsed, delta) {
      core.rotation.y += delta * 0.3;
      const pulse = 1 + Math.sin(elapsed * 2) * 0.06;
      core.scale.setScalar(pulse);
      for (const s of satellites) {
        s.angle += s.speed * delta;
        s.sat.position.set(Math.cos(s.angle) * s.radius, 0, Math.sin(s.angle) * s.radius);
        s.sat.rotation.y += delta;
      }
      group.rotation.y = elapsed * 0.03;
    },
  };
}
