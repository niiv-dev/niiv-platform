#!/usr/bin/env node

import { run } from "../src/modes.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJsonPath = path.join(__dirname, "../package.json");
const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

const args = process.argv.slice(2);

async function main() {
  if (args.length === 0) {
    showHelp();
    return;
  }

  const command = args[0];

  switch (command) {
    case "create":
      await run();
      break;

    case "--version":
    case "-v":
      console.log(pkg.version);
      break;

    case "--help":
    case "-h":
      showHelp();
      break;

    default:
      console.log(`Unknown command: ${command}\n`);
      showHelp();
  }
}

function showHelp() {
  console.log(`
NIIV CLI

Usage:
  niiv create       Create a new project
  niiv --version    Show CLI version
  niiv --help       Show help
`);
}

main();