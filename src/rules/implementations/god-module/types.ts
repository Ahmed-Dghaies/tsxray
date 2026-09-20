import type { SourceFile } from "ts-morph";

export interface GodModuleOptions {
  requiredSignals: number;
  size: {
    enabled: boolean;
    maxLines: number;
    maxDeclarations: number;
    maxFunctionsAndClasses: number;
    maxExports: number;
    requiredMetrics: number;
  };
  dependencies: {
    enabled: boolean;
    maxCount: number;
  };
  dependents: {
    enabled: boolean;
    maxCount: number;
  };
}

export interface ModuleMetrics {
  lines: number;
  declarations: number;
  functionsAndClasses: number;
  exports: number;
  dependencyCount: number;
  dependentCount: number;
}

export interface TriggeredSignal {
  name: string;
  detail: string;
}

export interface ProjectGraph {
  dependenciesByFile: Map<string, SourceFile[]>;
  dependentsByFile: Map<string, number>;
}
