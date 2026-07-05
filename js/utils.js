// Shared rendering helpers used across all scene metaphors.

export function createGlowTexture(THREE) {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(
    size / 2, size / 2, 0,
    size / 2, size / 2, size / 2
  );
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.35, "rgba(255,255,255,0.55)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

export function makeGlowSprite(THREE, glowTexture, colorHex, scale = 1) {
  const material = new THREE.SpriteMaterial({
    map: glowTexture,
    color: colorHex,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(scale, scale, 1);
  return sprite;
}

export function makePointCloud(THREE, count, colorHex, glowTexture, spread = 1) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() * 2 - 1) * spread;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    size: 0.05,
    map: glowTexture,
    color: colorHex,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });
  return new THREE.Points(geometry, material);
}

// Cheap deterministic "noise" — sum of offset sines. Good enough for organic
// drift without pulling in a full simplex-noise dependency.
export function noise3(x, y, z) {
  return (
    Math.sin(x * 1.7 + z * 0.9) * 0.4 +
    Math.sin(y * 2.3 + x * 0.5 + 1.3) * 0.35 +
    Math.sin(z * 1.1 + y * 1.9 + 2.7) * 0.25
  );
}

export function makeTube(THREE, points, colorHex, radius = 0.05, opacity = 0.9) {
  const curve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.5);
  const geometry = new THREE.TubeGeometry(curve, 128, radius, 12, false);
  const material = new THREE.MeshStandardMaterial({
    color: colorHex,
    emissive: colorHex,
    emissiveIntensity: 0.6,
    transparent: true,
    opacity,
    roughness: 0.35,
    metalness: 0.2,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.userData.curve = curve;
  return mesh;
}

export function flowParticlesAlongCurve(THREE, curve, count, colorHex, glowTexture, spanFraction = 1) {
  const group = new THREE.Group();
  const sprites = [];
  for (let i = 0; i < count; i++) {
    const sprite = makeGlowSprite(THREE, glowTexture, colorHex, 0.12 + Math.random() * 0.06);
    sprite.userData.t = (i / count) * spanFraction;
    sprite.userData.speed = 0.05 + Math.random() * 0.03;
    group.add(sprite);
    sprites.push(sprite);
  }
  group.userData.update = (delta) => {
    for (const sprite of sprites) {
      sprite.userData.t = (sprite.userData.t + sprite.userData.speed * delta) % 1;
      const p = curve.getPointAt(Math.min(sprite.userData.t, 0.9999));
      sprite.position.copy(p);
    }
  };
  return group;
}

export function disposeObject3D(obj) {
  obj.traverse((child) => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      for (const m of materials) {
        if (m.map) m.map.dispose();
        m.dispose();
      }
    }
  });
}
