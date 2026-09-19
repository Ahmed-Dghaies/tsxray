/**
 * TypeScript project loader for tsxray
 */

import { Project, SourceFile } from "ts-morph";
import * as path from "path";
import * as fs from "fs";

export interface LoadedProject {
  project: Project;
  sourceFiles: SourceFile[];
  rootPath: string;

  dispose: () => void;
}

/**
 * Load a TypeScript project
 */
export function loadProject(rootPath: string): LoadedProject {
  const absoluteRoot = path.resolve(rootPath);

  // Check if path is file or directory
  const stats = fs.statSync(absoluteRoot);
  const isFile = stats.isFile();

  // Find tsconfig.json
  let tsConfig: string | undefined;
  if (!isFile) {
    const tsconfigPath = path.join(absoluteRoot, "tsconfig.json");
    if (fs.existsSync(tsconfigPath)) {
      tsConfig = tsconfigPath;
    }
  }

  // Create ts-morph project
  const project = new Project({
    tsConfigFilePath: tsConfig,
    skipAddingFilesFromTsConfig: !tsConfig || isFile,
    compilerOptions: {
      noEmit: true,
      strict: false,
      allowJs: true,
    },
  });

  // Add files
  if (isFile) {
    project.addSourceFileAtPath(absoluteRoot);
  } else {
    // Add all TS files
    project.addSourceFilesAtPaths(`${absoluteRoot}/**/*.ts`);
    project.addSourceFilesAtPaths(`${absoluteRoot}/**/*.tsx`);
  }

  const sourceFiles = project.getSourceFiles();

  return {
    project,
    sourceFiles,
    rootPath: absoluteRoot,
    dispose: () => {
      // Clean up resources
      // ts-morph projects are garbage collected
    },
  };
}

/**
 * Get relative path from root
 */
export function getRelativePath(filePath: string, rootPath: string): string {
  return path.relative(rootPath, filePath);
}
