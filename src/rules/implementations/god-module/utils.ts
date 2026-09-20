import { Node } from "ts-morph";

import { DEFAULT_GOD_MODULE_OPTIONS } from "@/rules/implementations/god-module/consts";
import { booleanOption, objectOption, positiveInteger, positiveNumber } from "@/utils/options";

import type {
  GodModuleOptions,
  ModuleMetrics,
  ProjectGraph,
  TriggeredSignal,
} from "@/rules/implementations/god-module/types";
import type { RuleContext } from "@/rules/types";
import type { SourceFile } from "ts-morph";

const projectGraphCache = new WeakMap<readonly SourceFile[], ProjectGraph>();

/** Parses and validates God Module options, falling back to defaults for invalid values. */
export function parseGodModuleOptions(options: Record<string, unknown> = {}): GodModuleOptions {
  const defaults = DEFAULT_GOD_MODULE_OPTIONS;
  const size = objectOption(options.size);
  const dependencies = objectOption(options.dependencies);
  const dependents = objectOption(options.dependents);

  return {
    requiredSignals: positiveInteger(options.requiredSignals, defaults.requiredSignals),
    size: {
      enabled: booleanOption(size.enabled, defaults.size.enabled),
      maxLines: positiveNumber(size.maxLines, defaults.size.maxLines),
      maxDeclarations: positiveNumber(size.maxDeclarations, defaults.size.maxDeclarations),
      maxFunctionsAndClasses: positiveNumber(
        size.maxFunctionsAndClasses,
        defaults.size.maxFunctionsAndClasses,
      ),
      maxExports: positiveNumber(size.maxExports, defaults.size.maxExports),
      requiredMetrics: positiveInteger(size.requiredMetrics, defaults.size.requiredMetrics),
    },
    dependencies: {
      enabled: booleanOption(dependencies.enabled, defaults.dependencies.enabled),
      maxCount: positiveNumber(dependencies.maxCount, defaults.dependencies.maxCount),
    },
    dependents: {
      enabled: booleanOption(dependents.enabled, defaults.dependents.enabled),
      maxCount: positiveNumber(dependents.maxCount, defaults.dependents.maxCount),
    },
  };
}

/** Collects the unique internal source files imported or re-exported by a module. */
function getDependencySourceFiles(sourceFile: SourceFile): SourceFile[] {
  const dependencies = new Map<string, SourceFile>();

  for (const declaration of sourceFile.getImportDeclarations()) {
    const dependency = declaration.getModuleSpecifierSourceFile();

    if (dependency) {
      dependencies.set(dependency.getFilePath(), dependency);
    }
  }

  for (const declaration of sourceFile.getExportDeclarations()) {
    const dependency = declaration.getModuleSpecifierSourceFile();

    if (dependency) {
      dependencies.set(dependency.getFilePath(), dependency);
    }
  }

  return [...dependencies.values()];
}

/** Builds and caches outgoing dependencies and incoming dependent counts for a project. */
function getProjectGraph(projectSourceFiles: readonly SourceFile[]): ProjectGraph {
  const cachedGraph = projectGraphCache.get(projectSourceFiles);

  if (cachedGraph) {
    return cachedGraph;
  }

  const dependenciesByFile = new Map<string, SourceFile[]>();
  const dependentsByFile = new Map<string, number>();

  for (const sourceFile of projectSourceFiles) {
    const dependencies = getDependencySourceFiles(sourceFile);
    dependenciesByFile.set(sourceFile.getFilePath(), dependencies);

    for (const dependency of dependencies) {
      const dependencyPath = dependency.getFilePath();
      dependentsByFile.set(dependencyPath, (dependentsByFile.get(dependencyPath) ?? 0) + 1);
    }
  }

  const graph = { dependenciesByFile, dependentsByFile };
  projectGraphCache.set(projectSourceFiles, graph);

  return graph;
}

/** Measures the size and incoming and outgoing dependency counts of a module. */
function collectMetrics(context: RuleContext): ModuleMetrics {
  const statements = context.sourceFile.getStatements();
  const projectSourceFiles = context.projectSourceFiles ?? [context.sourceFile];
  const projectGraph = getProjectGraph(projectSourceFiles);
  const sourceFilePath = context.sourceFile.getFilePath();
  const dependencies = projectGraph.dependenciesByFile.get(sourceFilePath) ?? [];
  const declarations = statements.filter(
    (statement) =>
      Node.isVariableStatement(statement) ||
      Node.isFunctionDeclaration(statement) ||
      Node.isClassDeclaration(statement) ||
      Node.isInterfaceDeclaration(statement) ||
      Node.isTypeAliasDeclaration(statement) ||
      Node.isEnumDeclaration(statement) ||
      Node.isModuleDeclaration(statement),
  ).length;
  const functionsAndClasses = statements.filter(
    (statement) => Node.isFunctionDeclaration(statement) || Node.isClassDeclaration(statement),
  ).length;

  return {
    lines: context.sourceFile.getEndLineNumber(),
    declarations,
    functionsAndClasses,
    exports: context.sourceFile.getExportSymbols().length,
    dependencyCount: dependencies.length,
    dependentCount: projectGraph.dependentsByFile.get(sourceFilePath) ?? 0,
  };
}

/** Returns each enabled God Module signal whose configured threshold is exceeded. */
export function getTriggeredSignals(
  metrics: ModuleMetrics,
  options: GodModuleOptions,
): TriggeredSignal[] {
  const signals: TriggeredSignal[] = [];

  if (options.size.enabled) {
    const exceededSizeMetrics = [
      metrics.lines > options.size.maxLines && `${metrics.lines} lines`,
      metrics.declarations > options.size.maxDeclarations && `${metrics.declarations} declarations`,
      metrics.functionsAndClasses > options.size.maxFunctionsAndClasses &&
        `${metrics.functionsAndClasses} functions/classes`,
      metrics.exports > options.size.maxExports && `${metrics.exports} exports`,
    ].filter((detail): detail is string => Boolean(detail));

    if (exceededSizeMetrics.length >= options.size.requiredMetrics) {
      signals.push({ name: "size", detail: exceededSizeMetrics.join(", ") });
    }
  }

  if (options.dependencies.enabled && metrics.dependencyCount > options.dependencies.maxCount) {
    signals.push({
      name: "dependencies",
      detail: `${metrics.dependencyCount} imported or re-exported modules`,
    });
  }

  if (options.dependents.enabled && metrics.dependentCount > options.dependents.maxCount) {
    signals.push({ name: "dependents", detail: `used by ${metrics.dependentCount} modules` });
  }

  return signals;
}

/** Determines whether enough independent signals fired to classify a module as a God Module. */
export function shouldReportGodModule(
  signals: TriggeredSignal[],
  requiredSignals: number,
): boolean {
  return signals.length >= Math.max(2, requiredSignals);
}

/** Produces the validated options, measured metrics, and triggered signals for a module. */
export function analyzeGodModule(context: RuleContext): {
  metrics: ModuleMetrics;
  signals: TriggeredSignal[];
  options: GodModuleOptions;
} {
  const options = parseGodModuleOptions(context.config.options);
  const metrics = collectMetrics(context);

  return {
    metrics,
    signals: getTriggeredSignals(metrics, options),
    options,
  };
}
