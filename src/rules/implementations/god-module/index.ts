import { RULES } from "@/rules/constants";
import { DEFAULT_GOD_MODULE_OPTIONS } from "@/rules/implementations/god-module/consts";
import { analyzeGodModule, shouldReportGodModule } from "@/rules/implementations/god-module/utils";

import type { Finding, FindingId } from "@/findings/types";
import type { Rule, RuleContext, RuleResult } from "@/rules/types";

export { DEFAULT_GOD_MODULE_OPTIONS } from "@/rules/implementations/god-module/consts";
export type {
  GodModuleOptions,
  ModuleMetrics,
  ProjectGraph,
  TriggeredSignal,
} from "@/rules/implementations/god-module/types";
export {
  analyzeGodModule,
  getTriggeredSignals,
  parseGodModuleOptions,
  shouldReportGodModule,
} from "@/rules/implementations/god-module/utils";

export const godModuleRule: Rule = {
  id: RULES.GOD_MODULE,
  name: "God module",
  description: "Detect modules that combine excessive size, dependencies, or dependents.",
  defaultConfig: {
    enabled: true,
    options: DEFAULT_GOD_MODULE_OPTIONS,
  },
  check(context: RuleContext): RuleResult {
    const { options, signals } = analyzeGodModule(context);

    if (!shouldReportGodModule(signals, options.requiredSignals)) {
      return { findings: [] };
    }

    const signalDetails = signals.map((signal) => `${signal.name}: ${signal.detail}`).join("; ");
    const finding: Finding = {
      id: context.generateId() as FindingId,
      ruleId: RULES.GOD_MODULE,
      severity: "warning",
      title: `Module exhibits ${signals.length} God Module signals`,
      message: `This module combines ${signalDetails}. Split it into focused modules and reduce dependency concentration.`,
      filePath: context.filePath,
      range: {
        startLine: 1,
        startColumn: 0,
        endLine: context.sourceFile.getEndLineNumber(),
        endColumn: 0,
      },
    };

    return { findings: [finding] };
  },
};
