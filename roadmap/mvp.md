# MVP Roadmap

Minimal viable version of matrix-reloaded.

## Purpose

Analyze options against criteria to facilitate decision-making. The matrix helps:
- Visually identify blockers (red) that eliminate options
- Surface concerns (yellow) for discussion
- Document reasoning as an artifact
- Enable iterative refinement with live reload

## Core Features

### 1. Server (`src/index.ts`)
- [ ] Bun.serve() with HTTP + WebSocket on same port
- [ ] Serve viewer.html at `/`
- [ ] Serve matrix JSON at `/api/matrix`
- [ ] File watcher using Bun's native `fs.watch`
- [ ] Broadcast reload message to WebSocket clients on file change
- [ ] CLI argument parsing (file path, --instructions, --port)
- [ ] Auto-discover first `.json` in `.decisions/` if no file specified

### 2. Viewer (`src/viewer.html`)
- [ ] Self-contained HTML (embedded CSS + JS)
- [ ] Render matrix layout:
  - Top-left: decision statement
  - Top row: option labels
  - Second row left: decision description
  - Second row: option descriptions
  - Left column: criteria names
  - Inner cells: assessment text with color
- [ ] Cell coloring: red (blocker), yellow (concern), none (neutral), green (good)
- [ ] WebSocket client for live reload
- [ ] Connection status indicator

### 3. XLSX Export
- [ ] Auto-generate `.xlsx` alongside JSON on file change
- [ ] Preserve cell colors matching viewer
- [ ] Use SheetJS (xlsx) — either bundled or CDN

### 4. Instructions Output
- [ ] `--instructions` flag
- [ ] Outputs copy-pastable prompt for agentic tools
- [ ] Includes JSON schema
- [ ] Concise and token-efficient

### 5. Binary Build
- [ ] `bun build --compile` configuration
- [ ] Single executable output
- [ ] Works when run from any directory

## File Structure

```
matrix-reloaded/
├── src/
│   ├── index.ts          # Entry point, CLI, server
│   ├── viewer.html       # Self-contained viewer
│   ├── watcher.ts        # File watching logic
│   ├── export.ts         # XLSX generation
│   └── instructions.ts   # --instructions output
├── examples/
│   └── sample-matrix.json
├── package.json
├── tsconfig.json
├── README.md
└── roadmap/
    └── mvp.md
```

## JSON Schema

```json
{
  "decision": {
    "statement": "Question being decided",
    "description": "Context and background"
  },
  "options": [
    { "label": "Short Label", "description": "Longer explanation" }
  ],
  "criteria": [
    {
      "name": "Criteria Name",
      "cells": {
        "Option Label": { "text": "Assessment", "color": "green|yellow|red" }
      }
    }
  ]
}
```

## Out of Scope for MVP

- Multiple simultaneous files
- File picker UI
- Authentication
- Remote/cloud hosting
- Edit-in-browser
- Database storage
- Custom themes

## Backlog

### In-browser editing
Allow users to edit the matrix directly in the viewer and write changes back to the JSON file. Assumes workflow discipline (don't edit while agent is writing).

Features:
- Edit cell colors (click to cycle or color picker)
- Edit cell text inline
- Edit option labels and descriptions
- Edit criteria names
- Add/remove columns (options)
- Add/remove rows (criteria)
- Save changes back to JSON file via API endpoint

Considerations:
- No conflict resolution - user is responsible for not editing while agent is working
- Could add visual indicator when file was last modified externally
- Future: overlay file approach if conflicts become a problem

### File watcher reliability
Auto-reload not triggering consistently in compiled binary on other projects. Works in dev, fails with vim edits and agent edits. WebSocket connection is fine (101 upgrade successful).

Investigate:
- `fs.watch` behavior differences between dev and compiled binary
- vim's write behavior (backup file swap)
- Watch directory instead of file to handle delete+recreate patterns
- Test with `fs.watchFile` (polling) as fallback
- Verify watcher callback is firing at all in compiled version

### README improvements
Add a "Why" section explaining the motivation for decision matrices:
- Link to Rich Hickey's "Design in Practice" talk
- Explain how matrices help structure thinking and facilitate team discussions
- Document the iterative workflow with agentic tools

### Add screenshots to README
Include visual examples showing the decision matrix in action:
- Screenshot of the web app viewer rendering a decision matrix
- Screenshot of the exported spreadsheet (XLSX) opened in a spreadsheet app
- Show the color coding (red/yellow/green) in both formats
- Helps users quickly understand what the tool produces

### Debug logging
Add `--debug` CLI flag for verbose logging. Consider:
- Where logs go in dev (stdout) vs compiled (file? stdout?)
- Log file watcher events
- Log WebSocket connections/disconnections
- Log file read/parse attempts
- Make it easy to diagnose issues like the watcher problem above

### Multi-file discovery improvement
When multiple `.json` files exist in `.decisions/`, current behavior picks one arbitrarily. Options to improve:
1. Error with list of available files, prompt user to specify
2. Pick alphabetically first for predictability
3. Pick most recently modified file
4. Interactive prompt to choose

### Styling update with Tailwind CSS 4
Migrate the viewer styling to use Tailwind CSS 4 for modern, maintainable styles.

Features:
- Replace embedded CSS with Tailwind CSS 4 utility classes
- Leverage Tailwind CSS 4's new features and performance improvements
- Maintain existing visual appearance and responsiveness
- Configure Tailwind CSS 4 via CDN or bundled for the binary build

### Decision selector dashboard
Add a dashboard or navigation UI to switch between multiple decision matrix sheets.

Features:
- List all available decision matrix files
- Quick navigation to switch between sheets
- Visual indication of currently active sheet
- Support for `.decisions/` folder with multiple JSON files

### Connection status icon positioning
The connected status icon currently blocks some sheet content. Need to reposition or restyle so it doesn't obscure the matrix.

Options:
- Move indicator to a less intrusive location (corner, header bar)
- Make it smaller or collapsible
- Show only on hover or when connection state changes
- Use a subtle inline indicator instead of overlay

### Configurable port
Support choosing a different port to avoid conflicts with other running instances or tools.

Features:
- Add `--port` CLI argument (already in roadmap but ensure it works)
- Fall back to next available port if default is in use
- Display actual port in console output
- Consider port range or auto-increment on conflict

### Security hardening (CORS and cross-site execution)
Review and harden security settings to prevent cross-site JavaScript execution vulnerabilities, similar to the opencode DNS rebinding bug.

Concerns:
- CORS configuration on API endpoints
- WebSocket origin validation
- Localhost binding vs 0.0.0.0 exposure
- DNS rebinding attacks (malicious site making requests to localhost server)

Mitigations to consider:
- Bind to 127.0.0.1 only by default
- Validate Host header matches expected localhost values
- Restrict CORS to same-origin or explicit allowlist
- Add Origin header checks on WebSocket upgrade requests
- Consider authentication token for API/WebSocket if exposed beyond localhost

## Definition of Done

MVP is complete when:
1. Can run `matrix-reloaded` in any project with a `.decisions/` folder
2. Browser shows styled decision matrix
3. Editing JSON updates browser automatically
4. XLSX file is generated for Sheets import
5. `--instructions` outputs usable agentic prompt
6. Compiles to standalone binary

## Dependencies

**Runtime:**
- None (Bun native APIs only)

**Build/Dev:**
- `xlsx` (SheetJS) — for XLSX generation
- `typescript` — dev only

## Commands

```bash
# Development
bun run dev          # Start with watch mode

# Build
bun run build        # Compile to binary

# Test
bun test             # Run tests (if any)
```
