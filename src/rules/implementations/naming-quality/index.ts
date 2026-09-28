import { RULES } from "@/rules/constants";
import { DEFAULT_NAMING_QUALITY_OPTIONS } from "@/rules/implementations/naming-quality/consts";
import {
  analyzeNamingQuality,
  parseNamingQualityOptions,
} from "@/rules/implementations/naming-quality/utils";

import type { Finding, FindingId } from "@/findings/types";
import type { Rule, RuleContext, RuleResult } from "@/rules/types";

export * from "@/rules/implementations/naming-quality/consts";
export type * from "@/rules/implementations/naming-quality/types";
export { analyzeNamingQuality, parseNamingQualityOptions } from "@/rules/implementations/naming-quality/utils";

export const namingQualityRule: Rule = {
  id: RULES.NAMING_QUALITY,
  name: "Naming quality",
  description: "Detect ambiguous, misleading, or implementation-oriented identifier names.",
  defaultConfig: {
    enabled: true,
    options: DEFAULT_NAMING_QUALITY_OPTIONS,
  },
  check(context: RuleContext): RuleResult {
    const options = parseNamingQualityOptions(context.config.options);
    const findings: Finding[] = analyzeNamingQuality(context.sourceFile, options).map(
      (diagnostic, index) => ({
        id: `${context.filePath}:naming-quality:${diagnostic.problem}:${index}` as FindingId,
        ruleId: RULES.NAMING_QUALITY,
        severity: "warning",
        title: diagnostic.title,
        message: diagnostic.message,
        filePath: context.filePath,
        symbolName: diagnostic.name,
        range: {
          startLine: diagnostic.line,
          startColumn: 0,
          endLine: diagnostic.line,
          endColumn: 0,
        },
      }),
    );

    return { findings };
  },
};