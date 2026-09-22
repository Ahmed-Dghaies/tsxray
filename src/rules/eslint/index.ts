import tsParser from "@typescript-eslint/parser";
import { Linter } from "eslint";

import type { Finding, FindingId, Severity } from "@/findings/types";
import type { RunEslintRuleOptions } from "@/rules/eslint/types";
import type { RuleResult } from "@/rules/types";

export type { EslintBackedRuleConfig, RunEslintRuleOptions } from "@/rules/eslint/types";

const ESLINT_SEVERITY: Record<Linter.Severity, Severity> = {
  0: "hint",
  1: "warning",
  2: "error",
};
const linter = new Linter();

export function runEslintRule({
  analyzerRuleId,
  context,
  eslintOptions,
  eslintPlugins,
  eslintRuleId,
  severity,
}: RunEslintRuleOptions): RuleResult {
  const messages = linter.verify(context.sourceFile.getFullText(), {
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    ...(eslintPlugins ? { plugins: eslintPlugins } : {}),
    rules: {
      [eslintRuleId]: [
        toEslintSeverity(severity),
        ...(eslintOptions ?? []),
      ] as Linter.RuleEntry,
    },
  });

  const findings: Finding[] = messages
    .filter((message) => message.ruleId === eslintRuleId)
    .map((message, index) => ({
      id: `${context.filePath}:${analyzerRuleId}:${index}` as FindingId,
      ruleId: analyzerRuleId,
      severity: ESLINT_SEVERITY[message.severity],
      title: `Resolve ${eslintRuleId} violation`,
      message: message.message,
      filePath: context.filePath,
      range: {
        startLine: message.line,
        startColumn: message.column,
        endLine: message.endLine ?? message.line,
        endColumn: message.endColumn ?? message.column,
      },
    }));

  return { findings };
}

function toEslintSeverity(severity: Severity): Linter.Severity {
  switch (severity) {
    case "error":
      return 2;
    case "warning":
      return 1;
    case "info":
    case "hint":
      return 1;
  }
}