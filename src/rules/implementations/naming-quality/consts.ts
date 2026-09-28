import type { NamingQualityOptions } from "@/rules/implementations/naming-quality/types";

export const DEFAULT_BOOLEAN_NAMES = ["flag", "bool", "boolean", "value", "state"];
export const DEFAULT_VAGUE_NAMES = [
  "data",
  "value",
  "result",
  "thing",
  "stuff",
  "object",
  "obj",
  "item",
  "temp",
  "tmp",
  "foo",
  "bar",
  "baz",
];
export const DEFAULT_GENERIC_PARAMETER_NAMES = [
  "a",
  "b",
  "c",
  "x",
  "y",
  "z",
  "foo",
  "bar",
  "baz",
  "data",
  "value",
  "item",
];
export const DEFAULT_ACCEPTED_ABBREVIATIONS = [
  "req",
  "res",
  "ctx",
  "err",
  "id",
  "url",
  "api",
  "http",
];
export const DEFAULT_BOOLEAN_PATTERNS = [
  "^(is|has|should|can|will|must|allow|enable|disable|use|skip|force|strict)",
  "^(with|without|include|exclude)",
  "Flag$",
  "Enabled$",
];
export const DEFAULT_EVENT_HANDLER_PATTERNS = ["^handle[A-Z]", "^on[A-Z]"];
export const DEFAULT_CALLBACK_PARAMETER_MAX_LINES = 3;

export const DEFAULT_NAMING_QUALITY_OPTIONS: NamingQualityOptions = {
  boolean: true,
  negativeBoolean: true,
  booleanFunction: true,
  valueFunctions: true,
  vagueNames: true,
  genericParameters: true,
  typeSuffixes: true,
  abbreviations: false,
  eventHandlers: true,
  collectionNames: false,
  booleanNames: DEFAULT_BOOLEAN_NAMES,
  vagueNameList: DEFAULT_VAGUE_NAMES,
  genericParameterNames: DEFAULT_GENERIC_PARAMETER_NAMES,
  acceptedAbbreviations: DEFAULT_ACCEPTED_ABBREVIATIONS,
  ignoredNames: [],
  booleanPatterns: DEFAULT_BOOLEAN_PATTERNS,
  eventHandlerPatterns: DEFAULT_EVENT_HANDLER_PATTERNS,
  callbackParameterMaxLines: DEFAULT_CALLBACK_PARAMETER_MAX_LINES,
};