export interface NamingQualityOptions {
  boolean: boolean;
  negativeBoolean: boolean;
  booleanFunction: boolean;
  valueFunctions: boolean;
  vagueNames: boolean;
  genericParameters: boolean;
  typeSuffixes: boolean;
  abbreviations: boolean;
  eventHandlers: boolean;
  collectionNames: boolean;
  booleanNames: string[];
  vagueNameList: string[];
  genericParameterNames: string[];
  acceptedAbbreviations: string[];
  ignoredNames: string[];
  booleanPatterns: string[];
  eventHandlerPatterns: string[];
  callbackParameterMaxLines: number;
}

export type NamingProblem =
  | "boolean"
  | "negative-boolean"
  | "boolean-function"
  | "value-function"
  | "vague-name"
  | "generic-parameter"
  | "type-suffix"
  | "abbreviation"
  | "event-handler"
  | "collection-name";

export interface NamingDiagnostic {
  problem: NamingProblem;
  name: string;
  title: string;
  message: string;
  line: number;
}