import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist");
const client = resolve(dist, "client");

await rm(dist, { recursive: true, force: true });
await mkdir(resolve(dist, "server"), { recursive: true });
await mkdir(client, { recursive: true });

for (const file of ["index.html", "home.css", "home.js", "homepage-blueprint.png", "og.png"]) {
  await cp(resolve(root, file), resolve(client, file));
}

for (const directory of ["signal-runner-node"]) {
  await cp(resolve(root, directory), resolve(client, directory), {
    recursive: true,
    filter(source) {
      const filename = source.split("/").at(-1);
      const serverOnlyFiles = new Set([
        "admin.html",
        "admin.js",
        "auth.js",
        "server.mjs",
        "README.md"
      ]);

      return !filename.startsWith(".") && !serverOnlyFiles.has(filename);
    }
  });
}

await writeFile(
  resolve(dist, "server/index.js"),
  `export default {\n  async fetch(request, env) {\n    return env.ASSETS.fetch(request);\n  }\n};\n`
);
