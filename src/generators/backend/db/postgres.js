import fs from "fs";
import path from "path";

export function injectPostgres(backendPath, structure, answers) {
  const isStructured = structure === "Structured";
  const configPath = isStructured
    ? path.join(backendPath, "src", "config")
    : backendPath;

  // create config folder
  if (!fs.existsSync(configPath)) {
    fs.mkdirSync(configPath, { recursive: true });
  }

fs.writeFileSync(
  path.join(configPath, "db.js"),
  `
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import pkg from "pg";
const { Pool } = pkg;

export const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: String(process.env.DB_PASSWORD),
  port: Number(process.env.DB_PORT),
});
`
);

fs.writeFileSync(
  path.join(backendPath, ".env"),
  `DB_USER=${answers.dbUser}
DB_PASSWORD=${answers.dbPassword}
DB_HOST=${answers.dbHost}
DB_NAME=${answers.dbName}
DB_PORT=${answers.dbPort}
`
);

  // update server.js
  const serverPath = path.join(backendPath, "server.js");
  let serverCode = fs.readFileSync(serverPath, "utf-8");

  const importPath = isStructured ? "./src/config/db.js" : "./db.js";

  serverCode = serverCode.replace(
    "// NIIV_DB_HOOK",
    `
import { pool } from "${importPath}";

(async () => {
  try {
    await pool.query(\`
      CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        price INT
      )
    \`);

    console.log("✅ PostgreSQL connected & table ready");
  } catch (err) {
    console.error("❌ Postgres Error:", err);
  }
})();

`
  );

  fs.writeFileSync(serverPath, serverCode);

  // add dependency
  const pkgPath = path.join(backendPath, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  pkg.dependencies["pg"] = "^8.11.0";
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
}