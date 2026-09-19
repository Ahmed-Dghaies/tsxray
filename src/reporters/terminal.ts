/**
 * Terminal reporter for tsxray
 */

import type { FindingsResult } from "@/findings/types.js";

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[36m",
  green: "\x1b[32m",
  gray: "\x1b[90m",
  bold: "\x1b[1m",
};

export function printTerminal(result: FindingsResult, verbose = false): void {
  console.log(`\n${colors.bold}${colors.blue}tsxray scan results${colors.reset}`);
  console.log(`${colors.gray}${result.analyzedPath}${colors.reset}\n`);

  // Summary
  console.log(`${colors.bold}Summary:${colors.reset}`);
  console.log(`  Files analyzed: ${result.scannedFiles.length}`);
  console.log(`  Total findings: ${colors.bold}${result.summary.total}${colors.reset}\n`);

  // By severity
  if (result.summary.total > 0) {
    console.log(`${colors.bold}Findings by severity:${colors.reset}`);
    if (result.summary.bySeverity.error > 0) {
      console.log(`  ${colors.red}● Error: ${result.summary.bySeverity.error}${colors.reset}`);
    }
    if (result.summary.bySeverity.warning > 0) {
      console.log(
        `  ${colors.yellow}● Warning: ${result.summary.bySeverity.warning}${colors.reset}`,
      );
    }
    if (result.summary.bySeverity.info > 0) {
      console.log(`  ${colors.blue}● Info: ${result.summary.bySeverity.info}${colors.reset}`);
    }
    if (result.summary.bySeverity.hint > 0) {
      console.log(`  ${colors.gray}● Hint: ${result.summary.bySeverity.hint}${colors.reset}`);
    }
    console.log();
  }

  // By rule
  if (Object.keys(result.summary.byRule).length > 0) {
    console.log(`${colors.bold}Findings by rule:${colors.reset}`);
    for (const [rule, count] of Object.entries(result.summary.byRule)) {
      console.log(`  ${rule}: ${count}`);
    }
    console.log();
  }

  // Detailed findings if verbose
  if (verbose && result.findings.length > 0) {
    console.log(`${colors.bold}Detailed findings:${colors.reset}`);
    for (const finding of result.findings) {
      const severityColor =
        finding.severity === "error"
          ? colors.red
          : finding.severity === "warning"
            ? colors.yellow
            : colors.blue;

      console.log(
        `\n  ${severityColor}[${finding.severity.toUpperCase()}]${colors.reset} ${finding.title}`,
      );
      console.log(`    Rule: ${finding.ruleId}`);
      console.log(`    File: ${finding.filePath}:${finding.range.startLine}`);
      console.log(`    ${finding.message}`);
    }
    console.log();
  }

  if (result.findings.length === 0) {
    console.log(`${colors.green}✓ No issues found!${colors.reset}\n`);
  }
}
