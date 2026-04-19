import fs from "fs";
import path from "path";
import { createBackend } from "../generators/backend/index.js";
import { createFrontend } from "../generators/frontend/index.js";
import { showBanner, handleAutoInstall } from "../utils/temp-utils.js";
import { askProjectConfig } from "../prompts/index.js";
import { handleDatabase } from "../generators/backend/db/index.js";
export async function createProject(answers) {
  const projectPath = path.join(process.cwd(), answers.projectName);

  if (fs.existsSync(projectPath)) {
    throw new Error("Folder already exists");
  }

  fs.mkdirSync(projectPath, { recursive: true });

  switch (answers.projectType) {
    case "Backend":
      createBackend(projectPath, answers.backendStructure);
      break;

    case "Frontend":
      createFrontend(projectPath, answers);
      break;

    case "Fullstack":
      if (
        answers.fullstackMode ===
        "Separate (Frontend + Backend)"
      ) {
        createSeparateApp(projectPath, answers);
      } else {
        createUnifiedApp(projectPath, answers);
      }
      break;
  }

  // 🔥 DATABASE INJECTION HERE
  if (
    answers.projectType === "Backend" ||
    answers.projectType === "Fullstack"
  ) {
    handleDatabase(projectPath, answers);
  }

  if (answers.autoInstall) {
    handleAutoInstall(projectPath, answers);
  }

  return projectPath;
}
/* ========================================
   CLI ENTRY (INTERACTIVE)
======================================== */

export async function run() {
  showBanner();

  let answers;

if (process.env.NIIV_TEST) {
  answers = JSON.parse(process.env.NIIV_TEST);
} else {
  answers = await askProjectConfig();
}

  try {
    await createProject(answers);
    console.log("\n✅ Project created successfully!\n");
  } catch (err) {
    console.log("❌", err.message);
    process.exit(1);
  }
}

/* ========================================
   SEPARATE MODE
======================================== */

function createSeparateApp(projectPath, answers) {
  createBackend(projectPath, answers.backendStructure);
  createFrontend(projectPath, answers);

  if (answers.frontendType === "Simple (HTML, CSS, JS)") {
    const serverPath = path.join(
      projectPath,
      "backend",
      "server.js"
    );

    let serverCode = fs.readFileSync(serverPath, "utf-8");

    serverCode = serverCode.replace(
      "app.listen",
      `
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "../frontend")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.listen`
    );

    fs.writeFileSync(serverPath, serverCode);
  }
}

/* ========================================
   UNIFIED MODE
======================================== */

function createUnifiedApp(projectPath, answers) {
  createBackend(projectPath, answers.backendStructure);

  const backendPath = path.join(projectPath, "backend");

  fs.readdirSync(backendPath).forEach(file => {
    fs.renameSync(
      path.join(backendPath, file),
      path.join(projectPath, file)
    );
  });

  fs.rmSync(backendPath, { recursive: true, force: true });

  createFrontend(projectPath, answers);

  if (answers.frontendType === "Simple (HTML, CSS, JS)") {
    patchUnifiedSimple(projectPath);
    createUnifiedRootPackage(projectPath, false);
  } else {
    patchUnifiedReact(projectPath);
    createUnifiedRootPackage(projectPath, true);
  }
}

/* ========================================
   PATCHES
======================================== */

function patchUnifiedSimple(projectPath) {
  const serverPath = path.join(projectPath, "server.js");
  let serverCode = fs.readFileSync(serverPath, "utf-8");

  serverCode = serverCode.replace(
    "app.listen",
    `
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "frontend")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/index.html"));
});

app.listen`
  );

  fs.writeFileSync(serverPath, serverCode);
}

function patchUnifiedReact(projectPath) {
  const serverPath = path.join(projectPath, "server.js");
  let serverCode = fs.readFileSync(serverPath, "utf-8");

  serverCode += `

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "frontend", "dist")));

  app.get("*", (req, res) => {
    res.sendFile(
      path.join(__dirname, "frontend", "dist", "index.html")
    );
  });
}
`;

  fs.writeFileSync(serverPath, serverCode);
}

/* ========================================
   ROOT PACKAGE
======================================== */

function createUnifiedRootPackage(projectPath, isReact) {
  const pkg = {
    name: "niiv-unified-app",
    private: true,
    type: "module",
    scripts: isReact
      ? {
          "dev:backend": "node server.js",
          "dev:frontend": "npm run dev --prefix frontend",
          dev: "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
          build: "npm run build --prefix frontend",
          start: "node server.js"
        }
      : {
          start: "node server.js"
        },
    dependencies: {
      express: "^4.18.2",
      cors: "^2.8.5",
      dotenv: "^16.0.0"
    },
    devDependencies: isReact
      ? { concurrently: "^8.2.2" }
      : {}
  };

  fs.writeFileSync(
    path.join(projectPath, "package.json"),
    JSON.stringify(pkg, null, 2)
  );
}