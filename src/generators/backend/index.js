import fs from "fs";
import path from "path";
import { createBasicBackend } from "./basic.js";
import { createStructuredBackend } from "./structured.js";

export function createBackend(projectPath, structure) {
  const backendPath = path.join(projectPath, "backend");
  fs.mkdirSync(backendPath, { recursive: true });

  if (structure === "Basic") {
    createBasicBackend(backendPath);
  } else {
    createStructuredBackend(backendPath);
  }
}