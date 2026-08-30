import { access, readFile, readdir } from "node:fs/promises";
import { dirname, extname, posix, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const client = resolve(root, "dist/client");
const manifestPath = resolve(client, "asset-manifest.json");
const hashedAssetPattern = /\.[0-9a-f]{12}\.(?:css|gif|ico|jpeg|jpg|js|png|svg|webp|woff|woff2)$/;
const localAssetExtensions = new Set([
  ".css",
  ".gif",
  ".html",
  ".ico",
  ".jpeg",
  ".jpg",
  ".js",
  ".png",
  ".svg",
  ".webp",
  ".woff",
  ".woff2"
]);
const textExtensions = new Set([".css", ".html", ".js"]);

function toPublicPath(file) {
  return relative(client, file).split(sep).join("/");
}

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const file = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(file));
    if (entry.isFile()) files.push(file);
  }

  return files;
}

function isExternal(value) {
  return (
    !value ||
    value.startsWith("#") ||
    value.startsWith("//") ||
    /^(?:data|https?|mailto|tel|javascript):/i.test(value)
  );
}

function localTarget(value, sourcePublicPath) {
  if (isExternal(value)) return null;
  const pathname = value.split(/[?#]/, 1)[0];
  if (!localAssetExtensions.has(posix.extname(pathname).toLowerCase())) return null;
  return pathname.startsWith("/")
    ? posix.normalize(pathname.slice(1))
    : posix.normalize(posix.join(posix.dirname(sourcePublicPath), pathname));
}

function referencedUrls(contents) {
  const urls = [];
  for (const match of contents.matchAll(/(["'])([^"'\n]+)\1/g)) urls.push(match[2]);
  for (const match of contents.matchAll(/url\(\s*([^"')\s][^)]*?)\s*\)/g)) urls.push(match[1]);
  return urls;
}

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

for (const [source, hashed] of Object.entries(manifest)) {
  if (!hashedAssetPattern.test(hashed)) {
    throw new Error(`Asset lacks a content hash: ${source} -> ${hashed}`);
  }
  await access(resolve(client, ...hashed.split("/")));
}

for (const required of [
  "student-home.css",
  "student-home.js",
  "student-theme.css",
  "signal-runner-node/app.js",
  "signal-runner-node/auth.js",
  "signal-runner-node/course-data.js",
  "signal-runner-node/styles.css"
]) {
  if (!manifest[required]) throw new Error(`Required asset missing from manifest: ${required}`);
}

for (const file of await listFiles(client)) {
  if (!textExtensions.has(extname(file).toLowerCase())) continue;

  const publicPath = toPublicPath(file);
  const contents = await readFile(file, "utf8");
  if (contents.includes("?release=")) {
    throw new Error(`Manual release query remains in ${publicPath}`);
  }

  for (const value of referencedUrls(contents)) {
    const target = localTarget(value, publicPath);
    if (!target) continue;
    await access(resolve(client, ...target.split("/"))).catch(() => {
      throw new Error(`Broken local reference in ${publicPath}: ${value}`);
    });
  }
}

console.log(`Verified ${Object.keys(manifest).length} content-hashed assets.`);
