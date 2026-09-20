import { describe, it } from "vitest";

import { RULES } from "@/rules/constants";

import { CliQuerier } from "../CliQuerier";
import { useFakeTimers } from "../utilities";

import type { FindingId } from "@/findings/types";

const cliQuerier = new CliQuerier();

describe("no-deep-nesting rule via CLI scan", () => {
  useFakeTimers();

  it("Flags AST control-flow nesting deeper than the default maximum", () => {
    const result = cliQuerier.runScan("tests/SampleProject/WithoutConfig");

    cliQuerier.validateScanFoundRules(result, RULES.NO_DEEP_NESTING, [
      {
        id: "z-deep-nesting.ts:deep-nesting:0" as FindingId,
        ruleId: RULES.NO_DEEP_NESTING,
        severity: "warning",
        title: 'Function "processItems" is nested too deeply (depth 5)',
        message:
          "Control-flow nesting depth is 5, exceeding the configured maximum of 4. Path: if > for-of > if > try > while. Extract nested logic into focused functions or use early returns.",
        filePath: "z-deep-nesting.ts",
        symbolName: "processItems",
        range: {
          startLine: 6,
          startColumn: 0,
          endLine: 8,
          endColumn: 0,
        },
      },
      {
        id: "z-nested-callbacks.ts:deep-nesting:0" as FindingId,
        ruleId: RULES.NO_DEEP_NESTING,
        severity: "warning",
        title: 'Function "scheduleWork" is nested too deeply (depth 5)',
        message:
          "Control-flow nesting depth is 5, exceeding the configured maximum of 4. Path: if > callback > callback > if > while. Extract nested logic into focused functions or use early returns.",
        filePath: "z-nested-callbacks.ts",
        symbolName: "scheduleWork",
        range: {
          startLine: 6,
          startColumn: 0,
          endLine: 8,
          endColumn: 0,
        },
      },
    ]);
  });

  it("Does not flag a normal file within the default maximum", () => {
    const result = cliQuerier.runScan("tests/SampleProject/WithoutConfig/z-acceptable-nesting.ts");

    cliQuerier.validateScanFoundRules(result, RULES.NO_DEEP_NESTING, []);
  });

  it("Uses configured depth and construct exclusions", () => {
    const result = cliQuerier.runScan("tests/SampleProject/WithConfig");

    cliQuerier.validateScanFoundRules(result, RULES.NO_DEEP_NESTING, [
      {
        id: "z-configurable-nesting.ts:deep-nesting:0" as FindingId,
        ruleId: RULES.NO_DEEP_NESTING,
        severity: "warning",
        title: 'Function "processRecords" is nested too deeply (depth 3)',
        message:
          "Control-flow nesting depth is 3, exceeding the configured maximum of 2. Path: if > for > while. Extract nested logic into focused functions or use early returns.",
        filePath: "z-configurable-nesting.ts",
        symbolName: "processRecords",
        range: {
          startLine: 7,
          startColumn: 0,
          endLine: 9,
          endColumn: 0,
        },
      },
    ]);
  });
});
