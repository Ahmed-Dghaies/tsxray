import fs from "node:fs";
import path from "node:path";

import type { RuleConfig } from "@/rules/types";

export interface TsxrayConfig {
  rules?: Record<string, Partial<RuleConfig>>;
}

export function loadConfig(rootPath: string): TsxrayConfig {
  const configPath = path.join(rootPath, "tsxray.config.json");

  if (!fs.existsSync(configPath)) {
    return {};
  }

  return JSON.parse(fs.readFileSync(configPath, "utf-8")) as TsxrayConfig;
}
