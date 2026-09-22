import type { Severity } from "@/findings/types";
import type { RuleContext, RuleId } from "@/rules/types";
import type { Linter } from "eslint";

export interface EslintBackedRuleConfig {
  analyzerRuleId: RuleId;
  eslintRuleId: string;
  eslintOptions?: unknown[];
  eslintPlugins?: Linter.Config["plugins"];
  severity: Severity;
}

export interface RunEslintRuleOptions extends EslintBackedRuleConfig {
  context: RuleContext;
}