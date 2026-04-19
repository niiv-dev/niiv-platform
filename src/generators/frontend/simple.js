import fs from "fs";
import path from "path";

export function createSimpleFrontend(frontendPath, options) {
  const hasBackend = options.projectType === "Fullstack";

  const htmlContent = hasBackend
    ? `
<!DOCTYPE html>
<html>
<head>
  <title>NIIV Simple App</title>
</head>
<body>
  <h1>Simple Fullstack App</h1>
  <script>
    fetch("/api/demo")
      .then(res => res.json())
      .then(data => {
        const pre = document.createElement("pre");
        pre.textContent = JSON.stringify(data, null, 2);
        document.body.appendChild(pre);
      });
  </script>
</body>
</html>
`
    : `
<!DOCTYPE html>
<html>
<head>
  <title>NIIV Simple Frontend</title>
</head>
<body>
  <h1>Welcome to NIIV Frontend</h1>
  <p>This is a standalone frontend project.</p>
</body>
</html>
`;

  fs.writeFileSync(
    path.join(frontendPath, "index.html"),
    htmlContent
  );
}