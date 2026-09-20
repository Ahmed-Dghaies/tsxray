import { describe, it } from "vitest";

import { RULES } from "@/rules/constants";

import { CliQuerier } from "../CliQuerier";
import { useFakeTimers } from "../utilities";

import type { FindingId } from "@/findings/types";

const cliQuerier = new CliQuerier();

describe("god-module rule via CLI scan", () => {
  useFakeTimers();

  it("detects configured signals but ignores single-signal and suppressed modules", () => {
    const result = cliQuerier.runScan("tests/SampleProject/WithConfig");

    cliQuerier.validateScanFoundRules(result, "god-module", [
      {
        id: "hub.ts:god-module:1" as FindingId,
        ruleId: RULES.GOD_MODULE,
        severity: "warning",
        title: "Module exhibits 3 God Module signals",
        message:
          "This module combines size: 23 lines, 4 declarations, 4 functions/classes, 4 exports; dependencies: 4 imported or re-exported modules; dependents: used by 3 modules. Split it into focused modules and reduce dependency concentration.",
        filePath: "hub.ts",
        range: {
          startLine: 1,
          startColumn: 0,
          endLine: 23,
          endColumn: 0,
        },
      },
    ]);
  });

  it("detects default combined signals but ignores a dependents-only module", () => {
    const result = cliQuerier.runScan("tests/SampleProject/WithoutConfig");

    cliQuerier.validateScanFoundRules(result, "god-module", [
      {
        id: "default-god-module.ts:god-module:0" as FindingId,
        ruleId: RULES.GOD_MODULE,
        severity: "warning",
        title: "Module exhibits 2 God Module signals",
        message:
          "This module combines dependencies: 13 imported or re-exported modules; dependents: used by 9 modules. Split it into focused modules and reduce dependency concentration.",
        filePath: "default-god-module.ts",
        range: {
          startLine: 1,
          startColumn: 0,
          endLine: 14,
          endColumn: 0,
        },
      },
    ]);
  });

  it("does not report a cohesive module without a configuration file", () => {
    const result = cliQuerier.runScan("tests/SampleProject/WithoutConfig/acceptable-functions.ts");

    cliQuerier.validateScanFoundRules(result, "god-module", []);
  });
});
