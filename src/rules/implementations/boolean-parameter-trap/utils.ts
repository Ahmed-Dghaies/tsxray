import { Node, SyntaxKind } from "ts-morph";

import type { FunctionLikeNode } from "@/types/types";
import type { ParameterDeclaration, SourceFile } from "ts-morph";

const FUNCTION_KINDS = new Set([
  SyntaxKind.FunctionDeclaration,
  SyntaxKind.MethodDeclaration,
  SyntaxKind.ArrowFunction,
  SyntaxKind.FunctionExpression,
  SyntaxKind.Constructor,
  SyntaxKind.GetAccessor,
  SyntaxKind.SetAccessor,
]);

export function getFunctionScopes(sourceFile: SourceFile): FunctionLikeNode[] {
  const functions: FunctionLikeNode[] = [];

  sourceFile.forEachDescendant((node) => {
    if (FUNCTION_KINDS.has(node.getKind())) {
      functions.push(node as FunctionLikeNode);
    }
  });

  return functions;
}

export function isBooleanParameter(parameter: ParameterDeclaration): boolean {
  const type = parameter.getType();
  if (type.isBoolean() || type.isBooleanLiteral()) {
    return true;
  }

  const initializer = parameter.getInitializer();
  return Boolean(
    initializer && (Node.isTrueLiteral(initializer) || Node.isFalseLiteral(initializer)),
  );
}