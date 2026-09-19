import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { expect } from "vitest";

import type { FindingsResult } from "@/findings/types";

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

  public validateScanFoundRules(result: FindingsResult, expectedRuleIds: string[] = []): void {
    expect(result.summary.total).toBeGreaterThanOrEqual(expectedRuleIds.length);

    if (expectedRuleIds.length > 0) {
      expect(result.findings).toEqual(
        expect.arrayContaining(
          expectedRuleIds.map((ruleId) =>
            expect.objectContaining({
              ruleId,
            }),
          ),
        ),
      );
    }
  }
}
