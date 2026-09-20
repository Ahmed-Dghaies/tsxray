import { describe, expect, it } from "vitest";

import { RULES } from "@/rules/constants";

import { CliQuerier } from "../CliQuerier";
import { useFakeTimers } from "../utilities";

import type { FindingId } from "@/findings/types";

const cliQuerier = new CliQuerier();

describe("no-large-functions rule via CLI scan", () => {
  useFakeTimers();

  it("Flags large functions in a real project fixture", () => {
    const result = cliQuerier.runScan("tests/SampleProject");

    cliQuerier.validateScanFoundRules(result, "no-large-functions", [
      {
        id: "WithoutConfig/large-functions.ts:large-func:0" as FindingId,
        ruleId: RULES.NO_LARGE_FUNCTIONS,
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
    ]);
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

    cliQuerier.validateScanFoundRules(result, "no-large-functions", [
      {
        id: "configurable-function.ts:large-func:0" as FindingId,
        ruleId: RULES.NO_LARGE_FUNCTIONS,
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
    ]);
  });

  it("Ignores a file when the rule is disabled by a file directive", () => {
    const result = cliQuerier.runScan("tests/SampleProject/WithoutConfig");

    cliQuerier.validateScanFoundRules(result, "no-large-functions", [
      {
        id: "large-functions.ts:large-func:0" as FindingId,
        ruleId: RULES.NO_LARGE_FUNCTIONS,
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
    ]);
  });
});
