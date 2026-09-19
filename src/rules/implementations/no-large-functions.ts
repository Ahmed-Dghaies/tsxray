/**
 * no-large-functions rule
 *
 * Detects functions that exceed a configurable line threshold.
 */

import { getFunctionLineCount, getFunctionName, getFunctions } from "@/utils/ast-helpers";

import type { ScannedFile } from "@/core/scanner";
import type { Finding, FindingId } from "@/findings/types";
import type { Rule, RuleContext, RuleId, RuleResult } from "@/rules/types";

export const DEFAULT_MAX_LINES = 50;

export interface NoLargeFunctionsConfig {
  maxLines?: number;
}

export function checkNoLargeFunctions(
  file: ScannedFile,
  config: NoLargeFunctionsConfig = {},
): Finding[] {
  const findings: Finding[] = [];
  const maxLines = config.maxLines ?? DEFAULT_MAX_LINES;
  const functions = getFunctions(file.sourceFile);
  let findingId = 0;

  for (const func of functions) {
    const lineCount = getFunctionLineCount(func);

    if (lineCount > maxLines) {
      const name = getFunctionName(func);
      const startLine = func.getStartLineNumber();
      const endLine = func.getEndLineNumber();

      findings.push({
        id: `${file.relativePath}:large-func:${findingId++}` as FindingId,
        ruleId: "no-large-functions" as RuleId,
        severity: "warning",
        title: name
          ? `Function "${name}" is too large (${lineCount} lines)`
          : `Anonymous function is too large (${lineCount} lines)`,
        message: `Function has ${lineCount} lines, exceeds limit of ${maxLines}. Consider extracting parts into helper functions.`,
        filePath: file.relativePath,
        symbolName: name,
        range: {
          startLine,
          startColumn: 0,
          endLine,
          endColumn: 0,
        },
      });
    }
  }

  return findings;
}

export const noLargeFunctionsRule: Rule = {
  id: "no-large-functions" as RuleId,
  name: "No large functions",
  description: "Flag functions whose line count exceeds the configured threshold.",
  defaultConfig: {
    enabled: true,
    options: { maxLines: DEFAULT_MAX_LINES },
  },
  check(context: RuleContext): RuleResult {
    const file = {
      sourceFile: context.sourceFile,
      relativePath: context.filePath,
      absolutePath: context.filePath,
      lineCount: context.sourceFile.getEndLineNumber(),
    };

    const optionValue = context.config.options?.maxLines;
    const maxLines = typeof optionValue === "number" ? optionValue : DEFAULT_MAX_LINES;

    return {
      findings: checkNoLargeFunctions(file, { maxLines }),
    };
  },
};
