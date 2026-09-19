import type { RuleId } from "@/rules/types.js";
import type { Brand } from "@/types";
import type { SEVERITY } from "./consts.js";

export type Severity = (typeof SEVERITY)[keyof typeof SEVERITY];

export interface SourceRange {
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
}

export type FindingId = Brand<string, "FindingId">;

export interface Finding {
  id: FindingId;
  ruleId: RuleId;
  severity: Severity;
  title: string;
  message: string;
  filePath: string;
  symbolName?: string;
  range: SourceRange;
}

export interface FindingsResult {
  findings: Finding[];
  summary: {
    total: number;
    bySeverity: Record<Severity, number>;
    byRule: Record<string, number>;
  };
  scannedFiles: string[];
  timestamp: string;
  analyzedPath: string;
}
