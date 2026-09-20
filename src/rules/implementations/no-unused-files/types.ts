export interface NoUnusedFilesOptions extends Record<string, unknown> {
  entryPoints: string[];
  excludedFiles: string[];
}

export interface ModuleReferenceInfo {
  exportNames: string[];
  incomingReferences: string[];
}

export interface ProjectModuleGraph {
  referencesByFile: Map<string, string[]>;
  importedFiles: Set<string>;
  reExportersByFile: Map<string, string[]>;
}