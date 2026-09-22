import { RULES } from "@/rules/constants";
import {
  getFunctionScopes,
  isBooleanParameter,
} from "@/rules/implementations/boolean-parameter-trap/utils";
import { getFunctionName } from "@/utils/ast-helpers";

import type { Finding, FindingId } from "@/findings/types";
import type { Rule, RuleContext, RuleResult } from "@/rules/types";

export {
  getFunctionScopes,
  isBooleanParameter,
} from "@/rules/implementations/boolean-parameter-trap/utils";

export const booleanParameterTrapRule: Rule = {
  id: RULES.BOOLEAN_PARAMETER_TRAP,
  name: "Boolean parameter trap",
  description: "Flag boolean parameters that make call sites ambiguous.",
  defaultConfig: {
    enabled: true,
    options: {},
  },
  check(context: RuleContext): RuleResult {
    const findings: Finding[] = [];

    for (const scope of getFunctionScopes(context.sourceFile)) {
      const functionName = getFunctionName(scope);

      for (const [position, parameter] of scope.getParameters().entries()) {
        if (!isBooleanParameter(parameter)) {
          continue;
        }

        const parameterName = parameter.getName();
        findings.push({
          id: `${context.filePath}:boolean-parameter:${findings.length}` as FindingId,
          ruleId: RULES.BOOLEAN_PARAMETER_TRAP,
          severity: "warning",
          title: functionName
            ? `Boolean parameter "${parameterName}" in function "${functionName}" creates ambiguous call sites`
            : `Boolean parameter "${parameterName}" creates ambiguous call sites`,
          message: `Boolean parameter at position ${position} makes call sites unclear. Replace it with an options object, an enum, or separate functions that express the behavior by name.`,
          filePath: context.filePath,
          symbolName: functionName ? `${functionName}.${parameterName}` : parameterName,
          range: {
            startLine: parameter.getStartLineNumber(),
            startColumn: 0,
            endLine: parameter.getEndLineNumber(),
            endColumn: 0,
          },
        });
      }
    }

    return { findings };
  },
};