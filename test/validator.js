import fs from "fs";
import path from "path";

export function validate(test) {
  const root = process.cwd();

  // check files
  if (test.expect.files) {
    test.expect.files.forEach((f) => {
      if (!fs.existsSync(path.join(root, f))) {
        throw `Missing file: ${f}`;
      }
    });
  }

  // check content
  if (test.expect.content) {
    test.expect.content.forEach(({ file, includes }) => {
      const full = path.join(root, file);
      const data = fs.readFileSync(full, "utf-8");

      includes.forEach((txt) => {
        if (!data.includes(txt)) {
          throw `Missing "${txt}" in ${file}`;
        }
      });
    });
  }

  if (test.expect.notFiles) {
    test.expect.notFiles.forEach((f) => {
      if (fs.existsSync(path.join(root, f))) {
        throw `File should NOT exist: ${f}`;
      }
    });
  }

  // check content NOT present
  if (test.expect.notContent) {
    test.expect.notContent.forEach(({ file, includes }) => {
      const data = fs.readFileSync(path.join(root, file), "utf-8");
      includes.forEach((txt) => {
        if (data.includes(txt)) {
          throw `Unexpected "${txt}" found in ${file}`;
        }
      });
    });
  }
}