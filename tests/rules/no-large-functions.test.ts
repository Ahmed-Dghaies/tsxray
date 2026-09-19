import { describe, expect, it } from "vitest";

import { CliQuerier } from "../CliQuerier";
import { useFakeTimers } from "../utilities";

const cliQuerier = new CliQuerier();

describe("no-large-functions rule via CLI scan", () => {
  useFakeTimers();

  it("Flags large functions in a real project fixture", () => {
    const result = cliQuerier.runScan("tests/SampleProject");

    cliQuerier.validateScanFoundRules(result, ["no-large-functions"]);

    expect(result).toStrictEqual({
      findings: [
        {
          id: "WithoutConfig/large-functions.ts:large-func:0",
          ruleId: "no-large-functions",
          severity: "warning",
          title: 'Function "longFunction" is too large (55 lines)',
          message:
            "Function has 55 lines, exceeds limit of 50. Consider extracting parts into helper functions.",
          filePath: "WithoutConfig/large-functions.ts",
          symbolName: "longFunction",
          range: {
            endColumn: 0,
            endLine: 55,
            startColumn: 0,
            startLine: 1,
          },
        },
      ],
      summary: {
        total: 1,
        bySeverity: { error: 0, warning: 1, info: 0, hint: 0 },
        byRule: { "no-large-functions": 1 },
      },
      scannedFiles: [
        "WithConfig/configurable-function.ts",
        "WithoutConfig/acceptable-functions.ts",
        "WithoutConfig/disabled-large-function.ts",
        "WithoutConfig/large-functions.ts",
      ],
      timestamp: "2026-09-01T10:00:00.000Z",
      analyzedPath: "/Users/ahmeddghaies/Documents/GitHub/tsxray/tests/SampleProject",
    });
  });

  it("Shows detailed finding locations by default", () => {
    const output = cliQuerier.runTerminalScan("tests/SampleProject");

    expect(output).toContain("Detailed findings:");
    expect(output).toContain("File: WithoutConfig/large-functions.ts:1");
  });

  it("Hides detailed findings when --no-verbose is passed", () => {
    const output = cliQuerier.runTerminalScan("tests/SampleProject", ["--no-verbose"]);

    expect(output).not.toContain("Detailed findings:");
    expect(output).not.toContain("File: WithoutConfig/large-functions.ts:1");
  });

  it("Uses options from tsxray.config.json", () => {
    const result = cliQuerier.runScan("tests/SampleProject/WithConfig");

    expect(result).toStrictEqual({
      findings: [
        {
          id: "configurable-function.ts:large-func:0",
          ruleId: "no-large-functions",
          severity: "warning",
          title: 'Function "configurableFunction" is too large (7 lines)',
          message:
            "Function has 7 lines, exceeds limit of 5. Consider extracting parts into helper functions.",
          filePath: "configurable-function.ts",
          symbolName: "configurableFunction",
          range: {
            startLine: 1,
            startColumn: 0,
            endLine: 7,
            endColumn: 0,
          },
        },
      ],
      summary: {
        total: 1,
        bySeverity: { error: 0, warning: 1, info: 0, hint: 0 },
        byRule: { "no-large-functions": 1 },
      },
      scannedFiles: ["configurable-function.ts"],
      timestamp: "2026-09-01T10:00:00.000Z",
      analyzedPath: "/Users/ahmeddghaies/Documents/GitHub/tsxray/tests/SampleProject/WithConfig",
    });
  });

  it("Ignores a file when the rule is disabled by a file directive", () => {
    const result = cliQuerier.runScan("tests/SampleProject/WithoutConfig");

    expect(result).toStrictEqual({
      findings: [
        {
          id: "large-functions.ts:large-func:0",
          ruleId: "no-large-functions",
          severity: "warning",
          title: 'Function "longFunction" is too large (55 lines)',
          message:
            "Function has 55 lines, exceeds limit of 50. Consider extracting parts into helper functions.",
          filePath: "large-functions.ts",
          symbolName: "longFunction",
          range: {
            endColumn: 0,
            endLine: 55,
            startColumn: 0,
            startLine: 1,
          },
        },
      ],
      summary: {
        total: 1,
        bySeverity: { error: 0, warning: 1, info: 0, hint: 0 },
        byRule: { "no-large-functions": 1 },
      },
      scannedFiles: [
        "acceptable-functions.ts",
        "disabled-large-function.ts",
        "large-functions.ts",
      ],
      timestamp: "2026-09-01T10:00:00.000Z",
      analyzedPath:
        "/Users/ahmeddghaies/Documents/GitHub/tsxray/tests/SampleProject/WithoutConfig",
    });
  });
});
