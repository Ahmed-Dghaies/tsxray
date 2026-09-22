import { RULES } from "@/rules/constants";
import { runEslintRule } from "@/rules/eslint";
import {
  DEFAULT_NO_UNUSED_VARS_OPTIONS,
  ESLINT_NO_UNUSED_VARS_RULE_ID,
} from "@/rules/implementations/no-unused-vars/consts";
import { parseNoUnusedVarsOptions } from "@/rules/implementations/no-unused-vars/utils";

import type { Rule, RuleContext, RuleResult } from "@/rules/types";

export {
  DEFAULT_NO_UNUSED_VARS_OPTIONS,
  ESLINT_NO_UNUSED_VARS_RULE_ID,
} from "@/rules/implementations/no-unused-vars/consts";
export type {
  ArgumentHandling,
  CaughtErrorHandling,
  NoUnusedVarsOptions,
  VariableScope,
} from "@/rules/implementations/no-unused-vars/types";
export { parseNoUnusedVarsOptions } from "@/rules/implementations/no-unused-vars/utils";

export const noUnusedVarsRule: Rule = {
  id: RULES.NO_UNUSED_VARS,
  name: "No unused variables",
  description: "Flag unused variables, functions, and parameters using ESLint.",
  defaultConfig: {
    enabled: true,
    options: DEFAULT_NO_UNUSED_VARS_OPTIONS,
  },
  check(context: RuleContext): RuleResult {
    return runEslintRule({
      analyzerRuleId: RULES.NO_UNUSED_VARS,
      context,
      eslintOptions: [parseNoUnusedVarsOptions(context.config.options)],
      eslintRuleId: ESLINT_NO_UNUSED_VARS_RULE_ID,
      severity: "warning",
    });
  },
};