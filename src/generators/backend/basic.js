import fs from "fs";
import path from "path";

export function createBasicBackend(basePath) {
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

  const serverCode = `
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// NIIV_DB_HOOK

app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

app.get("/api/demo", (req, res) => {
  res.json({ message: "Hello from Basic backend 🚀" });
});

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