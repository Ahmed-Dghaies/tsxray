import { Node, SyntaxKind } from "ts-morph";

import { DEFAULT_NAMING_QUALITY_OPTIONS } from "@/rules/implementations/naming-quality/consts";
import { booleanOption, positiveInteger, stringArrayOption } from "@/utils/options";

import type {
  NamingDiagnostic,
  NamingQualityOptions,
} from "@/rules/implementations/naming-quality/types";
import type {
  FunctionLikeDeclaration,
  Identifier,
  Node as MorphNode,
  ParameterDeclaration,
  SourceFile,
  Type,
  VariableDeclaration,
} from "ts-morph";

const CLEAR_BOOLEAN_ADJECTIVES = new Set([
  "active",
  "visible",
  "hidden",
  "valid",
  "invalid",
  "ready",
  "loading",
  "disabled",
  "enabled",
  "selected",
  "checked",
  "empty",
  "available",
  "required",
  "optional",
  "authenticated",
  "connected",
]);
const PREDICATE_WORDS = /^(contains|exists|supports|matches|equals|includes)([A-Z]|$)/;
const GENERIC_FUNCTION_NAMES = new Set(["user", "users", "data", "result", "value"]);
const EVENT_NAMES = new Set(["click", "change", "submit", "input", "focus", "blur", "keydown", "keyup"]);
const CALLBACK_METHODS = new Set(["map", "filter", "reduce", "sort", "forEach", "find", "some", "every"]);
const CONVENTIONAL_CALLBACK_NAMES = new Set(["item", "value", "x", "a", "b", "acc", "index", "key"]);
const KNOWN_ABBREVIATIONS = new Set(["usr", "cfg", "btn", "mgr", "req", "res", "ctx", "err"]);
const SUFFIXES = ["Boolean", "Bool", "String", "Number", "Array", "Object", "Function", "Map"] as const;

export function parseNamingQualityOptions(
  options: Record<string, unknown> = {},
): NamingQualityOptions {
  const defaults = DEFAULT_NAMING_QUALITY_OPTIONS;

  return {
    boolean: booleanOption(options.boolean, defaults.boolean),
    negativeBoolean: booleanOption(options.negativeBoolean, defaults.negativeBoolean),
    booleanFunction: booleanOption(options.booleanFunction, defaults.booleanFunction),
    valueFunctions: booleanOption(options.valueFunctions, defaults.valueFunctions),
    vagueNames: booleanOption(options.vagueNames, defaults.vagueNames),
    genericParameters: booleanOption(options.genericParameters, defaults.genericParameters),
    typeSuffixes: booleanOption(options.typeSuffixes, defaults.typeSuffixes),
    abbreviations: booleanOption(options.abbreviations, defaults.abbreviations),
    eventHandlers: booleanOption(options.eventHandlers, defaults.eventHandlers),
    collectionNames: booleanOption(options.collectionNames, defaults.collectionNames),
    booleanNames: stringArrayOption(options.booleanNames, defaults.booleanNames),
    vagueNameList: stringArrayOption(options.vagueNameList, defaults.vagueNameList),
    genericParameterNames: stringArrayOption(
      options.genericParameterNames,
      defaults.genericParameterNames,
    ),
    acceptedAbbreviations: stringArrayOption(
      options.acceptedAbbreviations,
      defaults.acceptedAbbreviations,
    ),
    ignoredNames: stringArrayOption(options.ignoredNames, defaults.ignoredNames),
    booleanPatterns: stringArrayOption(options.booleanPatterns, defaults.booleanPatterns),
    eventHandlerPatterns: stringArrayOption(
      options.eventHandlerPatterns,
      defaults.eventHandlerPatterns,
    ),
    callbackParameterMaxLines: positiveInteger(
      options.callbackParameterMaxLines,
      defaults.callbackParameterMaxLines,
    ),
  };
}

function normalizedSet(values: readonly string[]): Set<string> {
  return new Set(values.map((value) => value.toLowerCase()));
}

