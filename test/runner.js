import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { validate } from "./validator.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ FIXED filename
const configPath = path.join(__dirname, "test_config.json");

if (!fs.existsSync(configPath)) {
  console.error("❌ test_config.json not found at:", configPath);
  process.exit(1);
}

const tests = JSON.parse(fs.readFileSync(configPath, "utf-8"));

(async () => {
  console.log("🚀 Running tests...\n");

  const ROOT = process.cwd();
  const TEST_OUTPUT = path.join(ROOT, ".niiv-tests");

  function cleanup() {
    if (fs.existsSync(TEST_OUTPUT)) {
      fs.rmSync(TEST_OUTPUT, { recursive: true, force: true });
    }
  }

  let count = 0;

  for (const t of tests) {
    console.log(`TESTCASE ${++count}: ${t.name}`);

    try {
      process.chdir(ROOT);

      // clean previous run
      cleanup();

      // create fresh test output folder
      fs.mkdirSync(TEST_OUTPUT, { recursive: true });

      // run inside test output folder
      process.chdir(TEST_OUTPUT);

      execSync(`node ${path.join(ROOT, "bin/niiv.js")} create`, {
        env: {
          ...process.env,
          NIIV_TEST: JSON.stringify(t.input)
        },
        stdio: "pipe" // change to "inherit" if debugging
      });

      const projectPath = path.join(TEST_OUTPUT, t.input.projectName);

      if (!fs.existsSync(projectPath)) {
        throw `Project folder not created: ${projectPath}`;
      }

      process.chdir(projectPath);

      validate(t);

      console.log("✅ TESTCASE PASS\n");

    } catch (e) {
      console.log("❌ TESTCASE FAIL:", e, "\n");
    } finally {
      process.chdir(ROOT);
      cleanup();
    }
  }

  console.log("ALL TESTS COMPLETED");
})();