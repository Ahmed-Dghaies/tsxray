import type { SourceFile } from "ts-morph";
import type { Finding } from "@/findings/types.js";
import type { Brand } from "@/types/types.js";

export interface RuleConfig {
  enabled: boolean;
  options?: Record<string, unknown>;
}

export interface RuleContext {
  sourceFile: SourceFile;
  filePath: string;
  config: RuleConfig;

  generateId: () => string;
}

export interface RuleResult {
  findings: Finding[];
}

export type RuleId = Brand<string, "RuleId">;

export interface Rule {
  id: RuleId;
  name: string;
  description: string;
  defaultConfig: RuleConfig;

  check(context: RuleContext): RuleResult;
}
