/**
 * JSON reporter for tsxray
 */

import * as fs from "fs";
import type { FindingsResult } from "@/findings/types.js";

export function formatJson(result: FindingsResult, pretty = true): string {
  return pretty ? JSON.stringify(result, null, 2) : JSON.stringify(result);
}

export function writeJsonToFile(result: FindingsResult, filePath: string, pretty = true): void {
  const json = formatJson(result, pretty);
  fs.writeFileSync(filePath, json, "utf-8");
}
