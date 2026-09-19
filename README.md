# tsxray

This projects serves as a simple cli command to scan projects based on the defined rules, I created this to centrelize all code analysis checks in one place and make it easier to configure

## Installation

```bash
git clone <repo-url>
cd tsxray
npm install

npm run build
```

## Usage

### Scan a project

```bash
# Basic scan (terminal output)
npm start -- scan ./src

# JSON output
npm start -- scan ./src --format json

# HTML report
npm start -- scan ./src --format html --output report.html

# Verbose mode
npm start -- scan ./src --verbose
```

### Run tests

```bash
npm test
```

### Build

```bash
npm run build
```

## Development Scripts

```bash
npm start                 # Run CLI in development
npm run build            # Compile TypeScript
npm test                 # Run test suite
npm run test:watch      # Watch mode for tests
npm run publish         # Publish to npm (requires auth)
```

## Creating Your First Rule

Rules in tsxray follow a simple interface:

```typescript
// src/rules/implementations/my-first-rule.ts
import type { Rule, RuleContext, RuleResult } from "../types";

export const myFirstRule: Rule = {
  id: "my-first-rule",
  name: "My First Rule",
  description: "Detects something in your code",
  defaultConfig: {
    enabled: true,
    options: {},
  },

  check(context: RuleContext): RuleResult {
    const findings = [];

    // Add your analysis logic here
    // Use context.sourceFile (ts-morph) to inspect the AST

    return { findings };
  },
};
```

Then register it in `src/rules/implementations/index.ts`:

```typescript
import { myFirstRule } from "./my-first-rule.js";

export const builtInRules: Rule[] = [
  myFirstRule,
  // Add more rules here as you create them
];
```

## Architecture

### Scanning Pipeline

1. **Project Loader** — Loads TypeScript project using ts-morph
2. **Scanner** — Collects all source files and metadata
3. **Analyzer** — Runs rules against files (empty by default)
4. **Reporters** — Formats results (terminal, JSON, HTML)

### Adding Rules

Rules implement the `Rule` interface and:

- Receive a `RuleContext` with the source file AST
- Return `Finding[]` objects for detected issues
- Can optionally support autofix capabilities

See `src/rules/types.ts` for the full interface.

## Configuration

Configuration via `tsxray.config.json`:

```json
{
  "rules": {
    "my-rule": {
      "enabled": true,
      "options": {
        "threshold": 50
      }
    }
  }
}
```

## Output Formats

### Terminal

Colored, human-readable output with statistics and summaries.

### JSON

Structured output for programmatic consumption or CI/CD integration.

### HTML

Interactive report with charts and detailed findings.
