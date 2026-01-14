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

### Multi-file discovery improvement
When multiple `.json` files exist in `.decisions/`, current behavior picks one arbitrarily. Options to improve:
1. Error with list of available files, prompt user to specify
2. Pick alphabetically first for predictability
3. Pick most recently modified file
4. Interactive prompt to choose

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
