export function build(THREE, ctx) {
  const { palette, createLabel } = ctx;
  const group = new THREE.Group();

  const width = 4.4;
  const depth = 4.4;
  const segs = 64;
  const geometry = new THREE.PlaneGeometry(width, depth, segs, segs);
  geometry.rotateX(-Math.PI / 2);
  const posAttr = geometry.getAttribute("position");
  const basePositions = new Float32Array(posAttr.array);

  const material = new THREE.MeshStandardMaterial({
    color: palette.primaryHex,
    emissive: palette.primaryHex,
    emissiveIntensity: 0.35,
    roughness: 0.3,
    metalness: 0.5,
    wireframe: false,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geometry, material);
  group.add(mesh);

  const wireMat = new THREE.MeshBasicMaterial({
    color: palette.secondaryHex,
    wireframe: true,
    transparent: true,
    opacity: 0.25,
  });
  const wireMesh = new THREE.Mesh(geometry, wireMat);
  group.add(wireMesh);

  const source = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 20, 20),
    new THREE.MeshStandardMaterial({
      color: palette.secondaryHex,
      emissive: palette.secondaryHex,
      emissiveIntensity: 1,
    })
  );
  source.position.y = 0.6;
  group.add(source);
  const label = createLabel("Source");
  label.position.set(0, 1, 0);
  source.add(label);

  const light = new THREE.PointLight(palette.secondaryHex, 5, 8, 2);
  source.add(light);

  return {
    group,
    update(elapsed) {
      for (let i = 0; i < posAttr.count; i++) {
        const x = basePositions[i * 3];
        const z = basePositions[i * 3 + 2];
        const dist = Math.sqrt(x * x + z * z);
        const y = Math.sin(dist * 2.2 - elapsed * 2.2) * 0.28 * Math.exp(-dist * 0.12);
        posAttr.setY(i, y);
      }
      posAttr.needsUpdate = true;
      geometry.computeVertexNormals();
      source.position.y = 0.6 + Math.sin(elapsed * 2.2) * 0.1;
      group.rotation.y = elapsed * 0.06;
    },
  };
}
