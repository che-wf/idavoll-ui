// Points git at the repo's .githooks folder so the secret checks run on every commit.
// Does nothing outside a git checkout (for example inside a Docker build).
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

if (!existsSync(".git")) process.exit(0);

try {
  execFileSync("git", ["config", "core.hooksPath", ".githooks"], { stdio: "ignore" });
} catch {
  console.warn("Could not set git hooks path. Run: git config core.hooksPath .githooks");
}
