import type { NoUnusedFilesOptions } from "@/rules/implementations/no-unused-files/types";

export const DEFAULT_NO_UNUSED_FILES_OPTIONS: NoUnusedFilesOptions = {
  entryPoints: [
    "**/main.ts",
    "**/main.tsx",
    "**/main.js",
    "**/main.jsx",
    "**/index.ts",
    "**/index.tsx",
    "**/index.js",
    "**/index.jsx",
  ],
  excludedFiles: [
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/*.spec.ts",
    "**/*.spec.tsx",
    "**/__tests__/**",
    "**/generated/**",
  ],
};