import type { Finding } from "@/findings/types";
import type { RULES } from "@/rules/constants";
import type { SourceFile } from "ts-morph";

export interface RuleConfig {
  enabled: boolean;
  options?: Record<string, unknown>;
}

export interface RuleContext {
  sourceFile: SourceFile;
  projectSourceFiles?: readonly SourceFile[];
  filePath: string;
  config: RuleConfig;

  generateId: () => string;
}

export interface RuleResult {
  findings: Finding[];
}

export type RuleId = (typeof RULES)[keyof typeof RULES];

export interface Rule {
  id: RuleId;
  name: string;
  description: string;
  defaultConfig: RuleConfig;

  check(context: RuleContext): RuleResult;
}
