import { isRuleDisabledForFile } from "@/rules/directives";
import { builtInRules } from "@/rules/implementations/index";

import { loadConfig } from "./config-loader";

import type { ScanResult } from "@/core/scanner";
import type { Finding, FindingsResult, Severity } from "@/findings/types";

export interface AnalyzeOptions {
  verbose?: boolean;
}

/**
 * Analyze a scanned project
 */
export function analyze(scanResult: ScanResult, options: AnalyzeOptions = {}): FindingsResult {
  const { verbose } = options;
  const findings: Finding[] = [];
  const config = loadConfig(scanResult.rootPath);

  if (verbose) {
    console.log(`[Analyzer] Analyzing ${scanResult.files.length} files...`);
    console.log(`[Analyzer] Total lines: ${scanResult.summary.totalLines}`);
  }

  for (const file of scanResult.files) {
    for (const rule of builtInRules) {
      const configuredRule = config.rules?.[rule.id];
      const enabled = configuredRule?.enabled ?? rule.defaultConfig.enabled;

      if (!enabled || isRuleDisabledForFile(file.sourceFile, rule.id)) {
        continue;
      }

      const result = rule.check({
        sourceFile: file.sourceFile,
        filePath: file.relativePath,
        config: {
          enabled,
          options: {
            ...rule.defaultConfig.options,
            ...configuredRule?.options,
          },
        },
        generateId: () => `${file.relativePath}:${rule.id}:${findings.length}`,
      });

      findings.push(...result.findings);
    }
  }

  // Build summary
  const summary = buildSummary(findings);
  const scannedFiles = scanResult.files.map((f) => f.relativePath);

  return {
    findings,
    summary,
    scannedFiles,
    timestamp: getTimestamp(),
    analyzedPath: scanResult.rootPath,
  };
}

function getTimestamp(): string {
  const systemTime = process.env.TSXRAY_SYSTEM_TIME;

  return systemTime ? new Date(systemTime).toISOString() : new Date().toISOString();
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
