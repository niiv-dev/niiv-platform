import fs from "fs";
import path from "path";
import http from "http";
import { spawn } from "child_process";
import { createProject } from "./src/modes.js";

const ROOT = process.cwd();
const TEST_DIR = path.join(ROOT, "__engine_tests__");

// Ensure test directory exists
if (!fs.existsSync(TEST_DIR)) {
    fs.mkdirSync(TEST_DIR);
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function requestHealth(port = 5000) {
    return new Promise((resolve, reject) => {
        http
            .get(`http://localhost:${port}/api/health`, res => {
                if (res.statusCode === 200) {
                    resolve(true);
                } else {
                    reject(new Error("Health endpoint failed"));
                }
            })
            .on("error", reject);
    });
}

async function installIfExists(dir) {
    if (!fs.existsSync(dir)) return;

    await new Promise((resolve, reject) => {
        const proc = spawn("npm", ["install"], {
            cwd: dir,
            stdio: "ignore",
            shell: true
        });

        proc.on("close", code => {
            if (code === 0) resolve();
            else reject(new Error("npm install failed"));
        });
    });
}

async function startServerAndTest(dir) {
    const proc = spawn("node", ["server.js"], {
        cwd: dir,
        stdio: "ignore",
        shell: true
    });

    try {
        await wait(2000);
        await requestHealth();
        proc.kill();
    } catch (err) {
        proc.kill();
        throw err;
    }
}

async function test(name, answers, hasBackend) {
    console.log(`\n🔎 ${name}`);

    answers.projectName = `test_${Date.now()}`;

    const originalCwd = process.cwd();
    process.chdir(TEST_DIR);

    try {
        const projectPath = await createProject(answers);

        // Install dependencies
        if (fs.existsSync(path.join(projectPath, "backend"))) {
            await installIfExists(path.join(projectPath, "backend"));
        }

        if (fs.existsSync(path.join(projectPath, "frontend"))) {
            await installIfExists(path.join(projectPath, "frontend"));
        }

        if (fs.existsSync(path.join(projectPath, "server.js"))) {
            await installIfExists(projectPath);
        }

        // Backend validation
        if (hasBackend) {
            if (fs.existsSync(path.join(projectPath, "backend"))) {
                await startServerAndTest(path.join(projectPath, "backend"));
            } else {
                await startServerAndTest(projectPath);
            }
        }

        console.log("✅ PASS");
    } catch (err) {
        console.log("❌ FAIL");
        console.log("   ", err.message);
    } finally {
        process.chdir(originalCwd);
    }
}

/* ===============================
   TEST MATRIX
================================ */

(async () => {

    // Backend
    await test("Backend Basic", {
        projectType: "Backend",
        backendStructure: "Basic",
        autoInstall: true
    }, true);

    await test("Backend MVC", {
        projectType: "Backend",
        backendStructure: "Structured (MVC)",
        autoInstall: true
    }, true);

    // Frontend
    await test("Frontend React", {
        projectType: "Frontend",
        frontendType: "Vite + React",
        useRouter: false,
        useAxios: false,
        autoInstall: true
    }, false);

    await test("Frontend Simple", {
        projectType: "Frontend",
        frontendType: "Simple (HTML, CSS, JS)",
        autoInstall: false
    }, false);

    // Separate
    await test("Separate Basic + React", {
        projectType: "Fullstack",
        fullstackMode: "Separate (Frontend + Backend)",
        backendStructure: "Basic",
        frontendType: "Vite + React",
        useRouter: false,
        useAxios: false,
        autoInstall: true
    }, true);

    await test("Separate Basic + Simple", {
        projectType: "Fullstack",
        fullstackMode: "Separate (Frontend + Backend)",
        backendStructure: "Basic",
        frontendType: "Simple (HTML, CSS, JS)",
        autoInstall: true
    }, true);

    await test("Separate MVC + React", {
        projectType: "Fullstack",
        fullstackMode: "Separate (Frontend + Backend)",
        backendStructure: "Structured (MVC)",
        frontendType: "Vite + React",
        useRouter: false,
        useAxios: false,
        autoInstall: true
    }, true);

    await test("Separate MVC + Simple", {
        projectType: "Fullstack",
        fullstackMode: "Separate (Frontend + Backend)",
        backendStructure: "Structured (MVC)",
        frontendType: "Simple (HTML, CSS, JS)",
        autoInstall: true
    }, true);

    // Unified
    await test("Unified Basic + React", {
        projectType: "Fullstack",
        fullstackMode: "Unified (Single Deployable App)",
        backendStructure: "Basic",
        frontendType: "Vite + React",
        useRouter: false,
        useAxios: false,
        autoInstall: true
    }, true);

    await test("Unified Basic + Simple", {
        projectType: "Fullstack",
        fullstackMode: "Unified (Single Deployable App)",
        backendStructure: "Basic",
        frontendType: "Simple (HTML, CSS, JS)",
        autoInstall: true
    }, true);

    await test("Unified MVC + React", {
        projectType: "Fullstack",
        fullstackMode: "Unified (Single Deployable App)",
        backendStructure: "Structured (MVC)",
        frontendType: "Vite + React",
        useRouter: false,
        useAxios: false,
        autoInstall: true
    }, true);

    await test("Unified MVC + Simple", {
        projectType: "Fullstack",
        fullstackMode: "Unified (Single Deployable App)",
        backendStructure: "Structured (MVC)",
        frontendType: "Simple (HTML, CSS, JS)",
        autoInstall: true
    }, true);

    console.log("\n🎯 All engine tests completed.\n");

})();