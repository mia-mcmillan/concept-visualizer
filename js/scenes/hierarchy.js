export function build(THREE, ctx) {
  const { palette, rng, createLabel } = ctx;
  const group = new THREE.Group();
  const nodeMeshes = [];
  const branchMeshes = [];

  const glowMat = (color, intensity = 0.5) =>
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: intensity,
      roughness: 0.35,
      metalness: 0.4,
    });

  function addNode(pos, size, color, label) {
    const geo = new THREE.SphereGeometry(size, 16, 16);
    const mesh = new THREE.Mesh(geo, glowMat(color));
    mesh.position.copy(pos);
    group.add(mesh);
    nodeMeshes.push({ mesh, phase: rng() * Math.PI * 2 });
    if (label) {
      const lbl = createLabel(label);
      lbl.position.set(0, size + 0.22, 0);
      mesh.add(lbl);
    }
    return mesh;
  }

  function addBranch(from, to) {
    const dir = new THREE.Vector3().subVectors(to, from);
    const len = dir.length();
    const geo = new THREE.CylinderGeometry(0.03, 0.05, len, 6);
    const mesh = new THREE.Mesh(geo, glowMat(palette.primaryHex, 0.25));
    mesh.position.copy(from).add(dir.clone().multiplyScalar(0.5));
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    group.add(mesh);
    branchMeshes.push(mesh);
  }

  const levels = 4;
  const root = new THREE.Vector3(0, -1.8, 0);
  addNode(root, 0.28, palette.secondaryHex, "Root");

  function grow(pos, dir, depth, spread) {
    if (depth > levels) return;
    const childCount = depth === levels ? 0 : depth === 0 ? 3 : rng() > 0.35 ? 2 : 1;
    for (let i = 0; i < childCount; i++) {
      const angle = (i - (childCount - 1) / 2) * spread + (rng() - 0.5) * 0.2;
      const childDir = dir
        .clone()
        .applyAxisAngle(new THREE.Vector3(0, 0, 1), angle)
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), (rng() - 0.5) * 1.2);
      const length = 1.15 - depth * 0.12;
      const childPos = pos.clone().add(childDir.clone().multiplyScalar(length));
      const size = Math.max(0.09, 0.24 - depth * 0.04);
      const isLeaf = depth === levels - 1;
      addNode(childPos, size, isLeaf ? palette.tertiaryHex : palette.primaryHex, isLeaf && rng() > 0.6 ? "Leaf" : null);
      addBranch(pos, childPos);
      grow(childPos, childDir, depth + 1, spread * 0.8);
    }
  }

  grow(root, new THREE.Vector3(0, 1, 0), 0, 1.0);

  return {
    group,
    update(elapsed, delta) {
      group.rotation.y = elapsed * 0.1;
      for (const { mesh, phase } of nodeMeshes) {
        const s = 1 + Math.sin(elapsed * 1.3 + phase) * 0.08;
        mesh.scale.setScalar(s);
      }
    },
  };
}
