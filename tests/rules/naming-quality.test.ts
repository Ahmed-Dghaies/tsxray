import { describe, it } from "vitest";

import { RULES } from "@/rules/constants";

import { CliQuerier } from "../CliQuerier";
import { useFakeTimers } from "../utilities";

import type { FindingId } from "@/findings/types";

const cliQuerier = new CliQuerier();

describe("naming-quality rule via CLI scan", () => {
  useFakeTimers();

  it("uses AST roles and semantic types with conservative context exemptions", () => {
    const result = cliQuerier.runScan("tests/SampleProject/WithoutConfig/z-naming-quality.ts");

    cliQuerier.validateScanFoundRules(result, RULES.NAMING_QUALITY, [
      {
        id: ":naming-quality:boolean:0" as FindingId,
        ruleId: RULES.NAMING_QUALITY,
        severity: "warning",
        title: 'Boolean identifier "flag" has a vague name',
        message:
          'Boolean identifier "flag" has a vague name. Consider a name that describes the boolean state or condition.',
        filePath: "",
        symbolName: "flag",
        range: { startLine: 1, startColumn: 0, endLine: 1, endColumn: 0 },
      },
      {
        id: ":naming-quality:negative-boolean:1" as FindingId,
        ruleId: RULES.NAMING_QUALITY,
        severity: "warning",
        title: 'Boolean identifier "isNotDisabled" uses confusing negation',
        message:
          '"isNotDisabled" contains an unnecessarily negative boolean construction. Consider "isEnabled".',
        filePath: "",
        symbolName: "isNotDisabled",
        range: { startLine: 3, startColumn: 0, endLine: 3, endColumn: 0 },
      },
      {
        id: ":naming-quality:type-suffix:2" as FindingId,
        ruleId: RULES.NAMING_QUALITY,
        severity: "warning",
        title: 'Identifier "usersArray" exposes its implementation type',
        message: '"usersArray" exposes the implementation type in the identifier. Consider "users".',
        filePath: "",
        symbolName: "usersArray",
        range: { startLine: 4, startColumn: 0, endLine: 4, endColumn: 0 },
      },
      {
        id: ":naming-quality:boolean-function:3" as FindingId,
        ruleId: RULES.NAMING_QUALITY,
        severity: "warning",
        title: 'Boolean function "user" has a value-like name',
        message:
          'Boolean function "user" does not communicate that it is a predicate. Consider a name such as "isUser".',
        filePath: "",
        symbolName: "user",
        range: { startLine: 6, startColumn: 0, endLine: 6, endColumn: 0 },
      },
      {
        id: ":naming-quality:generic-parameter:4" as FindingId,
        ruleId: RULES.NAMING_QUALITY,
        severity: "warning",
        title: 'Parameter "data" is too generic',
        message: 'Parameter "data" is too generic. Consider a name that describes its purpose.',
        filePath: "",
        symbolName: "data",
        range: { startLine: 10, startColumn: 0, endLine: 10, endColumn: 0 },
      },
      {
        id: ":naming-quality:vague-name:5" as FindingId,
        ruleId: RULES.NAMING_QUALITY,
        severity: "warning",
        title: 'Identifier "result" is vague',
        message:
          'Identifier "result" provides little information about what it represents. Consider a more descriptive name.',
        filePath: "",
        symbolName: "result",
        range: { startLine: 11, startColumn: 0, endLine: 11, endColumn: 0 },
      },
      {
        id: ":naming-quality:event-handler:6" as FindingId,
        ruleId: RULES.NAMING_QUALITY,
        severity: "warning",
        title: 'Event handler "click" does not communicate that it handles an event',
        message:
          'Event handler "click" should follow an accepted handler convention, such as "handleClick".',
        filePath: "",
        symbolName: "click",
        range: { startLine: 20, startColumn: 0, endLine: 20, endColumn: 0 },
      },
    ]);
  });

  it("honors file-level suppression", () => {
    const result = cliQuerier.runScan(
      "tests/SampleProject/WithoutConfig/z-disabled-naming-quality.ts",
    );
    cliQuerier.validateScanFoundRules(result, RULES.NAMING_QUALITY, []);
  });

  it("validates and applies category and list configuration", () => {
    const result = cliQuerier.runScan("tests/SampleProject/WithConfig");

    cliQuerier.validateScanFoundRules(result, RULES.NAMING_QUALITY, [
      {
        id: "z-configurable-naming-quality.ts:naming-quality:boolean:0" as FindingId,
        ruleId: RULES.NAMING_QUALITY,
        severity: "warning",
        title: 'Boolean identifier "permitted" has a vague name',
        message:
          'Boolean identifier "permitted" has a vague name. Consider a name that describes the boolean state or condition.',
        filePath: "z-configurable-naming-quality.ts",
        symbolName: "permitted",
        range: { startLine: 1, startColumn: 0, endLine: 1, endColumn: 0 },
      },
      {
        id: "z-configurable-naming-quality.ts:naming-quality:abbreviation:1" as FindingId,
        ruleId: RULES.NAMING_QUALITY,
        severity: "warning",
        title: 'Identifier "usr" contains an unclear abbreviation',
        message:
          '"usr" in "usr" may reduce readability. Use a clearer term or add it to acceptedAbbreviations.',
        filePath: "z-configurable-naming-quality.ts",
        symbolName: "usr",
        range: { startLine: 2, startColumn: 0, endLine: 2, endColumn: 0 },
      },
      {
        id: "z-configurable-naming-quality.ts:naming-quality:generic-parameter:2" as FindingId,
        ruleId: RULES.NAMING_QUALITY,
        severity: "warning",
        title: 'Parameter "payload" is too generic',
        message: 'Parameter "payload" is too generic. Consider a name that describes its purpose.',
        filePath: "z-configurable-naming-quality.ts",
        symbolName: "payload",
        range: { startLine: 5, startColumn: 0, endLine: 5, endColumn: 0 },
      },
    ]);
  });
});