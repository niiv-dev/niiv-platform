import fs from "fs";
import path from "path";

export function createViteReactFrontend(frontendPath, options) {
  const enableCrudUI =
    options.projectType === "Fullstack" &&
    options.database !== "None" &&
    options.generateCrud;

  const { useRouter, useAxios, projectType } = options;
  const hasBackend = projectType === "Fullstack";

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

  const viteConfig = `
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false
      }
    }
  }
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
  fs.mkdirSync(srcPath, { recursive: true });
  fs.mkdirSync(path.join(srcPath, "pages"), { recursive: true });
  fs.mkdirSync(path.join(srcPath, "components"), { recursive: true });

  if (hasBackend) {
    fs.mkdirSync(path.join(srcPath, "api"), { recursive: true });
  }

  /* ---------- API ---------- */

  if (hasBackend) {
    let apiCode;

    if (useAxios) {
      apiCode = enableCrudUI
        ? `
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

export async function fetchItems() {
  const res = await axios.get(API_BASE + "/items");
  return res.data;
}

export async function createItem(data) {
  const res = await axios.post(API_BASE + "/items", data);
  return res.data;
}

export async function updateItem(id, data) {
  const res = await axios.put(API_BASE + "/items/" + id, data);
  return res.data;
}

export async function deleteItem(id) {
  await axios.delete(API_BASE + "/items/" + id);
}
`
        : `
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

export async function fetchDemo() {
  const res = await axios.get(API_BASE + "/demo");
  return res.data;
}
`;
    } else {
      apiCode = enableCrudUI
        ? `
const API_BASE = import.meta.env.VITE_API_BASE || "/api";

export async function fetchItems() {
  const res = await fetch(API_BASE + "/items");
  return res.json();
}

export async function createItem(data) {
  const res = await fetch(API_BASE + "/items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateItem(id, data) {
  const res = await fetch(API_BASE + "/items/" + id, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteItem(id) {
  await fetch(API_BASE + "/items/" + id, {
    method: "DELETE"
  });
}
`
        : `
const API_BASE = import.meta.env.VITE_API_BASE || "/api";

export async function fetchDemo() {
  const res = await fetch(API_BASE + "/demo");
  return res.json();
}
`;
    }

    fs.writeFileSync(path.join(srcPath, "api", "api.js"), apiCode);
  }

  /* ---------- COMPONENT ---------- */

  const componentCode = hasBackend
    ? `
export default function DemoComponent({ data }) {
  if (!data) return <p>Loading...</p>;
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

  /* ---------- PAGE ---------- */

  let pageCode;

  if (enableCrudUI) {
    pageCode = `
import { useEffect, useState } from "react";
import { fetchItems, createItem, updateItem, deleteItem } from "../api/api.js";

export default function DemoPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: "", price: "" });
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    const data = await fetchItems();
    setItems(data);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) return;

    if (editingId) {
      await updateItem(editingId, form);
      setEditingId(null);
    } else {
      await createItem(form);
    }

    setForm({ name: "", price: "" });
    loadItems();
  };

  const handleEdit = (item) => {
    setForm({
      name: item.name,
      price: item.price
    });
    setEditingId(item._id || item.id);
  };

  const handleDelete = async (id) => {
    await deleteItem(id);
    loadItems();
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>CRUD Dashboard</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />
        <button type="submit">
          {editingId ? "Update" : "Add"}
        </button>

        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm({ name: "", price: "" });
            }}
            style={{ marginLeft: "10px" }}
          >
            Cancel
          </button>
        )}
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          gap: "10px"
        }}>
          {items.map((item) => (
            <div
              key={item._id || item.id}
              style={{
                border: "1px solid #ddd",
                padding: "10px",
                borderRadius: "10px"
              }}
            >
              <h4>{item.name}</h4>
              <p>₹ {item.price}</p>

              <button onClick={() => handleEdit(item)}>
                Edit
              </button>

              <button
                onClick={() => handleDelete(item._id || item.id)}
                style={{ marginLeft: "5px" }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
`;
  } else {
    pageCode = `
import { useEffect, useState } from "react";
import { fetchDemo } from "../api/api.js";
import DemoComponent from "../components/DemoComponent.jsx";

export default function DemoPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchDemo().then(setData);
  }, []);

  return <DemoComponent data={data} />;
}
`;
  }

  fs.writeFileSync(path.join(srcPath, "pages", "DemoPage.jsx"), pageCode);

  /* ---------- APP ---------- */

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

  fs.writeFileSync(path.join(srcPath, "App.jsx"), appContent);

  /* ---------- MAIN ---------- */

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