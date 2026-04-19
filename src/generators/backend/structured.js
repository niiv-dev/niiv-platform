import fs from "fs";
import path from "path";

export function createStructuredBackend(basePath) {
  // Folder structure
  fs.mkdirSync(path.join(basePath, "src"), { recursive: true });
  fs.mkdirSync(path.join(basePath, "src", "models"), { recursive: true });
  fs.mkdirSync(path.join(basePath, "src", "controllers"), { recursive: true });
  fs.mkdirSync(path.join(basePath, "src", "routes"), { recursive: true });
  fs.mkdirSync(path.join(basePath, "src", "middlewares"), { recursive: true });
  fs.mkdirSync(path.join(basePath, "src", "config"), { recursive: true });

  const packageJson = {
    name: "backend",
    version: "1.0.0",
    type: "module",
    scripts: {
      start: "node server.js"
    },
    dependencies: {
      express: "^4.18.2",
      cors: "^2.8.5",
      dotenv: "^16.0.0"
    }
  };

  fs.writeFileSync(
    path.join(basePath, "package.json"),
    JSON.stringify(packageJson, null, 2)
  );

  fs.writeFileSync(
    path.join(basePath, ".env"),
    "PORT=5000\n"
  );

  /* CONFIG */

  const configCode = `
export const APP_NAME = "NIIV Application";
`;

  fs.writeFileSync(
    path.join(basePath, "src", "config", "app.config.js"),
    configCode
  );

  /* LOGGER MIDDLEWARE */

  const loggerCode = `
export function requestLogger(req, res, next) {
  console.log(\`[NIIV] \${req.method} \${req.url}\`);
  next();
}
`;

  fs.writeFileSync(
    path.join(basePath, "src", "middlewares", "logger.middleware.js"),
    loggerCode
  );

  /* MODEL */

  const modelCode = `
// Replace with Mongoose schema or SQL ORM model later

export class DemoModel {
  static getData() {
    return {
      message: "Hello from Structured backend 🚀",
      timestamp: new Date()
    };
  }
}
`;

  fs.writeFileSync(
    path.join(basePath, "src", "models", "demo.model.js"),
    modelCode
  );

  /* CONTROLLER */

  const controllerCode = `
import { DemoModel } from "../models/demo.model.js";

export function getDemo(req, res) {
  const data = DemoModel.getData();
  res.json(data);
}
`;

  fs.writeFileSync(
    path.join(basePath, "src", "controllers", "demo.controller.js"),
    controllerCode
  );

  /* ROUTE */

  const routeCode = `
import express from "express";
import { getDemo } from "../controllers/demo.controller.js";

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

router.get("/demo", getDemo);

export default router;
`;

  fs.writeFileSync(
    path.join(basePath, "src", "routes", "demo.route.js"),
    routeCode
  );

  /* SERVER */

  const serverCode = `
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import demoRoute from "./src/routes/demo.route.js";
import { requestLogger } from "./src/middlewares/logger.middleware.js";
import { APP_NAME } from "./src/config/app.config.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// NIIV_DB_HOOK

app.use(requestLogger);

console.log("Starting:", APP_NAME);

app.use("/api", demoRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on http://localhost:" + PORT);
});
`;

  fs.writeFileSync(
    path.join(basePath, "server.js"),
    serverCode
  );
}