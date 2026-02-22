import inquirer from "inquirer";

export async function askProjectConfig() {
  const answers = {};

  // Project name
  const { projectName } = await inquirer.prompt([
    {
      type: "input",
      name: "projectName",
      message: "Project name:",
      validate: (input) =>
        input ? true : "Project name cannot be empty"
    }
  ]);

  answers.projectName = projectName;

  // Project type
  const { projectType } = await inquirer.prompt([
    {
      type: "list",
      name: "projectType",
      message: "Select project type:",
      choices: ["Frontend", "Backend", "Fullstack"]
    }
  ]);

  answers.projectType = projectType;

  // Fullstack mode
  if (projectType === "Fullstack") {
    const { fullstackMode } = await inquirer.prompt([
      {
        type: "list",
        name: "fullstackMode",
        message: "Select fullstack mode:",
        choices: [
          "Separate (Frontend + Backend)",
          "Unified (Single Deployable App)"
        ]
      }
    ]);

    answers.fullstackMode = fullstackMode;
  }

  // Backend structure
  if (projectType === "Backend" || projectType === "Fullstack") {
    const { backendStructure } = await inquirer.prompt([
      {
        type: "list",
        name: "backendStructure",
        message: "Select backend structure:",
        choices: ["Basic", "Structured (MVC)"]
      }
    ]);

    answers.backendStructure = backendStructure;
  }

  // Frontend options
  if (projectType === "Frontend" || projectType === "Fullstack") {
    const frontendChoices = await inquirer.prompt([
      {
        type: "list",
        name: "frontendType",
        message: "Frontend type:",
        choices: ["Vite + React", "Simple (HTML, CSS, JS)"]
      },
      {
        type: "confirm",
        name: "useRouter",
        message: "Add React Router?",
        default: false,
        when: (a) => a.frontendType === "Vite + React"
      },
      {
        type: "confirm",
        name: "useAxios",
        message: "Use Axios instead of fetch?",
        default: false,
        when: (a) => a.frontendType === "Vite + React"
      }
    ]);

    Object.assign(answers, frontendChoices);
  }

  // Auto install
  const { autoInstall } = await inquirer.prompt([
    {
      type: "confirm",
      name: "autoInstall",
      message: "Install dependencies automatically?",
      default: true
    }
  ]);

  answers.autoInstall = autoInstall;

  return answers;
}