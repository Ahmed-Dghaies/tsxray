/**
 * Basic test for tsxray
 */

import { describe, it, expect } from "vitest";
import { formatJson } from "../src/reporters/json.js";

describe("JSON Reporter", () => {
  it("should format findings as JSON", () => {
    const result = {
      findings: [],
      summary: {
        total: 0,
        bySeverity: { error: 0, warning: 0, info: 0, hint: 0 },
        byRule: {},
      },
      scannedFiles: [],
      timestamp: "2024-01-01T00:00:00.000Z",
      analyzedPath: "/test",
    };

    const json = formatJson(result, false);
    const parsed = JSON.parse(json);

    expect(parsed).toEqual(result);
  });
});
