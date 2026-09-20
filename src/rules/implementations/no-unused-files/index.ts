import { RULES } from "@/rules/constants";
import { DEFAULT_NO_UNUSED_FILES_OPTIONS } from "@/rules/implementations/no-unused-files/consts";
import { analyzeModuleReferences } from "@/rules/implementations/no-unused-files/utils";

import type { Finding, FindingId } from "@/findings/types";
import type { Rule, RuleContext, RuleResult } from "@/rules/types";

export { DEFAULT_NO_UNUSED_FILES_OPTIONS } from "@/rules/implementations/no-unused-files/consts";
export type {
  ModuleReferenceInfo,
  NoUnusedFilesOptions,
  ProjectModuleGraph,
} from "@/rules/implementations/no-unused-files/types";
export {
  analyzeModuleReferences,
  parseNoUnusedFilesOptions,
} from "@/rules/implementations/no-unused-files/utils";

export const noUnusedFilesRule: Rule = {
  id: RULES.NO_UNUSED_FILES,
  name: "No unused files",
  description: "Detect exported modules with no incoming references from another analyzed file.",
  defaultConfig: {
    enabled: true,
    options: DEFAULT_NO_UNUSED_FILES_OPTIONS,
  },
  check(context: RuleContext): RuleResult {
    const referenceInfo = analyzeModuleReferences(context);

    if (!referenceInfo) {
      return { findings: [] };
    }

    const exportList = referenceInfo.exportNames.join(", ");
    const unusedReason =
      referenceInfo.incomingReferences.length === 0
        ? "no other analyzed file imports or re-exports it"
        : "it is only re-exported through modules that are not imported or configured as entry points";
    const finding: Finding = {
      id: context.generateId() as FindingId,
      ruleId: RULES.NO_UNUSED_FILES,
      severity: "warning",
      title: "Exported file has no incoming module references",
      message: `Exports detected: ${exportList}. This file is considered unused because ${unusedReason}. Import its public API, add it to an entry-point chain, or configure it as an entry point or excluded file.`,
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