function matchesPattern(name: string, patterns: readonly string[]): boolean {
  return patterns.some((pattern) => {
    try {
      return new RegExp(pattern, "i").test(name);
    } catch {
      return false;
    }
  });
}

function isBooleanType(type: Type): boolean {
  if (type.isBoolean() || type.isBooleanLiteral()) {
    return true;
  }

  const unionTypes = type.getUnionTypes();
  return unionTypes.length > 0 && unionTypes.every((part) => part.isBooleanLiteral());
}

function isCollectionType(type: Type): boolean {
  if (type.isArray() || type.isTuple()) {
    return true;
  }

  const symbolName = type.getSymbol()?.getName();
  return symbolName === "Set" || symbolName === "Map" || symbolName === "ReadonlyArray";
}

function isFunctionType(type: Type): boolean {
  return type.getCallSignatures().length > 0;
}

function isPluralLooking(name: string): boolean {
  return name.length > 3 && name.endsWith("s") && !name.endsWith("ss");
}

function isShortCallbackParameter(
  parameter: ParameterDeclaration,
  maxLines: number,
): boolean {
  const functionNode = parameter.getFirstAncestor((ancestor) =>
    Node.isArrowFunction(ancestor) || Node.isFunctionExpression(ancestor),
  );
  const call = functionNode?.getParentIfKind(SyntaxKind.CallExpression);
  const expression = call?.getExpression();

  if (!expression || !Node.isPropertyAccessExpression(expression)) {
    return false;
  }

  return (
    CALLBACK_METHODS.has(expression.getName()) &&
    functionNode !== undefined &&
    functionNode.getEndLineNumber() - functionNode.getStartLineNumber() + 1 <= maxLines
  );
}

function isContextualVagueVariable(declaration: VariableDeclaration): boolean {
  const initializer = declaration.getInitializer();
  const name = declaration.getName().toLowerCase();

  if (name === "result" && initializer && Node.isAwaitExpression(initializer)) {
    const expression = initializer.getExpression();
    return Node.isCallExpression(expression) && expression.getExpression().getText() === "Promise.all";
  }

  if (name === "data" && initializer && Node.isPropertyAccessExpression(initializer)) {
    return initializer.getName() === "data";
  }

  return false;
}

function getFunctionNameNode(node: FunctionLikeDeclaration): Identifier | undefined {
  if (Node.isFunctionDeclaration(node) || Node.isMethodDeclaration(node)) {
    return node.getNameNode();
  }

  const parent = node.getParent();
  if (Node.isVariableDeclaration(parent) && Node.isIdentifier(parent.getNameNode())) {
    return parent.getNameNode() as Identifier;
  }

  if (Node.isPropertyAssignment(parent) && Node.isIdentifier(parent.getNameNode())) {
    return parent.getNameNode() as Identifier;
  }

  return undefined;
}

function getBooleanReturnType(node: FunctionLikeDeclaration): Type | undefined {
  try {
    if (Node.isFunctionDeclaration(node) || Node.isMethodDeclaration(node)) {
      return node.getReturnType();
    }

    return node.getType().getCallSignatures()[0]?.getReturnType();
  } catch {
    return undefined;
  }
}

