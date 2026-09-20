import { RULES } from "@/rules/constants";
import {
  DEFAULT_EXCLUDED_CONSTRUCTS,
  DEFAULT_MAX_DEPTH,
} from "@/rules/implementations/no-deep-nesting/consts";
import {
  analyzeNesting,
  getNestingScopes,
  parseNoDeepNestingOptions,
} from "@/rules/implementations/no-deep-nesting/utils";
import { getFunctionName } from "@/utils/ast-helpers";

import type { Finding, FindingId } from "@/findings/types";
import type { Rule, RuleContext, RuleResult } from "@/rules/types";

export {
  DEFAULT_EXCLUDED_CONSTRUCTS,
  DEFAULT_MAX_DEPTH,
  NESTING_CONSTRUCTS,
} from "@/rules/implementations/no-deep-nesting/consts";
export type {
  NestingAnalysis,
  NestingConstruct,
  NoDeepNestingOptions,
} from "@/rules/implementations/no-deep-nesting/types";
export {
  analyzeNesting,
  getNestingScopes,
  parseNoDeepNestingOptions,
} from "@/rules/implementations/no-deep-nesting/utils";

export const noDeepNestingRule: Rule = {
  id: RULES.NO_DEEP_NESTING,
  name: "No deep nesting",
  description: "Flag function scopes whose control-flow nesting exceeds the configured depth.",
  defaultConfig: {
    enabled: true,
    options: {
      maxDepth: DEFAULT_MAX_DEPTH,
      excludedConstructs: DEFAULT_EXCLUDED_CONSTRUCTS,
    },
  },
  check(context: RuleContext): RuleResult {
    const options = parseNoDeepNestingOptions(context.config.options);
    const findings: Finding[] = [];

    for (const scope of getNestingScopes(context.sourceFile)) {
      const analysis = analyzeNesting(scope, options.excludedConstructs);
      if (analysis.depth <= options.maxDepth || !analysis.deepestNode) {
        continue;
      }

      const name = getFunctionName(scope);
      const constructDetails = analysis.constructs.join(" > ");
      findings.push({
        id: `${context.filePath}:deep-nesting:${findings.length}` as FindingId,
        ruleId: RULES.NO_DEEP_NESTING,
        severity: "warning",
        title: name
          ? `Function "${name}" is nested too deeply (depth ${analysis.depth})`
          : `Anonymous function is nested too deeply (depth ${analysis.depth})`,
        message: `Control-flow nesting depth is ${analysis.depth}, exceeding the configured maximum of ${options.maxDepth}. Path: ${constructDetails}. Extract nested logic into focused functions or use early returns.`,
        filePath: context.filePath,
        symbolName: name,
        range: {
          startLine: analysis.deepestNode.getStartLineNumber(),
          startColumn: 0,
          endLine: analysis.deepestNode.getEndLineNumber(),
          endColumn: 0,
        },
      });
    }

    return { findings };
  },
};