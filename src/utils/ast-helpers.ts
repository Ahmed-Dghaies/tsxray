/**
 * AST helper utilities for tsxray
 */

import { SourceFile, Node, SyntaxKind } from "ts-morph";

/**
 * Get all functions and methods in a file
 */
export function getFunctions(sourceFile: SourceFile): Node[] {
  const functions: Node[] = [];

  sourceFile.forEachDescendant((node) => {
    if (
      node.getKind() === SyntaxKind.FunctionDeclaration ||
      node.getKind() === SyntaxKind.MethodDeclaration ||
      node.getKind() === SyntaxKind.ArrowFunction ||
      node.getKind() === SyntaxKind.FunctionExpression
    ) {
      functions.push(node);
    }
  });

  return functions;
}

/**
 * Get line count of a function
 */
export function getFunctionLineCount(node: Node): number {
  const start = node.getStartLineNumber();
  const end = node.getEndLineNumber();
  return end - start + 1;
}

/**
 * Get function name (if available)
 */
export function getFunctionName(node: Node): string | undefined {
  if ("getName" in node && typeof node.getName === "function") {
    return node.getName?.();
  }
  return undefined;
}

/**
 * Count parameters in a function
 */
export function getParameterCount(node: Node): number {
  if ("getParameters" in node && typeof node.getParameters === "function") {
    return node.getParameters?.().length ?? 0;
  }
  return 0;
}
