// Records the commits this deploy was built from, so the scheduled poll in
// .github/workflows/pages.yml can tell whether a later run has anything to do.
//
// This is what stands in for a dispatch token: rather than each game repo
// holding a credential to poke this one, the published site states its own
// provenance and the poll compares against it.
import { execSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const manifest = JSON.parse(await readFile(path.join(root, "games.json"), "utf8"));

const games = {};
for (const { slug } of manifest) {
  const dir = path.join(root, "games", slug);
  games[slug] = execSync("git rev-parse HEAD", { cwd: dir }).toString().trim();
}

// Order follows games.json so the fingerprint is stable and comparable with the
// one the poll builds from the same file.
const site = process.env.GITHUB_SHA ?? execSync("git rev-parse HEAD", { cwd: root }).toString().trim();
const info = {
  site,
  games,
  fingerprint: [site, ...manifest.map((game) => games[game.slug])].join("-"),
  builtAt: new Date().toISOString(),
};

const out = path.join(root, "static-site", "build-info.json");
await writeFile(out, JSON.stringify(info, null, 2) + "\n");
console.log(info.fingerprint);
