import { flowParticlesAlongCurve } from "../utils.js";

const STAGE_NAMES = ["Begin", "Rise", "Peak", "Decline", "Renew"];

export function build(THREE, ctx) {
  const { palette, glowTexture, createLabel } = ctx;
  const group = new THREE.Group();
  const stageCount = 5;
  const radius = 2.4;
  const points = [];

  const ringGroup = new THREE.Group();
  const stageMeshes = [];

  for (let i = 0; i < stageCount; i++) {
    const angle = (i / stageCount) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    points.push(new THREE.Vector3(x, Math.sin(angle * 2) * 0.3, z));

    const geo = new THREE.IcosahedronGeometry(0.32, 1);
    const mat = new THREE.MeshStandardMaterial({
      color: i === 0 ? palette.secondaryHex : palette.primaryHex,
      emissive: i === 0 ? palette.secondaryHex : palette.primaryHex,
      emissiveIntensity: 0.5,
      roughness: 0.3,
      metalness: 0.4,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, Math.sin(angle * 2) * 0.3, z);
    mesh.userData.phase = angle;
    ringGroup.add(mesh);
    stageMeshes.push(mesh);

    const label = createLabel(STAGE_NAMES[i]);
    label.position.set(0, 0.5, 0);
    mesh.add(label);
  }
  points.push(points[0].clone());

  const curve = new THREE.CatmullRomCurve3(points, true, "catmullrom", 0.6);
  const tubeGeo = new THREE.TubeGeometry(curve, 200, 0.045, 10, true);
  const tubeMat = new THREE.MeshStandardMaterial({
    color: palette.primaryHex,
    emissive: palette.primaryHex,
    emissiveIntensity: 0.35,
    transparent: true,
    opacity: 0.55,
    roughness: 0.4,
  });
  const tube = new THREE.Mesh(tubeGeo, tubeMat);
  ringGroup.add(tube);

  const flow = flowParticlesAlongCurve(THREE, curve, 60, palette.particleHex, glowTexture);
  ringGroup.add(flow);

  group.add(ringGroup);

  return {
    group,
    update(elapsed, delta) {
      ringGroup.rotation.y = elapsed * 0.12;
      flow.userData.update(delta);
      for (const mesh of stageMeshes) {
        const s = 1 + Math.sin(elapsed * 1.4 + mesh.userData.phase) * 0.12;
        mesh.scale.setScalar(s);
        mesh.rotation.y += delta * 0.6;
      }
    },
  };
}
