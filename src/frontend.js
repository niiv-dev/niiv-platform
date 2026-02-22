import fs from "fs";
import path from "path";

export function createFrontend(projectPath, options) {
  const frontendPath = path.join(projectPath, "frontend");
  fs.mkdirSync(frontendPath, { recursive: true });

  if (options.frontendType === "Simple (HTML, CSS, JS)") {
    createSimpleFrontend(frontendPath, options);
    return;
  }

  createViteReactFrontend(frontendPath, options);
}

/* =========================
   SIMPLE FRONTEND
========================= */

function createSimpleFrontend(frontendPath, options) {
  const hasBackend = options.projectType === "Fullstack";

  const htmlContent = hasBackend
    ? `
<!DOCTYPE html>
<html>
<head>
  <title>NIIV Simple App</title>
</head>
<body>
  <h1>Simple Fullstack App</h1>
  <script>
    fetch("/api/demo")
      .then(res => res.json())
      .then(data => {
        const pre = document.createElement("pre");
        pre.textContent = JSON.stringify(data, null, 2);
        document.body.appendChild(pre);
      });
  </script>
</body>
</html>
`
    : `
<!DOCTYPE html>
<html>
<head>
  <title>NIIV Simple Frontend</title>
</head>
<body>
  <h1>Welcome to NIIV Frontend</h1>
  <p>This is a standalone frontend project.</p>
</body>
</html>
`;

  fs.writeFileSync(
    path.join(frontendPath, "index.html"),
    htmlContent
  );
}

/* =========================
   VITE + REACT FRONTEND
========================= */

function createViteReactFrontend(frontendPath, options) {
  const { useRouter, useAxios, projectType, fullstackMode } = options;

  const hasBackend = projectType === "Fullstack";

  const isSeparate =
    projectType === "Fullstack" &&
    fullstackMode === "Separate (Frontend + Backend)";

  const isUnified =
    projectType === "Fullstack" &&
    fullstackMode === "Unified (Single Deployable App)";

  /* ---------- package.json ---------- */

  const dependencies = {
    react: "^18.2.0",
    "react-dom": "^18.2.0"
  };

  if (useRouter) dependencies["react-router-dom"] = "^6.22.3";
  if (useAxios) dependencies["axios"] = "^1.6.8";

  const packageJson = {
    name: "frontend",
    private: true,
    version: "1.0.0",
    type: "module",
    scripts: {
      dev: "vite",
      build: "vite build",
      preview: "vite preview"
    },
    dependencies,
    devDependencies: {
      vite: "^5.0.0",
      "@vitejs/plugin-react": "^4.2.0"
    }
  };

  fs.writeFileSync(
    path.join(frontendPath, "package.json"),
    JSON.stringify(packageJson, null, 2)
  );

  /* ---------- env ---------- */

  fs.writeFileSync(
    path.join(frontendPath, ".env"),
    hasBackend ? "VITE_API_BASE=/api\n" : ""
  );

  /* ---------- vite.config.js ---------- */

  let proxyConfig = "";

  if (hasBackend && (isSeparate || isUnified)) {
    proxyConfig = `
    server: {
      proxy: {
        "/api": {
          target: "http://localhost:5000",
          changeOrigin: true,
          secure: false
        }
      }
    },`;
  }

  const viteConfig = `
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],${proxyConfig}
});
`;

  fs.writeFileSync(
    path.join(frontendPath, "vite.config.js"),
    viteConfig
  );

  /* ---------- index.html ---------- */

  fs.writeFileSync(
    path.join(frontendPath, "index.html"),
    `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>NIIV App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`
  );

  /* ---------- src structure ---------- */

  const srcPath = path.join(frontendPath, "src");
  fs.mkdirSync(srcPath);
  fs.mkdirSync(path.join(srcPath, "pages"));
  fs.mkdirSync(path.join(srcPath, "components"));

  if (hasBackend) {
    fs.mkdirSync(path.join(srcPath, "api"));
  }

  /* ---------- API ---------- */

  if (hasBackend) {
    const apiCode = useAxios
      ? `
import axios from "axios";
const API_BASE = import.meta.env.VITE_API_BASE;

export async function fetchDemo() {
  const res = await axios.get(API_BASE + "/demo");
  return res.data;
}
`
      : `
const API_BASE = import.meta.env.VITE_API_BASE;

export async function fetchDemo() {
  const res = await fetch(API_BASE + "/demo");
  return res.json();
}
`;

    fs.writeFileSync(
      path.join(srcPath, "api", "api.js"),
      apiCode
    );
  }

  /* ---------- component ---------- */

  const componentCode = hasBackend
    ? `
export default function DemoComponent({ data }) {
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
`
    : `
export default function DemoComponent() {
  return <h2>Frontend Only Project</h2>;
}
`;

  fs.writeFileSync(
    path.join(srcPath, "components", "DemoComponent.jsx"),
    componentCode
  );

  /* ---------- page ---------- */

  const pageCode = hasBackend
    ? `
import { useEffect, useState } from "react";
import { fetchDemo } from "../api/api.js";
import DemoComponent from "../components/DemoComponent.jsx";

export default function DemoPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchDemo().then(setData);
  }, []);

  if (!data) return <p>Loading...</p>;
  return <DemoComponent data={data} />;
}
`
    : `
import DemoComponent from "../components/DemoComponent.jsx";

export default function DemoPage() {
  return <DemoComponent />;
}
`;

  fs.writeFileSync(
    path.join(srcPath, "pages", "DemoPage.jsx"),
    pageCode
  );

  /* ---------- App ---------- */

  const appContent = useRouter
    ? `
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DemoPage from "./pages/DemoPage.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DemoPage />} />
      </Routes>
    </BrowserRouter>
  );
}
`
    : `
import DemoPage from "./pages/DemoPage.jsx";

export default function App() {
  return <DemoPage />;
}
`;

  fs.writeFileSync(
    path.join(srcPath, "App.jsx"),
    appContent
  );

  /* ---------- main ---------- */

  fs.writeFileSync(
    path.join(srcPath, "main.jsx"),
    `
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`
  );
}