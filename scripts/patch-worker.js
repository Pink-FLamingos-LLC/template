import { readFileSync, appendFileSync } from "node:fs";

const workerPath = ".svelte-kit/cloudflare/_worker.js";

const stateDoExport = "\nexport { StateManager } from '../../src/lib/durable-objects/state-do';\n";

try {
  const content = readFileSync(workerPath, "utf-8");

  if (!content.includes("export { StateManager }")) {
    appendFileSync(workerPath, stateDoExport);
    console.log("[patch-worker] Appended StateManager export to _worker.js");
  } else {
    console.log("[patch-worker] StateManager export already present, skipping.");
  }
} catch (err) {
  console.error("[patch-worker] Could not read _worker.js:", err.message);
  process.exit(1);
}
