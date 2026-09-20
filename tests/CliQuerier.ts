import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { expect } from "vitest";

import type { Finding, FindingsResult, Severity } from "@/findings/types";

export class CliQuerier {
  constructor(private readonly repoRoot = this.getRepoRoot()) {}

  private getRepoRoot(): string {
    return fileURLToPath(new URL("..", import.meta.url));
  }

  public runScan(projectPath: string, extraArgs: string[] = []): FindingsResult {
    const resolvedProjectPath = path.resolve(this.repoRoot, projectPath);
    const output = this.execute([
      "tsx",
      "src/cli/index.ts",
      "scan",
      resolvedProjectPath,
      "--format",
      "json",
      ...extraArgs,
    ]);

    return JSON.parse(output);
  }

  public runTerminalScan(projectPath: string, extraArgs: string[] = []): string {
    const resolvedProjectPath = path.resolve(this.repoRoot, projectPath);

    return this.execute(["tsx", "src/cli/index.ts", "scan", resolvedProjectPath, ...extraArgs]);
  }

  private execute(args: string[]): string {
    const command = process.platform === "win32" ? "npx.cmd" : "npx";

    return execFileSync(command, args, {
      cwd: this.repoRoot,
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  }

  public validateScanFoundRules(
    result: FindingsResult,
    expectedRuleId: string,
    expectedFindings: Finding[],
  ): void {
    const findings = result.findings.filter((finding) => finding.ruleId === expectedRuleId);
    const bySeverity: Record<Severity, number> = {
      error: 0,
      warning: 0,
      info: 0,
      hint: 0,
    };

    for (const finding of findings) {
      bySeverity[finding.severity]++;
    }

    expect(findings).toStrictEqual(expectedFindings);
    expect(result.summary.byRule[expectedRuleId] ?? 0).toBe(findings.length);
    expect({
      total: findings.length,
      bySeverity,
      byRule: findings.length > 0 ? { [expectedRuleId]: findings.length } : {},
    }).toStrictEqual({
      total: expectedFindings.length,
      bySeverity: expectedFindings.reduce<Record<Severity, number>>(
        (summary, finding) => {
          summary[finding.severity]++;
          return summary;
        },
        { error: 0, warning: 0, info: 0, hint: 0 },
      ),
      byRule: expectedFindings.length > 0 ? { [expectedRuleId]: expectedFindings.length } : {},
    });
  }
}
