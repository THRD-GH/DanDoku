// Produces the static GitHub Pages snapshot in static-site/.
//
// vinext renders the page from a running server, so this script starts the
// production server itself, snapshots the rendered HTML, and shuts it down.
// It used to fetch http://localhost:3001/ and assume you had already started
// that server by hand in another terminal — undocumented, and silently capable
// of snapshotting a stale server.
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const output = path.join(root, "static-site");
// Take an OS-assigned free port by default. A fixed port meant that any other
// server already listening there would be snapshotted instead of ours — which
// is exactly how a stale process can end up published as the live site.
async function freePort() {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.on("error", reject);
    probe.listen(0, "127.0.0.1", () => {
      const { port } = probe.address();
      probe.close(() => resolve(port));
    });
  });
}
const PORT = process.env.PAGES_PORT ? Number(process.env.PAGES_PORT) : await freePort();

// Single source of truth: app/layout.tsx owns the public origin. Parsing it
// here keeps the base path from drifting away from the one baked into metadata.
const layout = await readFile(path.join(root, "app", "layout.tsx"), "utf8");
const match = layout.match(/export const SITE_URL\s*=\s*["']([^"']+)["']/);
if (!match) throw new Error("Could not read SITE_URL from app/layout.tsx");
const SITE_URL = match[1];
const base = new URL(SITE_URL).pathname.replace(/\/$/, ""); // "/DanDoku", or "" at a domain root
console.log(`site: ${SITE_URL}  base: ${base || "(root)"}  port: ${PORT}`);

async function waitForServer(url, timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok) return res;
    } catch {
      // not listening yet
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Server did not become ready at ${url} within ${timeoutMs}ms`);
}

// Resolve vinext's real CLI entry from its own package manifest rather than
// hardcoding a path that can move between releases.
// vinext does not expose ./package.json through its exports map, so read it
// off disk rather than via require.resolve.
const vinextManifestPath = path.join(root, "node_modules", "vinext", "package.json");
const vinextManifest = JSON.parse(await readFile(vinextManifestPath, "utf8"));
const vinextBin = path.join(path.dirname(vinextManifestPath), vinextManifest.bin.vinext);

const server = spawn(
  process.execPath,
  [vinextBin, "start", "--port", String(PORT)],
  { cwd: root, stdio: ["ignore", "inherit", "inherit"] },
);
server.on("error", (error) => {
  console.error("Failed to start the production server:", error);
  process.exitCode = 1;
});

let html;
try {
  const response = await waitForServer(`http://localhost:${PORT}/`);
  html = await response.text();
} finally {
  server.kill();
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(path.join(root, "dist", "client"), output, { recursive: true });

// The app is built for the server root; GitHub Pages serves it from a subpath.
if (base) {
  html = html
    .replaceAll('href="/_next/', `href="${base}/_next/`)
    .replaceAll('src="/_next/', `src="${base}/_next/`)
    .replaceAll('href="/favicon.svg"', `href="${base}/favicon.svg"`);
}

await writeFile(path.join(output, "index.html"), html);
await writeFile(path.join(output, ".nojekyll"), "");

// A Pages deployment made from an uploaded artifact carries its custom domain
// in a CNAME file. Emitting it from SITE_URL keeps the deployed domain and the
// metadata origin from drifting apart.
const { hostname } = new URL(SITE_URL);
if (!hostname.endsWith("github.io")) {
  await writeFile(path.join(output, "CNAME"), hostname + "\n");
  console.log(`wrote CNAME -> ${hostname}`);
}

// Vinext chunks contain root-relative asset references. Point those at the
// repository subpath used by GitHub Pages.
if (base) {
  const chunkDir = path.join(output, "_next", "static", "chunks");
  for (const name of await readdir(chunkDir)) {
    if (!name.endsWith(".js")) continue;
    const file = path.join(chunkDir, name);
    let source = await readFile(file, "utf8");
    source = source.replaceAll('"/_next/', `"${base}/_next/`).replaceAll("'/_next/", `'${base}/_next/`);
    await writeFile(file, source);
  }
}

// Fail loudly rather than shipping a snapshot that points at the wrong origin.
const problems = [];
if (!html.includes(`${SITE_URL}/og.png`)) problems.push(`og:image does not point at ${SITE_URL}/og.png`);
if (html.includes("localhost")) problems.push("snapshot still contains a localhost URL");
if (base && html.includes('src="/_next/')) problems.push("snapshot still contains root-relative _next asset paths");
// At a root domain the opposite mistake is the dangerous one: a stray base path
// prefix makes every asset 404, which is what took the live site down.
if (!base && /(?:src|href)="\/[^"/][^"]*\/_next\//.test(html)) problems.push("snapshot has a base-path prefix but the site is served at a domain root");
if (problems.length) {
  console.error("Snapshot verification failed:");
  for (const p of problems) console.error("  - " + p);
  process.exit(1);
}

console.log(`Snapshot written to static-site/ (${html.length} bytes of HTML), verified against ${SITE_URL}`);
