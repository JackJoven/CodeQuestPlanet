import { createHash } from "node:crypto";
import { cp, mkdir, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import { dirname, extname, posix, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist");
const client = resolve(dist, "client");
const hashLength = 12;

const rootPublicFiles = [
  "index.html",
  "home.css",
  "home.js",
  "homepage-blueprint.png",
  "og.png",
  "student-home.html",
  "student-theme.css",
  "student-home.css",
  "student-home.js",
  "admin.html"
];

const binaryAssetExtensions = new Set([
  ".gif",
  ".ico",
  ".jpeg",
  ".jpg",
  ".png",
  ".svg",
  ".webp",
  ".woff",
  ".woff2"
]);
const codeAssetExtensions = new Set([".css", ".js"]);
const rewritableExtensions = new Set([".css", ".html", ".js"]);

function toPublicPath(file) {
  return relative(client, file).split(sep).join("/");
}

function toFilePath(publicPath) {
  return resolve(client, ...publicPath.split("/"));
}

function hashedPublicPath(publicPath, contents) {
  const extension = posix.extname(publicPath);
  const stem = publicPath.slice(0, -extension.length);
  const digest = createHash("sha256").update(contents).digest("hex").slice(0, hashLength);
  return `${stem}.${digest}${extension}`;
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

function splitUrl(value) {
  const match = value.match(/^([^?#]*)(\?[^#]*)?(#.*)?$/);
  return match
    ? { pathname: match[1], query: match[2] || "", hash: match[3] || "" }
    : { pathname: value, query: "", hash: "" };
}

function queryWithoutRelease(query) {
  if (!query) return "";
  const kept = query
    .slice(1)
    .split("&")
    .filter(Boolean)
    .filter((part) => part.split("=", 1)[0] !== "release");
  return kept.length ? `?${kept.join("&")}` : "";
}

function rewriteUrl(value, sourcePublicPath, assetMap) {
  if (
    !value ||
    value.startsWith("#") ||
    value.startsWith("//") ||
    /^(?:data|https?|mailto|tel|javascript):/i.test(value)
  ) {
    return value;
  }

  const { pathname, query, hash } = splitUrl(value);
  const sourceDirectory = posix.dirname(sourcePublicPath);
  const target = pathname.startsWith("/")
    ? posix.normalize(pathname.slice(1))
    : posix.normalize(posix.join(sourceDirectory, pathname));
  const hashedTarget = assetMap.get(target);

  if (!hashedTarget) return value;

  let rewrittenPath;
  if (pathname.startsWith("/")) {
    rewrittenPath = `/${hashedTarget}`;
  } else {
    rewrittenPath = posix.relative(sourceDirectory, hashedTarget);
    if (pathname.startsWith("./") && !rewrittenPath.startsWith(".")) {
      rewrittenPath = `./${rewrittenPath}`;
    }
  }

  return `${rewrittenPath}${queryWithoutRelease(query)}${hash}`;
}

function rewriteReferences(contents, sourcePublicPath, assetMap) {
  const quoted = contents.replace(/(["'])([^"'\n]+)\1/g, (match, quote, value) => {
    const rewritten = rewriteUrl(value, sourcePublicPath, assetMap);
    return `${quote}${rewritten}${quote}`;
  });

  return quoted.replace(/url\(\s*([^"')\s][^)]*?)\s*\)/g, (match, value) => {
    return `url(${rewriteUrl(value, sourcePublicPath, assetMap)})`;
  });
}

async function hashAssets(files, extensions) {
  const assetMap = new Map();

  for (const file of files) {
    const publicPath = toPublicPath(file);
    if (!extensions.has(extname(publicPath).toLowerCase())) continue;

    const contents = await readFile(file);
    const hashedPath = hashedPublicPath(publicPath, contents);
    await rename(file, toFilePath(hashedPath));
    assetMap.set(publicPath, hashedPath);
  }

  return assetMap;
}

async function rewriteFiles(files, assetMap, extensions = rewritableExtensions) {
  for (const file of files) {
    const publicPath = toPublicPath(file);
    if (!extensions.has(extname(publicPath).toLowerCase())) continue;

    const contents = await readFile(file, "utf8");
    const rewritten = rewriteReferences(contents, publicPath, assetMap);
    if (rewritten !== contents) await writeFile(file, rewritten);
  }
}

await rm(dist, { recursive: true, force: true });
await mkdir(resolve(dist, "server"), { recursive: true });
await mkdir(client, { recursive: true });

for (const file of rootPublicFiles) {
  await cp(resolve(root, file), resolve(client, file));
}

await cp(resolve(root, "signal-runner-node"), resolve(client, "signal-runner-node"), {
  recursive: true,
  filter(source) {
    const filename = source.split(sep).at(-1);
    const serverOnlyFiles = new Set(["README.md", "server.mjs"]);
    return !filename.startsWith(".") && !serverOnlyFiles.has(filename);
  }
});

let files = await listFiles(client);
const binaryAssetMap = await hashAssets(files, binaryAssetExtensions);

files = await listFiles(client);
await rewriteFiles(files, binaryAssetMap);

files = await listFiles(client);
const codeAssetMap = await hashAssets(files, codeAssetExtensions);

files = await listFiles(client);
await rewriteFiles(files, codeAssetMap, new Set([".html"]));

const assetManifest = Object.fromEntries(
  [...binaryAssetMap, ...codeAssetMap].sort(([left], [right]) => left.localeCompare(right))
);
await writeFile(
  resolve(client, "asset-manifest.json"),
  `${JSON.stringify(assetManifest, null, 2)}\n`
);

for (const file of await listFiles(client)) {
  if (!rewritableExtensions.has(extname(file).toLowerCase())) continue;
  const contents = await readFile(file, "utf8");
  if (contents.includes("?release=")) {
    throw new Error(`Manual release query remains in ${toPublicPath(file)}`);
  }
}

await writeFile(
  resolve(dist, "server/index.js"),
  `export default {\n  async fetch(request, env) {\n    return env.ASSETS.fetch(request);\n  }\n};\n`
);
