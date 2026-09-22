import { describe, it } from "vitest";

import { RULES } from "@/rules/constants";

import { CliQuerier } from "../CliQuerier";
import { useFakeTimers } from "../utilities";

import type { FindingId } from "@/findings/types";

const cliQuerier = new CliQuerier();

describe("boolean-parameter-trap rule via CLI scan", () => {
  useFakeTimers();

  it("Flags boolean parameters and boolean defaults", () => {
    const result = cliQuerier.runScan(
      "tests/SampleProject/WithoutConfig/boolean-parameters.ts",
    );

    cliQuerier.validateScanFoundRules(result, RULES.BOOLEAN_PARAMETER_TRAP, [
      {
        id: ":boolean-parameter:0" as FindingId,
        ruleId: RULES.BOOLEAN_PARAMETER_TRAP,
        severity: "warning",
        title:
          'Boolean parameter "isAdmin" in function "createUser" creates ambiguous call sites',
        message:
          "Boolean parameter at position 1 makes call sites unclear. Replace it with an options object, an enum, or separate functions that express the behavior by name.",
        filePath: "",
        symbolName: "createUser.isAdmin",
        range: {
          startLine: 1,
          startColumn: 0,
          endLine: 1,
          endColumn: 0,
        },
      },
      {
        id: ":boolean-parameter:1" as FindingId,
        ruleId: RULES.BOOLEAN_PARAMETER_TRAP,
        severity: "warning",
        title: 'Boolean parameter "persistent" creates ambiguous call sites',
        message:
          "Boolean parameter at position 0 makes call sites unclear. Replace it with an options object, an enum, or separate functions that express the behavior by name.",
        filePath: "",
        symbolName: "persistent",
        range: {
          startLine: 8,
          startColumn: 0,
          endLine: 8,
          endColumn: 0,
        },
      },
    ]);
  });

  it("Does not flag booleans inside an options object", () => {
    const result = cliQuerier.runScan(
      "tests/SampleProject/WithoutConfig/acceptable-boolean-options.ts",
    );

    cliQuerier.validateScanFoundRules(result, RULES.BOOLEAN_PARAMETER_TRAP, []);
  });

  it("Flags boolean parameters in a project with configuration", () => {
    const result = cliQuerier.runScan("tests/SampleProject/WithConfig");

    cliQuerier.validateScanFoundRules(result, RULES.BOOLEAN_PARAMETER_TRAP, [
      {
        id: "configured-boolean-parameters.ts:boolean-parameter:0" as FindingId,
        ruleId: RULES.BOOLEAN_PARAMETER_TRAP,
        severity: "warning",
        title:
          'Boolean parameter "verbose" in function "logMessage" creates ambiguous call sites',
        message:
          "Boolean parameter at position 0 makes call sites unclear. Replace it with an options object, an enum, or separate functions that express the behavior by name.",
        filePath: "configured-boolean-parameters.ts",
        symbolName: "logMessage.verbose",
        range: {
          startLine: 1,
          startColumn: 0,
          endLine: 1,
          endColumn: 0,
        },
      },
      {
        id: "configured-boolean-parameters.ts:boolean-parameter:1" as FindingId,
        ruleId: RULES.BOOLEAN_PARAMETER_TRAP,
        severity: "warning",
        title:
          'Boolean parameter "notify" in function "updateUser" creates ambiguous call sites',
        message:
          "Boolean parameter at position 1 makes call sites unclear. Replace it with an options object, an enum, or separate functions that express the behavior by name.",
        filePath: "configured-boolean-parameters.ts",
        symbolName: "updateUser.notify",
        range: {
          startLine: 5,
          startColumn: 0,
          endLine: 5,
          endColumn: 0,
        },
      },
    ]);
  });

  it("Honors the file disable directive", () => {
    const result = cliQuerier.runScan(
      "tests/SampleProject/WithoutConfig/disabled-boolean-parameters.ts",
    );

    cliQuerier.validateScanFoundRules(result, RULES.BOOLEAN_PARAMETER_TRAP, []);
  });
});