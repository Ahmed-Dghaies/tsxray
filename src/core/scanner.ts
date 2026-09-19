/**
 * Scanner for tsxray
 * Collects all source files from a project.
 */

import { loadProject, getRelativePath, type LoadedProject } from "./project-loader";

import type { SourceFile } from "ts-morph";

export interface ScannedFile {
  sourceFile: SourceFile;
  relativePath: string;
  absolutePath: string;
  lineCount: number;
}

export interface ScanResult {
  files: ScannedFile[];
  rootPath: string;
  project: LoadedProject;
  summary: {
    totalFiles: number;
    totalLines: number;
    byExtension: Record<string, number>;
  };
}

/**
 * Scan a TypeScript project
 */
export function scanProject(rootPath: string): ScanResult {
  const loadedProject = loadProject(rootPath);
  const { sourceFiles, rootPath: absoluteRoot } = loadedProject;

  const files: ScannedFile[] = [];
  const byExtension: Record<string, number> = {};
  let totalLines = 0;

  for (const sourceFile of sourceFiles) {
    const filePath = sourceFile.getFilePath();
    const relativePath = getRelativePath(filePath, absoluteRoot);
    const lineCount = sourceFile.getEndLineNumber();

    // Get extension
    const ext = filePath.endsWith(".tsx") ? ".tsx" : ".ts";
    byExtension[ext] = (byExtension[ext] ?? 0) + 1;

    files.push({
      sourceFile,
      relativePath,
      absolutePath: filePath,
      lineCount,
    });

    totalLines += lineCount;
  }

  return {
    files,
    rootPath: absoluteRoot,
    project: loadedProject,
    summary: {
      totalFiles: files.length,
      totalLines,
      byExtension,
    },
  };
}
