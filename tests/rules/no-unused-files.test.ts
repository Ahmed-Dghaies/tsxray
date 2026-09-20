import { describe, it } from "vitest";

import { RULES } from "@/rules/constants";

import { CliQuerier } from "../CliQuerier";
import { useFakeTimers } from "../utilities";

import type { FindingId } from "@/findings/types";

const cliQuerier = new CliQuerier();

describe("no-unused-files rule via CLI scan", () => {
  useFakeTimers();

  it("Detects an exported file with no incoming module references", () => {
    const result = cliQuerier.runScan("tests/SampleProject/WithoutConfig/unused-library.ts");

    cliQuerier.validateScanFoundRules(result, "no-unused-files", [
      {
        id: ":no-unused-files:0" as FindingId,
        ruleId: RULES.NO_UNUSED_FILES,
        severity: "warning",
        title: "Exported file has no incoming module references",
        message:
          "Exports detected: default, unusedValue. This file is considered unused because no other analyzed file imports or re-exports it. Import its public API, add it to an entry-point chain, or configure it as an entry point or excluded file.",
        filePath: "",
        range: {
          startLine: 1,
          startColumn: 0,
          endLine: 5,
          endColumn: 0,
        },
      },
    ]);
  });

  it("Keeps files consumed through a re-export chain and default entry points", () => {
    const result = cliQuerier.runScan("tests/SampleProject/WithoutConfig");
    const protectedPaths = new Set(["reexported-library.ts", "reexport-barrel.ts", "main.ts"]);
    const protectedFindings = result.findings.filter(
      (finding) => finding.ruleId === RULES.NO_UNUSED_FILES && protectedPaths.has(finding.filePath),
    );

    cliQuerier.validateScanFoundRules(
      {
        ...result,
        findings: protectedFindings,
        summary: {
          ...result.summary,
          byRule: { ...result.summary.byRule, [RULES.NO_UNUSED_FILES]: 0 },
        },
      },
      "no-unused-files",
      [],
    );
  });

  it("Detects a file exported by a barrel that is never imported", () => {
    const result = cliQuerier.runScan("tests/SampleProject/WithoutConfig");
    const barrelFindings = result.findings.filter(
      (finding) =>
        finding.ruleId === RULES.NO_UNUSED_FILES &&
        ["barrel-only-library.ts", "unused-barrel.ts"].includes(finding.filePath),
    );

    expect(barrelFindings).toStrictEqual([
      {
        id: "barrel-only-library.ts:no-unused-files:0" as FindingId,
        ruleId: RULES.NO_UNUSED_FILES,
        severity: "warning",
        title: "Exported file has no incoming module references",
        message:
          "Exports detected: barrelOnlyValue. This file is considered unused because it is only re-exported through modules that are not imported or configured as entry points. Import its public API, add it to an entry-point chain, or configure it as an entry point or excluded file.",
        filePath: "barrel-only-library.ts",
        range: {
          startLine: 1,
          startColumn: 0,
          endLine: 1,
          endColumn: 0,
        },
      },
      {
        id: "unused-barrel.ts:no-unused-files:0" as FindingId,
        ruleId: RULES.NO_UNUSED_FILES,
        severity: "warning",
        title: "Exported file has no incoming module references",
        message:
          "Exports detected: barrelOnlyValue. This file is considered unused because no other analyzed file imports or re-exports it. Import its public API, add it to an entry-point chain, or configure it as an entry point or excluded file.",
        filePath: "unused-barrel.ts",
        range: {
          startLine: 1,
          startColumn: 0,
          endLine: 2,
          endColumn: 0,
        },
      },
    ]);
  });

  it("Honors configured entry points and exclusions while reporting other files", () => {
    const result = cliQuerier.runScan("tests/SampleProject/WithConfig");
    const relevantPaths = new Set([
      "configured-unused.ts",
      "configured-root.ts",
      "configured-generated.ts",
    ]);
    const relevantFindings = result.findings.filter(
      (finding) => finding.ruleId === RULES.NO_UNUSED_FILES && relevantPaths.has(finding.filePath),
    );

    cliQuerier.validateScanFoundRules(
      {
        ...result,
        findings: relevantFindings,
        summary: {
          ...result.summary,
          byRule: { ...result.summary.byRule, [RULES.NO_UNUSED_FILES]: 1 },
        },
      },
      "no-unused-files",
      [
        {
          id: "configured-unused.ts:no-unused-files:0" as FindingId,
          ruleId: RULES.NO_UNUSED_FILES,
          severity: "warning",
          title: "Exported file has no incoming module references",
          message:
            "Exports detected: configuredUnused. This file is considered unused because no other analyzed file imports or re-exports it. Import its public API, add it to an entry-point chain, or configure it as an entry point or excluded file.",
          filePath: "configured-unused.ts",
          range: {
            startLine: 1,
            startColumn: 0,
            endLine: 2,
            endColumn: 0,
          },
        },
      ],
    );
  });

  it("Honors file-level suppression", () => {
    const result = cliQuerier.runScan(
      "tests/SampleProject/WithoutConfig/disabled-unused-library.ts",
    );

    cliQuerier.validateScanFoundRules(result, "no-unused-files", []);
  });
});
