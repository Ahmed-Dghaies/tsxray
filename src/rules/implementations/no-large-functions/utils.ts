import { RULES } from "@/rules/constants";
import { DEFAULT_MAX_LINES } from "@/rules/implementations/no-large-functions/consts";
import { getFunctionLineCount, getFunctionName, getFunctions } from "@/utils/ast-helpers";

import type { ScannedFile } from "@/core/scanner";
import type { Finding, FindingId } from "@/findings/types";
import type { NoLargeFunctionsConfig } from "@/rules/implementations/no-large-functions/types";

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
        ruleId: RULES.NO_LARGE_FUNCTIONS,
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
