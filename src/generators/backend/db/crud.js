import fs from "fs";
import path from "path";

export function injectCrud(backendPath, database, structure) {
  const isStructured = structure === "Structured";
  if (!isStructured) return;

  const modelPath = path.join(backendPath, "src", "models");
  const controllerPath = path.join(backendPath, "src", "controllers");
  const routePath = path.join(backendPath, "src", "routes");

  // =========================
  // ✅ MONGODB CRUD
  // =========================
  if (database === "MongoDB") {
    fs.writeFileSync(
      path.join(modelPath, "item.model.js"),
      `
import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  name: String,
  price: Number,
});

export default mongoose.model("Item", itemSchema);
`
    );

    fs.writeFileSync(
      path.join(controllerPath, "item.controller.js"),
      `
import Item from "../models/item.model.js";

export async function createItem(req, res) {
  const item = await Item.create(req.body);
  res.json(item);
}

export async function getItems(req, res) {
  const items = await Item.find();
  res.json(items);
}

export async function updateItem(req, res) {
  const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(item);
}

export async function deleteItem(req, res) {
  await Item.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
}
`
    );
  }

  // =========================
  // ✅ POSTGRES FULL CRUD (FIXED)
  // =========================
  else if (database === "PostgreSQL") {
    fs.writeFileSync(
      path.join(modelPath, "item.model.js"),
      `
import { pool } from "../config/db.js";

export async function getAllItems() {
  const result = await pool.query("SELECT * FROM items");
  return result.rows;
}

export async function createItem(data) {
  const { name, price } = data;

  const result = await pool.query(
    "INSERT INTO items (name, price) VALUES ($1, $2) RETURNING *",
    [name, price]
  );

  return result.rows[0];
}

export async function updateItem(id, data) {
  const { name, price } = data;

  const result = await pool.query(
    "UPDATE items SET name=$1, price=$2 WHERE id=$3 RETURNING *",
    [name, price, id]
  );

  return result.rows[0];
}

export async function deleteItem(id) {
  await pool.query("DELETE FROM items WHERE id=$1", [id]);
}
`
    );

    fs.writeFileSync(
      path.join(controllerPath, "item.controller.js"),
      `
import * as Item from "../models/item.model.js";

export async function getItems(req, res) {
  const data = await Item.getAllItems();
  res.json(data);
}

export async function createItem(req, res) {
  const item = await Item.createItem(req.body);
  res.json(item);
}

export async function updateItem(req, res) {
  const { id } = req.params;
  const item = await Item.updateItem(id, req.body);
  res.json(item);
}

export async function deleteItem(req, res) {
  const { id } = req.params;
  await Item.deleteItem(id);
  res.json({ message: "Deleted" });
}
`
    );
  }

  // =========================
  // ✅ ROUTES (COMMON)
  // =========================
  fs.writeFileSync(
    path.join(routePath, "item.route.js"),
    `
import express from "express";
import { createItem, getItems, updateItem, deleteItem } from "../controllers/item.controller.js";

const router = express.Router();

router.post("/", createItem);
router.get("/", getItems);
router.put("/:id", updateItem);
router.delete("/:id", deleteItem);

export default router;
`
  );

  // =========================
  // ✅ REGISTER ROUTE (FIXED)
  // =========================
  const serverPath = path.join(backendPath, "server.js");
  let serverCode = fs.readFileSync(serverPath, "utf-8");

  if (!serverCode.includes("itemRoute")) {
    // ✅ add import at top (safe for ESM)
    serverCode =
      `import itemRoute from "./src/routes/item.route.js";\n` + serverCode;

    // ✅ add route usage
    serverCode = serverCode.replace(
      'app.use("/api", demoRoute);',
      `
app.use("/api", demoRoute);
app.use("/api/items", itemRoute);
`
    );

    fs.writeFileSync(serverPath, serverCode);
  }
}