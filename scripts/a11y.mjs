#!/usr/bin/env node
// Accessibility scan: serves the built gallery (dist/), opens it in headless Chrome in every
// theme and light/dark mode, at desktop and phone width, and runs axe-core (WCAG 2.2 AA).
// Run `pnpm build` first. Exits with 1 if anything fails.
//
// Uses the Chrome or Chromium already on the machine. Set CHROME_PATH to pick one.
import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { homedir, tmpdir } from "node:os";
import path from "node:path";

const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const registry = JSON.parse(readFileSync(new URL("../registry.json", import.meta.url), "utf8"));
const themes = [
  "neutral",
  ...registry.items.filter((i) => i.type === "registry:theme").map((i) => i.name.replace(/^theme-/, "")),
];
const widths = [1100, 390];
const servePort = 4179;
const debugPort = 9339;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  for (const name of ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser"]) {
    if (spawnSync("which", [name]).status === 0) return name;
  }
  throw new Error("No Chrome or Chromium found. Install one or set CHROME_PATH.");
}

async function waitFor(url) {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return res;
    } catch {}
    await sleep(250);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

const chrome = findChrome();
// Snap-packaged Chromium can't write to /tmp, so give it a profile folder it can reach.
const profileRoot = chrome.includes("chromium") && process.platform === "linux" ? homedir() : tmpdir();
const profile = mkdtempSync(path.join(profileRoot, "idavoll-a11y-"));

const server = spawn("pnpm", ["exec", "vite", "preview", "--port", String(servePort), "--strictPort"], {
  stdio: "ignore",
});
const browser = spawn(
  chrome,
  [
    "--headless=new",
    "--disable-gpu",
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${profile}`,
    "about:blank",
  ],
  { stdio: "ignore" },
);

let failed = 0;
try {
  await waitFor(`http://localhost:${servePort}/`);
  const targets = await (await waitFor(`http://127.0.0.1:${debugPort}/json`)).json();
  const ws = new WebSocket(targets.find((t) => t.type === "page").webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener("open", r));
  let id = 0;
  const pending = new Map();
  ws.addEventListener("message", (e) => {
    const m = JSON.parse(e.data);
    pending.get(m.id)?.(m);
    pending.delete(m.id);
  });
  const send = (method, params = {}) =>
    new Promise((r) => {
      id += 1;
      pending.set(id, r);
      ws.send(JSON.stringify({ id, method, params }));
    });
  const evaluate = async (expression) =>
    (await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true })).result?.result?.value;

  // Reduced motion lets count-up numbers and transitions settle before the scan.
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });

  for (const width of widths) {
    await send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: width < 600 });
    for (const theme of themes) {
      for (const mode of ["light", "dark"]) {
        await send("Page.navigate", {
          url: `http://localhost:${servePort}/?theme=${theme}&mode=${mode}`,
        });
        await sleep(2500);
        await evaluate(axeSource);
        const violations = await evaluate(`axe.run(document, {
          runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"] },
        }).then((r) => r.violations.map((v) => ({
          id: v.id, impact: v.impact, help: v.help,
          nodes: v.nodes.map((n) => ({ target: n.target.join(" "), why: n.failureSummary })),
        })))`);
        const where = `${theme} / ${mode} / ${width}px`;
        if (!violations?.length) {
          console.log(`✔ ${where}`);
          continue;
        }
        failed += violations.length;
        console.log(`✖ ${where}`);
        for (const v of violations) {
          console.log(`  ${v.impact}: ${v.id}: ${v.help}`);
          for (const n of v.nodes) console.log(`    ${n.target}\n      ${n.why.replace(/\n/g, "\n      ")}`);
        }
      }
    }
  }
  ws.close();
} finally {
  browser.kill();
  server.kill();
  await sleep(300);
  rmSync(profile, { recursive: true, force: true });
}

if (failed) {
  console.error(`\n${failed} accessibility problem(s) found.`);
  process.exit(1);
}
console.log("\nNo accessibility problems found.");
