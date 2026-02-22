import chalk from "chalk";
import { execSync } from "child_process";
import path from "path";

export function showBanner() {
  console.log(chalk.cyan(`
███╗   ██╗██╗██╗██╗██╗   ██╗
████╗  ██║██║██║██║██║   ██║
██╔██╗ ██║██║██║██║██║   ██║
██║╚██╗██║██║██║██║╚██╗ ██╔╝
██║ ╚████║██║██║██║ ╚████╔╝ 
╚═╝  ╚═══╝╚═╝╚═╝╚═╝  ╚═══╝  

NIIV — The foundation for Node & Vite applications
`));
}

export function runInstall(dir) {
  execSync("npm install", { cwd: dir, stdio: "inherit" });
}

export function handleAutoInstall(projectPath, answers) {
  switch (answers.projectType) {
    case "Backend":
      runInstall(path.join(projectPath, "backend"));
      break;

    case "Frontend":
      runInstall(path.join(projectPath, "frontend"));
      break;

    case "Fullstack":
      if (
        answers.fullstackMode ===
        "Separate (Frontend + Backend)"
      ) {
        runInstall(path.join(projectPath, "backend"));
        runInstall(path.join(projectPath, "frontend"));
      } else {
        runInstall(projectPath);
        runInstall(path.join(projectPath, "frontend"));
      }
      break;
  }
}