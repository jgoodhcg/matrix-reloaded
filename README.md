<p align="center">
  <img src=".github/banner.png" alt="matrix-reloaded" width="600">
</p>

# matrix-reloaded

A local development tool for visualizing decision matrices with live reload.

Analyze options against criteria, facilitate decision discussions, and create artifacts documenting the reasoning. Designed to be used alongside agentic coding tools — includes a copy-pastable instruction set for LLMs.

## Installation

```bash
# Build the binary
bun build --compile src/index.ts --outfile matrix-reloaded

# Move to your PATH
mv matrix-reloaded ~/bin/  # or /usr/local/bin/
```

## Usage

```bash
# Start server (looks for .decisions/*.json by default)
matrix-reloaded

# Specify a file
matrix-reloaded .decisions/tech-stack.json

# Output instructions for agentic tools
matrix-reloaded --instructions
```

Then open http://localhost:3000

## Matrix Layout

```
┌─────────────────────┬─────────────────┬─────────────────┬─────────────────┐
│ Decision Statement  │ Option A        │ Option B        │ Option C        │
├─────────────────────┼─────────────────┼─────────────────┼─────────────────┤
│ Decision context    │ Option A        │ Option B        │ Option C        │
│ and background      │ description     │ description     │ description     │
├─────────────────────┼─────────────────┼─────────────────┼─────────────────┤
│ Criteria 1          │ Assessment      │ Assessment      │ Assessment      │
├─────────────────────┼─────────────────┼─────────────────┼─────────────────┤
│ Criteria 2          │ Assessment      │ Assessment      │ Assessment      │
├─────────────────────┼─────────────────┼─────────────────┼─────────────────┤
│ Criteria 3          │ Assessment      │ Assessment      │ Assessment      │
└─────────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

- **Top-left cell**: The decision statement (question being answered)
- **Top row**: Short labels for each option
- **Second row, first cell**: Longer explanation/context for the decision
- **Second row**: Longer descriptions of each option
- **Left column**: Criteria to evaluate options against
- **Inner cells**: Brief assessment of how each option meets each criteria

## File Format

Decision files live in `.decisions/` and use this schema:

```json
{
  "decision": {
    "statement": "Which database should we use?",
    "description": "For the new auth service. Need to support ~10k users, complex queries, and team is familiar with SQL."
  },
  "options": [
    { "label": "PostgreSQL", "description": "Managed RDS instance with read replicas" },
    { "label": "SQLite", "description": "Embedded file-based, zero infrastructure" },
    { "label": "DynamoDB", "description": "AWS managed NoSQL, pay-per-request" }
  ],
  "criteria": [
    {
      "name": "Query Complexity",
      "cells": {
        "PostgreSQL": { "text": "Full SQL, joins, CTEs", "color": "green" },
        "SQLite": { "text": "Full SQL but single-writer", "color": "yellow" },
        "DynamoDB": { "text": "Limited to key-value patterns", "color": "red" }
      }
    },
    {
      "name": "Operational Overhead",
      "cells": {
        "PostgreSQL": { "text": "Need to manage backups, updates", "color": "yellow" },
        "SQLite": { "text": "Zero ops, just a file", "color": "green" },
        "DynamoDB": { "text": "Fully managed by AWS", "color": "green" }
      }
    },
    {
      "name": "Team Familiarity",
      "cells": {
        "PostgreSQL": { "text": "Everyone knows SQL", "color": "green" },
        "SQLite": { "text": "Same SQL knowledge applies", "color": "green" },
        "DynamoDB": { "text": "Would need training", "color": "yellow" }
      }
    }
  ]
}
```

### Cell Colors

| Color | Meaning | Use when |
|-------|---------|----------|
| `red` | Blocker | Eliminates this option |
| `yellow` | Concern | Less than ideal, but not fatal |
| (none) | Neutral | Neither good nor bad |
| `green` | Good | Positive for this criteria |

## Features

- **Live reload** — Edit the JSON, see changes instantly
- **XLSX export** — Auto-generates `.xlsx` on every save for Google Sheets import
- **Agentic-friendly** — `--instructions` outputs a prompt for LLMs to create/update matrices

## Development

```bash
bun install
bun run dev
```

## License

MIT