function splitName(name: string): string[] {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

function getNegativeSuggestion(name: string): string | undefined {
  const replacements: Array<[RegExp, string]> = [
    [/^isNotDisabled/i, "isEnabled"],
    [/^isNotInvalid/i, "isValid"],
    [/^isNotHidden/i, "isVisible"],
    [/^isNotUnavailable/i, "isAvailable"],
    [/^hasNoPermission/i, "hasPermission"],
  ];

  for (const [pattern, replacement] of replacements) {
    if (pattern.test(name)) {
      return name.replace(pattern, replacement);
    }
  }

  return undefined;
}

function addDiagnostic(
  diagnostics: NamingDiagnostic[],
  node: MorphNode,
  diagnostic: Omit<NamingDiagnostic, "line">,
): void {
  diagnostics.push({ ...diagnostic, line: node.getStartLineNumber() });
}

function inspectTypedIdentifier(
  node: Identifier,
  declaration: VariableDeclaration | ParameterDeclaration | MorphNode,
  options: NamingQualityOptions,
  diagnostics: NamingDiagnostic[],
): void {
  const name = node.getText();
  const lowerName = name.toLowerCase();
  if (normalizedSet(options.ignoredNames).has(lowerName)) {
    return;
  }

  const type = declaration.getType();
  const booleanType = isBooleanType(type);

  if (booleanType && options.negativeBoolean) {
    const suggestion = getNegativeSuggestion(name);
    if (suggestion) {
      addDiagnostic(diagnostics, node, {
        problem: "negative-boolean",
        name,
        title: `Boolean identifier "${name}" uses confusing negation`,
        message: `"${name}" contains an unnecessarily negative boolean construction. Consider "${suggestion}".`,
      });
      return;
    }
  }

  if (
    booleanType &&
    options.boolean &&
    normalizedSet(options.booleanNames).has(lowerName) &&
    !CLEAR_BOOLEAN_ADJECTIVES.has(lowerName)
  ) {
    addDiagnostic(diagnostics, node, {
      problem: "boolean",
      name,
      title: `Boolean identifier "${name}" has a vague name`,
      message: `Boolean identifier "${name}" has a vague name. Consider a name that describes the boolean state or condition.`,
    });
    return;
  }

  if (options.typeSuffixes) {
    const suffix = SUFFIXES.find((candidate) => name.endsWith(candidate));
    const suffixMatchesType =
      (suffix === "Boolean" || suffix === "Bool")
        ? booleanType
        : suffix === "String"
          ? type.isString() || type.isStringLiteral()
          : suffix === "Number"
            ? type.isNumber() || type.isNumberLiteral()
            : suffix === "Array"
              ? type.isArray() || type.isTuple()
              : suffix === "Function"
                ? isFunctionType(type)
                : suffix === "Map"
                  ? type.getSymbol()?.getName() === "Map"
                  : suffix === "Object" && ["configObject", "dataObject", "valueObject", "resultObject"].includes(name);

    if (suffix && suffixMatchesType) {
      const suggestion = name.slice(0, -suffix.length);
      addDiagnostic(diagnostics, node, {
        problem: "type-suffix",
        name,
        title: `Identifier "${name}" exposes its implementation type`,
        message: `"${name}" exposes the implementation type in the identifier. Consider "${suggestion}".`,
      });
      return;
    }
  }

  if (options.collectionNames && (Node.isVariableDeclaration(declaration) || Node.isParameterDeclaration(declaration))) {
    const collection = isCollectionType(type);
    const plural = isPluralLooking(name);
    if (collection && !plural && !["data", "config", "children"].includes(lowerName)) {
      addDiagnostic(diagnostics, node, {
        problem: "collection-name",
        name,
        title: `Collection identifier "${name}" appears singular`,
        message: `"${name}" has a collection type but a singular-looking name. Consider a clear plural or collection-oriented name.`,
      });
      return;
    }
    if (!collection && plural && !type.isAny() && !type.isUnknown()) {
      addDiagnostic(diagnostics, node, {
        problem: "collection-name",
        name,
        title: `Identifier "${name}" appears plural but is not a collection`,
        message: `"${name}" has a non-collection type but a plural-looking name. Consider a singular name.`,
      });
      return;
    }
  }

  if (Node.isParameterDeclaration(declaration)) {
    if (
      options.genericParameters &&
      normalizedSet(options.genericParameterNames).has(lowerName) &&
      !(
        isShortCallbackParameter(declaration, options.callbackParameterMaxLines) &&
        CONVENTIONAL_CALLBACK_NAMES.has(lowerName)
      )
    ) {
      addDiagnostic(diagnostics, node, {
        problem: "generic-parameter",
        name,
        title: `Parameter "${name}" is too generic`,
        message: `Parameter "${name}" is too generic. Consider a name that describes its purpose.`,
      });
    }
    return;
  }

  if (
    Node.isVariableDeclaration(declaration) &&
    options.vagueNames &&
    normalizedSet(options.vagueNameList).has(lowerName) &&
    !booleanType &&
    !isContextualVagueVariable(declaration)
  ) {
    addDiagnostic(diagnostics, node, {
      problem: "vague-name",
      name,
      title: `Identifier "${name}" is vague`,
      message: `Identifier "${name}" provides little information about what it represents. Consider a more descriptive name.`,
    });
    return;
  }

  if (options.abbreviations) {
    const accepted = normalizedSet(options.acceptedAbbreviations);
    const abbreviation = splitName(name).find(
      (part) => KNOWN_ABBREVIATIONS.has(part) && !accepted.has(part),
    );
    if (abbreviation) {
      addDiagnostic(diagnostics, node, {
        problem: "abbreviation",
        name,
        title: `Identifier "${name}" contains an unclear abbreviation`,
        message: `"${abbreviation}" in "${name}" may reduce readability. Use a clearer term or add it to acceptedAbbreviations.`,
      });
    }
  }
}

function inspectFunction(
  node: FunctionLikeDeclaration,
  options: NamingQualityOptions,
  diagnostics: NamingDiagnostic[],
): void {
  const nameNode = getFunctionNameNode(node);
  if (!nameNode) {
    return;
  }

  const name = nameNode.getText();
  if (normalizedSet(options.ignoredNames).has(name.toLowerCase())) {
    return;
  }

  const returnType = getBooleanReturnType(node);
  const booleanReturn = returnType ? isBooleanType(returnType) : false;
  const predicateName =
    (!GENERIC_FUNCTION_NAMES.has(name.toLowerCase()) &&
      matchesPattern(name, options.booleanPatterns)) ||
    PREDICATE_WORDS.test(name);

  if (booleanReturn && options.booleanFunction && !predicateName) {
    addDiagnostic(diagnostics, nameNode, {
      problem: "boolean-function",
      name,
      title: `Boolean function "${name}" has a value-like name`,
      message: `Boolean function "${name}" does not communicate that it is a predicate. Consider a name such as "is${name[0]?.toUpperCase()}${name.slice(1)}".`,
    });
    return;
  }

  if (options.eventHandlers && EVENT_NAMES.has(name.toLowerCase()) && !matchesPattern(name, options.eventHandlerPatterns)) {
    addDiagnostic(diagnostics, nameNode, {
      problem: "event-handler",
      name,
      title: `Event handler "${name}" does not communicate that it handles an event`,
      message: `Event handler "${name}" should follow an accepted handler convention, such as "handle${name[0]?.toUpperCase()}${name.slice(1)}".`,
    });
    return;
  }

  if (options.valueFunctions && GENERIC_FUNCTION_NAMES.has(name.toLowerCase())) {
    addDiagnostic(diagnostics, nameNode, {
      problem: "value-function",
      name,
      title: `Function "${name}" has a generic value-like name`,
      message: `Function "${name}" does not communicate an action, retrieval, transformation, or predicate. Consider a more descriptive operation name.`,
    });
  }
}

export function analyzeNamingQuality(
  sourceFile: SourceFile,
  options: NamingQualityOptions,
): NamingDiagnostic[] {
  const diagnostics: NamingDiagnostic[] = [];

  sourceFile.forEachDescendant((node) => {
    if (Node.isVariableDeclaration(node) || Node.isParameterDeclaration(node)) {
      const nameNode = node.getNameNode();
      if (Node.isIdentifier(nameNode)) {
        inspectTypedIdentifier(nameNode, node, options, diagnostics);
      }
    }

    if (
      Node.isFunctionDeclaration(node) ||
      Node.isMethodDeclaration(node) ||
      Node.isArrowFunction(node) ||
      Node.isFunctionExpression(node)
    ) {
      inspectFunction(node, options, diagnostics);
    }
  });

  return diagnostics.sort((left, right) => left.line - right.line);
}