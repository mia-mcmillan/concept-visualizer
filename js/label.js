import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";

export function createLabel(text) {
  const div = document.createElement("div");
  div.className = "concept-label";
  div.textContent = text;
  return new CSS2DObject(div);
}
