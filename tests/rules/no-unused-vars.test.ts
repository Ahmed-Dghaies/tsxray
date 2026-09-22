import { describe, it } from "vitest";

import { RULES } from "@/rules/constants";

import { CliQuerier } from "../CliQuerier";
import { useFakeTimers } from "../utilities";

import type { FindingId } from "@/findings/types";

const cliQuerier = new CliQuerier();

describe("no-unused-vars rule via CLI scan", () => {
  useFakeTimers();

  it("Flags unused variables, functions, and trailing parameters by default", () => {
    const result = cliQuerier.runScan("tests/SampleProject/WithoutConfig");

    cliQuerier.validateScanFoundRules(result, "no-unused-vars", [
      {
        id: "unused-vars.ts:no-unused-vars:0" as FindingId,
        ruleId: RULES.NO_UNUSED_VARS,
        severity: "warning",
        title: "Resolve no-unused-vars violation",
        message: "'unusedVariable' is assigned a value but never used.",
        filePath: "unused-vars.ts",
        range: {
          startLine: 1,
          startColumn: 7,
          endLine: 1,
          endColumn: 21,
        },
      },
      {
        id: "unused-vars.ts:no-unused-vars:1" as FindingId,
        ruleId: RULES.NO_UNUSED_VARS,
        severity: "warning",
        title: "Resolve no-unused-vars violation",
        message: "'unusedFunction' is defined but never used.",
        filePath: "unused-vars.ts",
        range: {
          startLine: 3,
          startColumn: 10,
          endLine: 3,
          endColumn: 24,
        },
      },
      {
        id: "unused-vars.ts:no-unused-vars:2" as FindingId,
        ruleId: RULES.NO_UNUSED_VARS,
        severity: "warning",
        title: "Resolve no-unused-vars violation",
        message: "'unusedParameter' is defined but never used.",
        filePath: "unused-vars.ts",
        range: {
          startLine: 7,
          startColumn: 59,
          endLine: 7,
          endColumn: 82,
        },
      },
    ]);
  });

  it("Uses ESLint rule options from tsxray.config.json", () => {
    const result = cliQuerier.runScan("tests/SampleProject/WithConfig");

    cliQuerier.validateScanFoundRules(result, "no-unused-vars", [
      {
        id: "configured-unused-vars.ts:no-unused-vars:0" as FindingId,
        ruleId: RULES.NO_UNUSED_VARS,
        severity: "warning",
        title: "Resolve no-unused-vars violation",
        message: "'unusedBeforeUsed' is defined but never used.",
        filePath: "configured-unused-vars.ts",
        range: {
          startLine: 3,
          startColumn: 38,
          endLine: 3,
          endColumn: 62,
        },
      },
    ]);
  });
});
