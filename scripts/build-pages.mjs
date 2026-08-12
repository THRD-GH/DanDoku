import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const output = path.join(root, "static-site");
const base = "/DanDoku";

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(path.join(root, "dist", "client"), output, { recursive: true });

const response = await fetch(process.env.PAGES_SOURCE_URL ?? "http://localhost:3001/");
if (!response.ok) throw new Error(`Production preview returned ${response.status}`);
let html = await response.text();
html = html
  .replaceAll('href="/_next/', `href="${base}/_next/`)
  .replaceAll('src="/_next/', `src="${base}/_next/`)
  .replaceAll('href="/favicon.svg"', `href="${base}/favicon.svg"`)
  .replaceAll('content="http://localhost:3001/og.png"', `content="https://thrd-gh.github.io${base}/og.png"`);

await writeFile(path.join(output, "index.html"), html);
await writeFile(path.join(output, ".nojekyll"), "");

// Vinext chunks contain root-relative asset references. Point those at the
// repository subpath used by GitHub Pages.
const chunkDir = path.join(output, "_next", "static", "chunks");
for (const name of await readdir(chunkDir)) {
  if (!name.endsWith(".js")) continue;
  const file = path.join(chunkDir, name);
  let source = await readFile(file, "utf8");
  source = source.replaceAll('"/_next/', `"${base}/_next/`).replaceAll("'/_next/", `'${base}/_next/`);
  await writeFile(file, source);
}
