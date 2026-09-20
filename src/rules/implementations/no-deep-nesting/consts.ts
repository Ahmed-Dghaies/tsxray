export const DEFAULT_MAX_DEPTH = 4;
export const DEFAULT_EXCLUDED_CONSTRUCTS = [];

export const NESTING_CONSTRUCTS = [
  "if",
  "for",
  "for-of",
  "for-in",
  "while",
  "do-while",
  "switch",
  "try",
  "callback",
] as const;