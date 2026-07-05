import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { CSS2DRenderer } from "three/addons/renderers/CSS2DRenderer.js";

import { classify, categoryMeta } from "./classifier.js";
import { getPalette, seededRandom } from "./palette.js";
import { createGlowTexture, disposeObject3D } from "./utils.js";
import { createLabel } from "./label.js";
import { SCENE_BUILDERS } from "./scenes/index.js";

const EXAMPLE_CONCEPTS = [
  "Neural Network", "Photosynthesis", "Blockchain", "Compound Interest",
  "The Water Cycle", "Black Hole", "Supply Chain", "Family Tree",
  "Sound Waves", "Balance of Power", "Cell Division", "The Internet",
];

const canvas = document.getElementById("scene");
const captionConcept = document.getElementById("caption-concept");
const captionCategory = document.getElementById("caption-category");
const captionDesc = document.getElementById("caption-desc");
const chipsEl = document.getElementById("chips");
const form = document.getElementById("concept-form");
const input = document.getElementById("concept-input");
const loadingEl = document.getElementById("loading");
const btnPause = document.getElementById("btn-pause");
const btnMotion = document.getElementById("btn-motion");
const btnShuffle = document.getElementById("btn-shuffle");
const btnSnapshot = document.getElementById("btn-snapshot");

let width = window.innerWidth;
let height = window.innerHeight;

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  preserveDrawingBuffer: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(width, height);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x05060a, 0.045);

const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
camera.position.set(0, 1.3, 7.2);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(width, height);
labelRenderer.domElement.id = "labels";
labelRenderer.domElement.style.position = "absolute";
labelRenderer.domElement.style.top = "0";
labelRenderer.domElement.style.left = "0";
labelRenderer.domElement.style.pointerEvents = "none";
document.getElementById("app").appendChild(labelRenderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.enablePan = false;
controls.minDistance = 3.5;
controls.maxDistance = 13;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.6;
controls.target.set(0, 0, 0);

// Lighting rig — reused across scenes, retinted per concept.
const ambient = new THREE.AmbientLight(0xffffff, 0.28);
const hemi = new THREE.HemisphereLight(0x8fbfff, 0x0a0a12, 0.4);
const keyLight = new THREE.DirectionalLight(0xffffff, 0.85);
keyLight.position.set(4, 5, 3);
const rimLight = new THREE.DirectionalLight(0xffffff, 0.4);
rimLight.position.set(-4, -2, -4);
scene.add(ambient, hemi, keyLight, rimLight);

// Starfield backdrop, built once.
scene.add(buildStarfield());

function buildStarfield() {
  const count = 1400;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 25 + Math.random() * 20;
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = Math.random() * Math.PI * 2;
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    size: 0.05,
    color: 0xaabbff,
    transparent: true,
    opacity: 0.5,
    sizeAttenuation: true,
  });
  return new THREE.Points(geo, mat);
}

const glowTexture = createGlowTexture(THREE);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 0.5, 0.4, 0.3);
composer.addPass(bloomPass);
composer.addPass(new OutputPass());

window.addEventListener("resize", onResize);
function onResize() {
  width = window.innerWidth;
  height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  labelRenderer.setSize(width, height);
  composer.setSize(width, height);
  bloomPass.setSize(width, height);
}

let currentScene = null;
let shuffleNonce = 0;
let paused = false;
let reducedMotion = false;
let sceneStartElapsed = 0;

function disposeCurrentScene() {
  if (!currentScene) return;
  currentScene.group.traverse((child) => {
    if (child.isCSS2DObject && child.element && child.element.parentNode) {
      child.element.parentNode.removeChild(child.element);
    }
  });
  scene.remove(currentScene.group);
  disposeObject3D(currentScene.group);
  currentScene = null;
}

function visualize(rawText) {
  const text = (rawText || "").trim();
  if (!text) return;

  loadingEl.classList.remove("hidden");

  requestAnimationFrame(() => {
    const { category, matched } = classify(text);
    const meta = categoryMeta(category);
    const seedKey = `${text.toLowerCase()}::${shuffleNonce}`;
    const palette = getPalette(seedKey, category);
    const rng = seededRandom(palette.seed);

    disposeCurrentScene();

    const builder = SCENE_BUILDERS[category] || SCENE_BUILDERS.abstract;
    const built = builder(THREE, { palette, rng, glowTexture, createLabel, concept: text });
    scene.add(built.group);
    currentScene = built;
    sceneStartElapsed = clock.getElapsedTime();

    scene.fog.color.setHex(new THREE.Color(palette.fogHex).getHex());
    hemi.color.setHex(new THREE.Color(palette.primaryHex).getHex());
    keyLight.color.setHex(new THREE.Color(palette.secondaryHex).getHex());
    rimLight.color.setHex(new THREE.Color(palette.tertiaryHex).getHex());

    captionConcept.textContent = text;
    captionCategory.textContent = meta.label;
    captionDesc.textContent = meta.description;
    document.title = `${text} — Concept Visualizer`;

    loadingEl.classList.add("hidden");
  });
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  shuffleNonce = 0;
  visualize(input.value);
});

chipsEl.innerHTML = "";
for (const example of EXAMPLE_CONCEPTS) {
  const chip = document.createElement("button");
  chip.type = "button";
  chip.className = "chip";
  chip.textContent = example;
  chip.addEventListener("click", () => {
    input.value = example;
    shuffleNonce = 0;
    visualize(example);
  });
  chipsEl.appendChild(chip);
}

btnPause.addEventListener("click", () => {
  paused = !paused;
  btnPause.classList.toggle("active", paused);
  btnPause.textContent = paused ? "▶" : "⏸";
});

btnMotion.addEventListener("click", () => {
  reducedMotion = !reducedMotion;
  btnMotion.classList.toggle("active", reducedMotion);
  controls.autoRotate = !reducedMotion;
});

btnShuffle.addEventListener("click", () => {
  if (!input.value.trim()) return;
  shuffleNonce += 1;
  visualize(input.value);
});

btnSnapshot.addEventListener("click", () => {
  composer.render();
  const url = renderer.domElement.toDataURL("image/png");
  const link = document.createElement("a");
  const name = (input.value.trim() || "concept").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  link.download = `${name}-visualization.png`;
  link.href = url;
  link.click();
});

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  const elapsed = clock.getElapsedTime();

  if (currentScene && !paused) {
    const effectiveDelta = reducedMotion ? delta * 0.12 : delta;
    currentScene.update(elapsed - sceneStartElapsed, effectiveDelta);
  }

  controls.update();
  composer.render();
  labelRenderer.render(scene, camera);
}

animate();

// Seed the page with a default concept so it never opens empty.
input.value = "Neural Network";
visualize("Neural Network");
