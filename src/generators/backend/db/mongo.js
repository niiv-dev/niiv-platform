import fs from "fs";
import path from "path";

export function injectMongo(backendPath, structure) {
  const isStructured = structure === "Structured";
  const configPath = isStructured
    ? path.join(backendPath, "src", "config")
    : backendPath;

  if (!fs.existsSync(configPath)) {
    fs.mkdirSync(configPath, { recursive: true });
  }

  fs.writeFileSync(
    path.join(configPath, "db.js"),
    `
import mongoose from "mongoose";

export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
}
`
  );

  const pkgPath = path.join(backendPath, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  pkg.dependencies["mongoose"] = "^8.0.0";
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

  const serverPath = path.join(backendPath, "server.js");
  let serverCode = fs.readFileSync(serverPath, "utf-8");

  const importPath = isStructured
    ? "./src/config/db.js"
    : "./db.js";

  serverCode = serverCode.replace(
    "// NIIV_DB_HOOK",
    `
import { connectDB } from "${importPath}";
await connectDB();

`
  );

  fs.writeFileSync(serverPath, serverCode);

  fs.appendFileSync(
    path.join(backendPath, ".env"),
    "\nMONGO_URI=mongodb://localhost:27017/niiv_db\n"
  );
}