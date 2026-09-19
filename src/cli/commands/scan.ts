/**
 * Scan command for tsxray
 */

import { Command } from "commander";
import { scanProject } from "@/core/scanner.js";
import { analyze } from "@/core/analyzer.js";
import { printTerminal } from "@/reporters/terminal.js";
import { formatJson, writeJsonToFile } from "@/reporters/json.js";
import * as fs from "fs";

export interface ScanCommandOptions {
  format?: "terminal" | "json";
  output?: string;
  verbose?: boolean;
}

export function createScanCommand(): Command {
  const command = new Command("scan")
    .description("Scan a TypeScript project")
    .argument("<path>", "Path to scan")
    .option("-f, --format <format>", "Output format (terminal, json)", "terminal")
    .option("-o, --output <file>", "Save output to file")
    .option("-v, --verbose", "Verbose output", false)
    .action(async (targetPath: string, options: ScanCommandOptions) => {
      await runScan(targetPath, options);
    });

  return command;
}

async function runScan(targetPath: string, options: ScanCommandOptions): Promise<void> {
  const { format = "terminal", output, verbose } = options;

  try {
    // Check if path exists
    if (!fs.existsSync(targetPath)) {
      console.error(`Error: Path not found: ${targetPath}`);
      process.exit(1);
    }

    if (verbose) {
      console.log(`[Scan] Scanning: ${targetPath}`);
      console.log(`[Scan] Format: ${format}`);
    }

    // Scan
    const scanResult = scanProject(targetPath);

    if (verbose) {
      console.log(`[Scan] Found ${scanResult.summary.totalFiles} files`);
      console.log(`[Scan] Total lines: ${scanResult.summary.totalLines}`);
    }

    // Analyze
    const analyzeResult = analyze(scanResult, { verbose });

    // Output
    switch (format) {
      case "json": {
        const json = formatJson(analyzeResult, true);
        if (output) {
          writeJsonToFile(analyzeResult, output, true);
          console.log(`✓ Results saved to ${output}`);
        } else {
          console.log(json);
        }
        break;
      }
      case "terminal":
      default: {
        printTerminal(analyzeResult, verbose);
        break;
      }
    }

    // Cleanup
    scanResult.project.dispose();
  } catch (error) {
    console.error("Error during scan:", error);
    process.exit(1);
  }
}
