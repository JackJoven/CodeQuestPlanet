import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.argv[2] || 4173);
const types = {
  ".html": "text/html;charset=utf-8",
  ".css": "text/css;charset=utf-8",
  ".js": "text/javascript;charset=utf-8",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml"
};

http.createServer((req, res) => {
  let url;
  try { url = decodeURIComponent(req.url.split("?")[0]); }
  catch (_) { res.writeHead(400); res.end("Bad path"); return; }
  if (url === "/") {
    res.writeHead(302, { Location: `/signal-runner-node/${req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : ""}` });
    res.end(); return;
  }
  if (url.endsWith("/")) url += "index.html";

  const file = path.resolve(root, `.${url}`);
  const relative = path.relative(root, file);
  const publicRootFiles = new Set(["index.html", "home.css", "home.js", "student-theme.css", "student-home.html", "student-home.css", "student-home.js", "admin.html", "homepage-blueprint.png", "og.png"]);
  const publicCourseFile = relative.startsWith(`signal-runner-node${path.sep}`) && !relative.endsWith("server.mjs") && Boolean(types[path.extname(file)]);
  if (relative.startsWith("..") || relative.split(path.sep).some(part => part.startsWith(".")) || (!publicRootFiles.has(relative) && !publicCourseFile)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(file, (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    res.writeHead(200, {
      "Content-Type": types[path.extname(file)] || "application/octet-stream"
    });
    res.end(data);
  });
}).listen(port, "127.0.0.1", () => {
  console.log(`CodeQuestPlanet preview: http://127.0.0.1:${port}/signal-runner-node/?preview=1&lesson=course-19`);
});
