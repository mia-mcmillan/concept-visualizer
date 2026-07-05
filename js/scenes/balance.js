export function build(THREE, ctx) {
  const { palette, createLabel } = ctx;
  const group = new THREE.Group();

  const matA = new THREE.MeshStandardMaterial({
    color: palette.primaryHex,
    emissive: palette.primaryHex,
    emissiveIntensity: 0.5,
    roughness: 0.3,
    metalness: 0.4,
  });
  const matB = new THREE.MeshStandardMaterial({
    color: palette.secondaryHex,
    emissive: palette.secondaryHex,
    emissiveIntensity: 0.5,
    roughness: 0.3,
    metalness: 0.4,
  });

  const fulcrum = new THREE.Mesh(
    new THREE.ConeGeometry(0.35, 0.9, 24),
    new THREE.MeshStandardMaterial({
      color: palette.tertiaryHex,
      emissive: palette.tertiaryHex,
      emissiveIntensity: 0.2,
      roughness: 0.5,
    })
  );
  fulcrum.position.y = -0.9;
  group.add(fulcrum);

  const beamPivot = new THREE.Group();
  beamPivot.position.y = -0.45;
  group.add(beamPivot);

  const beam = new THREE.Mesh(
    new THREE.BoxGeometry(3.4, 0.08, 0.08),
    new THREE.MeshStandardMaterial({ color: palette.primaryHex, metalness: 0.6, roughness: 0.3 })
  );
  beamPivot.add(beam);

  function makePan(x, mat, label) {
    const armGroup = new THREE.Group();
    armGroup.position.x = x;
    beamPivot.add(armGroup);

    const chain = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 0.6, 6),
      new THREE.MeshStandardMaterial({ color: 0x888888 })
    );
    chain.position.y = -0.3;
    armGroup.add(chain);

    const orb = new THREE.Mesh(new THREE.IcosahedronGeometry(0.4, 1), mat);
    orb.position.y = -0.65;
    armGroup.add(orb);

    const lbl = createLabel(label);
    lbl.position.y = 0.45;
    orb.add(lbl);

    return { armGroup, orb };
  }

  const panA = makePan(-1.5, matA, "Force A");
  const panB = makePan(1.5, matB, "Force B");

  return {
    group,
    update(elapsed) {
      const tilt = Math.sin(elapsed * 0.6) * 0.12;
      beamPivot.rotation.z = tilt;
      panA.orb.rotation.y += 0.01;
      panB.orb.rotation.y += 0.01;
      const pulse = 1 + Math.sin(elapsed * 1.5) * 0.06;
      panA.orb.scale.setScalar(pulse);
      panB.orb.scale.setScalar(2 - pulse);
      group.rotation.y = Math.sin(elapsed * 0.1) * 0.2;
    },
  };
}
