export const DEFAULT_GOD_MODULE_OPTIONS = {
  requiredSignals: 2,
  size: {
    enabled: true,
    maxLines: 300,
    maxDeclarations: 30,
    maxFunctionsAndClasses: 15,
    maxExports: 15,
    requiredMetrics: 2,
  },
  dependencies: {
    enabled: true,
    maxCount: 12,
  },
  dependents: {
    enabled: true,
    maxCount: 8,
  },
} as const;