#!/usr/bin/env node
/**
 * Static / GitHub Pages build.
 * Next.js `output: "export"` cannot include Route Handlers, so we
 * temporarily move `src/app/api` aside, build, then restore.
 */
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const apiDir = path.join(root, "src", "app", "api");
const stashDir = path.join(root, ".api-stash");

function run(cmd, args, env = {}) {
  const res = spawnSync(cmd, args, {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, ...env },
  });
  if (res.status !== 0) process.exit(res.status || 1);
}

let stashed = false;
try {
  if (fs.existsSync(apiDir)) {
    if (fs.existsSync(stashDir)) {
      fs.rmSync(stashDir, { recursive: true, force: true });
    }
    fs.renameSync(apiDir, stashDir);
    stashed = true;
    console.log("[build:static] stashed src/app/api → .api-stash");
  }

  run("npx", ["next", "build", "--turbopack"], {
    SPINDLE_STATIC: "1",
  });
} finally {
  if (stashed && fs.existsSync(stashDir)) {
    if (fs.existsSync(apiDir)) {
      fs.rmSync(apiDir, { recursive: true, force: true });
    }
    fs.renameSync(stashDir, apiDir);
    console.log("[build:static] restored src/app/api");
  }
}
