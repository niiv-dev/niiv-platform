import path from "path";
import { injectMongo } from "./mongo.js";
import { injectPostgres } from "./postgres.js";
import { injectCrud } from "./crud.js";

export function handleDatabase(projectPath, answers) {
  if (!answers.database || answers.database === "None") return;

  const backendPath =
    answers.projectType === "Fullstack" &&
      answers.fullstackMode === "Unified (Single Deployable App)"
      ? projectPath
      : path.join(projectPath, "backend");

  switch (answers.database) {
    case "MongoDB":
      injectMongo(backendPath, answers.backendStructure);
      break;
    case "PostgreSQL":
      injectPostgres(backendPath, answers.backendStructure, answers);
      break;
  }

  if (
    answers.generateCrud &&
    answers.backendStructure === "Structured"
  ) {
    injectCrud(
      backendPath,
      answers.database,
      answers.backendStructure
    );
  }
}