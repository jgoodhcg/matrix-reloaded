export const INSTRUCTIONS = `# Decision Matrix Format

Create decision matrices as JSON files in \`.decisions/\` directory.

## Schema

\`\`\`json
{
  "decision": {
    "statement": "Question being decided",
    "description": "Context and constraints"
  },
  "options": [
    { "label": "Option A", "description": "Details about option A" },
    { "label": "Option B", "description": "Details about option B" }
  ],
  "criteria": [
    {
      "name": "Criteria Name",
      "cells": {
        "Option A": { "text": "Assessment", "color": "green" },
        "Option B": { "text": "Assessment", "color": "red" }
      }
    }
  ]
}
\`\`\`

## Colors

Default to no coloring (neutral). Use colors sparingly:

- \`red\`: Blocker - eliminates this option
- \`yellow\`: Notably negative aspect
- \`green\`: Notable good aspect - significant benefit over at least some or all of the other options
- (omit): Neutral

## Example

\`\`\`json
{
  "decision": {
    "statement": "Which framework for the new API?",
    "description": "Need REST endpoints, auth middleware, good TypeScript support"
  },
  "options": [
    { "label": "Express", "description": "Mature, huge ecosystem" },
    { "label": "Fastify", "description": "Fast, schema validation built-in" },
    { "label": "Hono", "description": "Edge-first, very lightweight" }
  ],
  "criteria": [
    {
      "name": "TypeScript Support",
      "cells": {
        "Express": { "text": "Types exist but bolted on", "color": "yellow" },
        "Fastify": { "text": "First-class TS support", "color": "green" },
        "Hono": { "text": "Built in TypeScript", "color": "green" }
      }
    },
    {
      "name": "Ecosystem",
      "cells": {
        "Express": { "text": "Largest middleware ecosystem", "color": "green" },
        "Fastify": { "text": "Good plugin ecosystem", "color": "green" },
        "Hono": { "text": "Smaller but growing", "color": "yellow" }
      }
    }
  ]
}
\`\`\`

## Usage

Save as \`.decisions/<name>.json\` and run \`matrix-reloaded\` to view.
`;

export function printInstructions(): void {
  console.log(INSTRUCTIONS);
}
