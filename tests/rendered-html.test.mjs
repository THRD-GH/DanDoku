// Renders the built worker and asserts the page a visitor actually receives.
//
// This file previously tested the vinext starter template's loading skeleton:
// it read app/_sites-preview/, expected a react-loading-skeleton dependency and
// a "Starter Project" layout title, and asserted a <title> of "Your site is
// taking shape". None of that had existed since the site became DanDoku, so the
// suite could not load, let alone pass — and CI never ran it.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const SITE_URL = "https://dandoku.com";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("serves the DanDoku homepage", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>DanDoku — Sudoku and other number games<\/title>/i);
  assert.match(html, /Sudoku,/);
  assert.match(html, /however you like/);
});

test("links out to every game in the collection", async () => {
  const html = await (await render()).text();
  // The games are assembled into this same site at these paths by
  // .github/workflows/pages.yml, so the links are same-origin and relative.
  const expected = ["/sudoku/?v=S", "/sudoku/?v=XJ", "/killer/", "/solduku/"];
  for (const url of expected) {
    assert.ok(html.includes(`href="${url}"`), `expected the page to link to ${url}`);
  }
  assert.ok(
    !html.includes("thrd-gh.github.io/SodukuCombined"),
    "game links should not point back at the standalone Pages sites",
  );
  // Classic and Variants share an engine and are told apart only by ?v=,
  // so a card link losing its query string is a silent regression.
  assert.ok(html.includes("?v=S"), "Classic must open the S variant");
  assert.ok(html.includes("?v=XJ"), "Variants must open the XJ mix");
});

test("renders every belt rank and game card", async () => {
  const html = await (await render()).text();
  for (const belt of ["White belt", "Yellow belt", "Green belt", "Blue belt", "Brown belt", "Black belt"]) {
    assert.ok(html.includes(belt), `expected the level guide to include ${belt}`);
  }
  for (const title of ["Classic Sudoku", "Sudoku Variants", "Killer Sudoku", "Solduku"]) {
    assert.ok(html.includes(title), `expected a card for ${title}`);
  }
});

test("social metadata points at the public origin, not the render host", async () => {
  const html = await (await render()).text();
  assert.ok(
    html.includes(`${SITE_URL}/og.png`),
    "og:image must be absolute and point at the deployed origin",
  );
  assert.ok(
    !/content="https?:\/\/localhost[^"]*og\.png"/.test(html),
    "og:image must not be derived from the render host",
  );
  assert.ok(
    !/content="[^"]*\/DanDoku\/og\.png"/.test(html),
    "og:image must not carry a base path — the custom domain serves at the root",
  );
});

test("SITE_URL stays the single source of truth for the base path", async () => {
  const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
  const match = layout.match(/export const SITE_URL\s*=\s*["']([^"']+)["']/);
  assert.ok(match, "app/layout.tsx must export a SITE_URL constant");
  assert.equal(match[1], SITE_URL);

  // scripts/build-pages.mjs derives the Pages base path by parsing this exact
  // declaration, so the two must not drift apart.
  const buildScript = await readFile(new URL("../scripts/build-pages.mjs", import.meta.url), "utf8");
  assert.match(buildScript, /export const SITE_URL/);
});

test("no dead marks data lingers on the game list", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.ok(!/\bmarks:/.test(page), "game objects should not carry unused `marks` data");
});
