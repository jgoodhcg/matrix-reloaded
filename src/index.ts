import { watch } from "fs";
import { readdir } from "fs/promises";
import { join, resolve } from "path";
import type { ServerWebSocket } from "bun";
import type { DecisionMatrix } from "./types";
import { printInstructions } from "./instructions";
import { generateXLSX, getXLSXPath } from "./export";

const DEFAULT_PORT = 3000;
const DECISIONS_DIR = ".decisions";

// Print help message
function printHelp(): void {
  console.log(`
matrix-reloaded - Decision matrix viewer with live reload

USAGE:
  matrix-reloaded [OPTIONS] [FILE]

ARGUMENTS:
  FILE                    Path to a decision matrix JSON file
                          If omitted, looks for .json files in ./.decisions/

OPTIONS:
  -h, --help              Show this help message
  -i, --instructions      Show instructions for creating decision matrices
  -p, --port <PORT>       Set the server port (default: ${DEFAULT_PORT})

EXAMPLES:
  matrix-reloaded                           # Auto-discover from .decisions/
  matrix-reloaded my-decision.json          # Use specific file
  matrix-reloaded -p 8080 decisions.json    # Custom port

FEATURES:
  - Live reload on file changes
  - Automatic XLSX export (same path as JSON, .xlsx extension)
  - Sticky headers and scrollable cells
  - Click any cell to view full content
  - Red/yellow/green color coding preserved in Excel export
`);
}

// Parse CLI arguments
function parseArgs(): { filePath: string | null; port: number; showInstructions: boolean; showHelp: boolean } {
  const args = process.argv.slice(2);
  let filePath: string | null = null;
  let port = DEFAULT_PORT;
  let showInstructions = false;
  let showHelp = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--help" || arg === "-h") {
      showHelp = true;
    } else if (arg === "--instructions" || arg === "-i") {
      showInstructions = true;
    } else if (arg === "--port" || arg === "-p") {
      port = parseInt(args[++i], 10) || DEFAULT_PORT;
    } else if (!arg.startsWith("-")) {
      filePath = arg;
    }
  }

  return { filePath, port, showInstructions, showHelp };
}

// Find first JSON file in .decisions directory
async function findDefaultFile(): Promise<string | null> {
  try {
    const files = await readdir(DECISIONS_DIR);
    const jsonFile = files.find((f) => f.endsWith(".json"));
    if (jsonFile) {
      return join(DECISIONS_DIR, jsonFile);
    }
  } catch {
    // Directory doesn't exist
  }
  return null;
}

// Load and parse matrix file
async function loadMatrix(filePath: string): Promise<DecisionMatrix> {
  const file = Bun.file(filePath);
  const content = await file.text();
  return JSON.parse(content) as DecisionMatrix;
}

// Read viewer HTML
async function getViewerHTML(): Promise<string> {
  // In development, read from src/viewer.html
  // When compiled, this will be bundled
  const viewerPath = join(import.meta.dir, "viewer.html");
  const file = Bun.file(viewerPath);
  return file.text();
}

// Main
async function main() {
  const { filePath: argFilePath, port, showInstructions, showHelp } = parseArgs();

  if (showHelp) {
    printHelp();
    process.exit(0);
  }

  if (showInstructions) {
    printInstructions();
    process.exit(0);
  }

  // Resolve file path
  let filePath = argFilePath;
  if (!filePath) {
    filePath = await findDefaultFile();
  }

  if (!filePath) {
    console.error("No decision matrix file found.");
    console.error(`Either specify a file: matrix-reloaded <file.json>`);
    console.error(`Or create one in ./${DECISIONS_DIR}/`);
    process.exit(1);
  }

  filePath = resolve(filePath);

  // Verify file exists
  const file = Bun.file(filePath);
  if (!(await file.exists())) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  console.log(`Watching: ${filePath}`);
  console.log(`Server:   http://localhost:${port}`);

  // Track WebSocket clients
  const clients = new Set<ServerWebSocket<unknown>>();

  // Get viewer HTML once
  const viewerHTML = await getViewerHTML();

  // Initial XLSX export
  try {
    const matrix = await loadMatrix(filePath);
    const xlsxPath = getXLSXPath(filePath);
    await generateXLSX(matrix, xlsxPath);
    console.log(`Exported: ${xlsxPath}`);
  } catch (err) {
    console.error("Failed initial XLSX export:", err);
  }

  // Start server
  const server = Bun.serve({
    port,
    async fetch(req, server) {
      const url = new URL(req.url);

      // WebSocket upgrade
      if (url.pathname === "/ws") {
        const upgraded = server.upgrade(req);
        if (!upgraded) {
          return new Response("WebSocket upgrade failed", { status: 400 });
        }
        return undefined;
      }

      // Serve viewer
      if (url.pathname === "/") {
        return new Response(viewerHTML, {
          headers: { "Content-Type": "text/html" },
        });
      }

      // Serve matrix JSON
      if (url.pathname === "/api/matrix") {
        try {
          const matrix = await loadMatrix(filePath!);
          return Response.json(matrix);
        } catch (err) {
          return Response.json({ error: "Failed to load matrix" }, { status: 500 });
        }
      }

      return new Response("Not found", { status: 404 });
    },
    websocket: {
      open(ws) {
        clients.add(ws);
      },
      close(ws) {
        clients.delete(ws);
      },
      message() {
        // No client messages expected
      },
    },
  });

  // Watch file for changes
  // Note: macOS can fire "rename" instead of "change" for atomic saves
  const watcher = watch(filePath, async (event) => {
    if (event === "change" || event === "rename") {
      console.log(`File ${event}, reloading...`);

      // Generate XLSX
      try {
        const matrix = await loadMatrix(filePath!);
        const xlsxPath = getXLSXPath(filePath!);
        await generateXLSX(matrix, xlsxPath);
        console.log(`Exported: ${xlsxPath}`);
      } catch (err) {
        console.error("Failed to export XLSX:", err);
      }

      // Notify clients
      const message = JSON.stringify({ type: "reload" });
      for (const client of clients) {
        client.send(message);
      }
    }
  });

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    console.log("\nShutting down...");
    watcher.close();
    server.stop();
    process.exit(0);
  });
}

main();
