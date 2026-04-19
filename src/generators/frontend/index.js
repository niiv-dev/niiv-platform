import fs from "fs";
import path from "path";
import { createSimpleFrontend } from "./simple.js";
import { createViteReactFrontend } from "./react.js";

export function createFrontend(projectPath, options) {
  const frontendPath = path.join(projectPath, "frontend");
  fs.mkdirSync(frontendPath, { recursive: true });

  if (options.frontendType === "Simple (HTML, CSS, JS)") {
    createSimpleFrontend(frontendPath, options);
  } else {
    createViteReactFrontend(frontendPath, options);
  }
}