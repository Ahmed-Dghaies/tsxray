import { DEFAULT_NO_UNUSED_FILES_OPTIONS } from "@/rules/implementations/no-unused-files/consts";
import { stringArrayOption } from "@/utils/options";

import type {
  ModuleReferenceInfo,
  NoUnusedFilesOptions,
  ProjectModuleGraph,
} from "@/rules/implementations/no-unused-files/types";
import type { RuleContext } from "@/rules/types";
import type { SourceFile } from "ts-morph";

const projectGraphCache = new WeakMap<readonly SourceFile[], ProjectModuleGraph>();

export function parseNoUnusedFilesOptions(
  options: Record<string, unknown> = {},
): NoUnusedFilesOptions {
  return {
    entryPoints: stringArrayOption(
      options.entryPoints,
      DEFAULT_NO_UNUSED_FILES_OPTIONS.entryPoints,
    ),
    excludedFiles: stringArrayOption(
      options.excludedFiles,
      DEFAULT_NO_UNUSED_FILES_OPTIONS.excludedFiles,
    ),
  };
}

function globToRegExp(pattern: string): RegExp {
  const normalizedPattern = pattern.replace(/\\/g, "/").replace(/^\.\//, "");
  let expression = normalizedPattern.includes("/") ? "" : "(?:.*/)?";

  for (let index = 0; index < normalizedPattern.length; index++) {
    const character = normalizedPattern[index];

    if (character === "*" && normalizedPattern[index + 1] === "*") {
      if (normalizedPattern[index + 2] === "/") {
        expression += "(?:.*/)?";
        index += 2;
      } else {
        expression += ".*";
        index++;
      }
    } else if (character === "*") {
      expression += "[^/]*";
    } else if (character === "?") {
      expression += "[^/]";
    } else {
      expression += character.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");
    }
  }

  return new RegExp(`^${expression}$`);
}

function matchesAnyPattern(filePath: string, patterns: readonly string[]): boolean {
  const normalizedPath = filePath.replace(/\\/g, "/").replace(/^\.\//, "");
  return patterns.some((pattern) => globToRegExp(pattern).test(normalizedPath));
}

function getProjectModuleGraph(projectSourceFiles: readonly SourceFile[]): ProjectModuleGraph {
  const cachedGraph = projectGraphCache.get(projectSourceFiles);

  if (cachedGraph) {
    return cachedGraph;
  }

  const referencesByFile = new Map<string, string[]>();
  const importedFiles = new Set<string>();
  const reExportersByFile = new Map<string, string[]>();

  for (const sourceFile of projectSourceFiles) {
    for (const declaration of sourceFile.getImportDeclarations()) {
      const dependency = declaration.getModuleSpecifierSourceFile();

      if (!dependency) {
        continue;
      }

      const dependencyPath = dependency.getFilePath();

      if (dependencyPath === sourceFile.getFilePath()) {
        continue;
      }

      const references = referencesByFile.get(dependencyPath) ?? [];
      references.push(sourceFile.getFilePath());
      referencesByFile.set(dependencyPath, references);
      importedFiles.add(dependencyPath);
    }

    for (const declaration of sourceFile.getExportDeclarations()) {
      const dependency = declaration.getModuleSpecifierSourceFile();

      if (!dependency) {
        continue;
      }

      const dependencyPath = dependency.getFilePath();

      if (dependencyPath === sourceFile.getFilePath()) {
        continue;
      }

      const references = referencesByFile.get(dependencyPath) ?? [];
      references.push(sourceFile.getFilePath());
      referencesByFile.set(dependencyPath, references);

      const reExporters = reExportersByFile.get(dependencyPath) ?? [];
      reExporters.push(sourceFile.getFilePath());
      reExportersByFile.set(dependencyPath, reExporters);
    }
  }

  const graph = { referencesByFile, importedFiles, reExportersByFile };
  projectGraphCache.set(projectSourceFiles, graph);
  return graph;
}

function isConsumedThroughModuleGraph(
  filePath: string,
  graph: ProjectModuleGraph,
  entryPoints: readonly string[],
  analyzedPaths: ReadonlyMap<string, string>,
  visited = new Set<string>(),
): boolean {
  if (visited.has(filePath)) {
    return false;
  }

  visited.add(filePath);

  if (graph.importedFiles.has(filePath)) {
    return true;
  }

  return (graph.reExportersByFile.get(filePath) ?? []).some((reExporterPath) => {
    const relativePath = analyzedPaths.get(reExporterPath);
    return (
      (relativePath !== undefined && matchesAnyPattern(relativePath, entryPoints)) ||
      isConsumedThroughModuleGraph(reExporterPath, graph, entryPoints, analyzedPaths, visited)
    );
  });
}

export function analyzeModuleReferences(context: RuleContext): ModuleReferenceInfo | undefined {
  const options = parseNoUnusedFilesOptions(context.config.options);

  if (
    matchesAnyPattern(context.filePath, options.entryPoints) ||
    matchesAnyPattern(context.filePath, options.excludedFiles)
  ) {
    return undefined;
  }

  const exportNames = context.sourceFile
    .getExportSymbols()
    .map((symbol) => symbol.getName())
    .sort();

  if (exportNames.length === 0) {
    return undefined;
  }

  const projectSourceFiles = context.projectSourceFiles ?? [context.sourceFile];
  const graph = getProjectModuleGraph(projectSourceFiles);
  const analyzedPaths = new Map(
    projectSourceFiles.map((sourceFile) => [
      sourceFile.getFilePath(),
      sourceFile === context.sourceFile ? context.filePath : sourceFile.getBaseName(),
    ]),
  );

  if (
    isConsumedThroughModuleGraph(
      context.sourceFile.getFilePath(),
      graph,
      options.entryPoints,
      analyzedPaths,
    )
  ) {
    return undefined;
  }

  return {
    exportNames,
    incomingReferences: graph.referencesByFile.get(context.sourceFile.getFilePath()) ?? [],
  };
}
