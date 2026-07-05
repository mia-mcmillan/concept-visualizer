import { noise3 } from "../utils.js";

export function build(THREE, ctx) {
  const { palette, createLabel } = ctx;
  const group = new THREE.Group();

  const geometry = new THREE.IcosahedronGeometry(1.3, 4);
  const posAttr = geometry.getAttribute("position");
  const vertexCount = posAttr.count;

  const formA = new Float32Array(vertexCount * 3);
  const formB = new Float32Array(vertexCount * 3);
  const normal = new THREE.Vector3();

  for (let i = 0; i < vertexCount; i++) {
    const x = posAttr.getX(i);
    const y = posAttr.getY(i);
    const z = posAttr.getZ(i);
    formA[i * 3] = x;
    formA[i * 3 + 1] = y;
    formA[i * 3 + 2] = z;

    normal.set(x, y, z).normalize();
    const n = noise3(x * 2.2, y * 2.2, z * 2.2);
    const displaced = normal.multiplyScalar(1 + n * 0.55);
    formB[i * 3] = displaced.x;
    formB[i * 3 + 1] = displaced.y;
    formB[i * 3 + 2] = displaced.z;
  }

  const material = new THREE.MeshStandardMaterial({
    color: palette.primaryHex,
    emissive: palette.primaryHex,
    emissiveIntensity: 0.4,
    roughness: 0.25,
    metalness: 0.5,
    flatShading: true,
  });
  const mesh = new THREE.Mesh(geometry, material);
  group.add(mesh);

  const light = new THREE.PointLight(palette.secondaryHex, 4, 10, 2);
  light.position.set(2, 1, 2);
  group.add(light);

  const labelA = createLabel("Form A");
  labelA.position.set(0, 1.9, 0);
  group.add(labelA);
  const labelB = createLabel("Form B");
  labelB.position.set(0, 1.9, 0);
  group.add(labelB);

  return {
    group,
    update(elapsed, delta) {
      const wave = (Math.sin(elapsed * 0.45) + 1) / 2; // 0..1..0
      for (let i = 0; i < vertexCount; i++) {
        const i3 = i * 3;
        posAttr.setXYZ(
          i,
          THREE.MathUtils.lerp(formA[i3], formB[i3], wave),
          THREE.MathUtils.lerp(formA[i3 + 1], formB[i3 + 1], wave),
          THREE.MathUtils.lerp(formA[i3 + 2], formB[i3 + 2], wave)
        );
      }
      posAttr.needsUpdate = true;
      geometry.computeVertexNormals();
      mesh.rotation.y += delta * 0.25;
      mesh.rotation.x = Math.sin(elapsed * 0.2) * 0.15;
      labelA.element.style.opacity = String(1 - wave);
      labelB.element.style.opacity = String(wave);
      light.position.x = Math.cos(elapsed * 0.5) * 3;
      light.position.z = Math.sin(elapsed * 0.5) * 3;
    },
  };
}
