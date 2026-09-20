import { RULES } from "@/rules/constants";
import { DEFAULT_MAX_LINES } from "@/rules/implementations/no-large-functions/consts";
import { checkNoLargeFunctions } from "@/rules/implementations/no-large-functions/utils";

import type { Rule, RuleContext, RuleResult } from "@/rules/types";

export { DEFAULT_MAX_LINES } from "@/rules/implementations/no-large-functions/consts";
export type { NoLargeFunctionsConfig } from "@/rules/implementations/no-large-functions/types";
export { checkNoLargeFunctions } from "@/rules/implementations/no-large-functions/utils";

export const noLargeFunctionsRule: Rule = {
  id: RULES.NO_LARGE_FUNCTIONS,
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
