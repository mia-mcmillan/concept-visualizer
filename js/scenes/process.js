import { flowParticlesAlongCurve } from "../utils.js";

const STAGE_NAMES = ["Input", "Process", "Refine", "Output"];

export function build(THREE, ctx) {
  const { palette, glowTexture, createLabel } = ctx;
  const group = new THREE.Group();
  const stageCount = 4;
  const spacing = 1.7;
  const startX = -((stageCount - 1) * spacing) / 2;

  const points = [];
  const stationMeshes = [];

  for (let i = 0; i < stageCount; i++) {
    const x = startX + i * spacing;
    const y = Math.sin(i * 1.1) * 0.25;
    points.push(new THREE.Vector3(x, y, 0));

    const geo = new THREE.CylinderGeometry(0.4, 0.5, 0.5, 6, 1);
    const mat = new THREE.MeshStandardMaterial({
      color: i === stageCount - 1 ? palette.secondaryHex : palette.primaryHex,
      emissive: i === stageCount - 1 ? palette.secondaryHex : palette.primaryHex,
      emissiveIntensity: 0.45,
      roughness: 0.35,
      metalness: 0.45,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, 0);
    group.add(mesh);
    stationMeshes.push(mesh);

    const label = createLabel(STAGE_NAMES[i]);
    label.position.set(0, 0.7, 0);
    mesh.add(label);
  }

  const curve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.5);
  const tubeGeo = new THREE.TubeGeometry(curve, 150, 0.05, 10, false);
  const tubeMat = new THREE.MeshStandardMaterial({
    color: palette.primaryHex,
    emissive: palette.primaryHex,
    emissiveIntensity: 0.3,
    transparent: true,
    opacity: 0.5,
  });
  const tube = new THREE.Mesh(tubeGeo, tubeMat);
  group.add(tube);

  const flow = flowParticlesAlongCurve(THREE, curve, 45, palette.particleHex, glowTexture);
  group.add(flow);

  return {
    group,
    update(elapsed, delta) {
      flow.userData.update(delta);
      stationMeshes.forEach((mesh, i) => {
        mesh.rotation.y += delta * (0.4 + i * 0.15);
        mesh.position.y = Math.sin(elapsed * 1.2 + i) * 0.15 + Math.sin(i * 1.1) * 0.25;
      });
      group.rotation.y = Math.sin(elapsed * 0.15) * 0.15;
    },
  };
}
