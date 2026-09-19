import type { Finding, FindingsResult, Severity } from "@/findings/types.js";
import type { ScanResult } from "@/core/scanner.js";

export interface AnalyzeOptions {
  verbose?: boolean;
}

/**
 * Analyze a scanned project
 */
export function analyze(scanResult: ScanResult, options: AnalyzeOptions = {}): FindingsResult {
  const { verbose } = options;
  const findings: Finding[] = [];

  if (verbose) {
    console.log(`[Analyzer] Analyzing ${scanResult.files.length} files...`);
    console.log(`[Analyzer] Total lines: ${scanResult.summary.totalLines}`);
  }

  // TODO: Run rules here
  // For example:
  // for (const file of scanResult.files) {
  //   const fileFindings = checkNoLargeFunctions(file);
  //   findings.push(...fileFindings);
  // }

  // Build summary
  const summary = buildSummary(findings);
  const scannedFiles = scanResult.files.map((f) => f.relativePath);

  return {
    findings,
    summary,
    scannedFiles,
    timestamp: new Date().toISOString(),
    analyzedPath: scanResult.rootPath,
  };
}

/**
 * Build summary from findings
 */
function buildSummary(findings: Finding[]) {
  const bySeverity: Record<Severity, number> = {
    error: 0,
    warning: 0,
    info: 0,
    hint: 0,
  };

  const byRule: Record<string, number> = {};

  for (const finding of findings) {
    bySeverity[finding.severity]++;
    byRule[finding.ruleId] = (byRule[finding.ruleId] ?? 0) + 1;
  }

  return {
    total: findings.length,
    bySeverity,
    byRule,
  };
}
