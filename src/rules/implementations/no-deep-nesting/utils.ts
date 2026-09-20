import { Node, SyntaxKind } from "ts-morph";

import {
  DEFAULT_EXCLUDED_CONSTRUCTS,
  DEFAULT_MAX_DEPTH,
  NESTING_CONSTRUCTS,
} from "@/rules/implementations/no-deep-nesting/consts";
import { nonNegativeInteger } from "@/utils/options";

import type {
  NestingAnalysis,
  NestingConstruct,
  NoDeepNestingOptions,
} from "@/rules/implementations/no-deep-nesting/types";
import type { FunctionLikeNode } from "@/types/types";

const FUNCTION_KINDS = new Set([
  SyntaxKind.FunctionDeclaration,
  SyntaxKind.MethodDeclaration,
  SyntaxKind.ArrowFunction,
  SyntaxKind.FunctionExpression,
  SyntaxKind.Constructor,
  SyntaxKind.GetAccessor,
  SyntaxKind.SetAccessor,
]);

const CALLBACK_KINDS = new Set([SyntaxKind.ArrowFunction, SyntaxKind.FunctionExpression]);

export function parseNoDeepNestingOptions(
  options: Record<string, unknown> | undefined,
): NoDeepNestingOptions {
  const excludedConstructs = Array.isArray(options?.excludedConstructs)
    ? options.excludedConstructs.filter(isNestingConstruct)
    : DEFAULT_EXCLUDED_CONSTRUCTS;

  return {
    maxDepth: nonNegativeInteger(options?.maxDepth, DEFAULT_MAX_DEPTH),
    excludedConstructs: [...new Set(excludedConstructs)],
  };
}

export function getNestingScopes(sourceFile: Node): FunctionLikeNode[] {
  const scopes: FunctionLikeNode[] = [];

  sourceFile.forEachDescendant((node) => {
    if (!FUNCTION_KINDS.has(node.getKind())) {
      return;
    }

    const hasFunctionAncestor = node
      .getAncestors()
      .some((ancestor) => FUNCTION_KINDS.has(ancestor.getKind()));

    if (!hasFunctionAncestor || !CALLBACK_KINDS.has(node.getKind())) {
      scopes.push(node as FunctionLikeNode);
    }
  });

  return scopes;
}

export function analyzeNesting(
  scope: FunctionLikeNode,
  excludedConstructs: readonly NestingConstruct[],
): NestingAnalysis {
  const excluded = new Set(excludedConstructs);
  const result: NestingAnalysis = { depth: 0, constructs: [] };

  visitChildren(scope, 0, [], excluded, result, scope);

  return result;
}

function visitNode(
  node: Node,
  depth: number,
  constructs: NestingConstruct[],
  excluded: ReadonlySet<NestingConstruct>,
  result: NestingAnalysis,
  rootScope: FunctionLikeNode,
): void {
  if (node !== rootScope && FUNCTION_KINDS.has(node.getKind())) {
    if (!CALLBACK_KINDS.has(node.getKind())) {
      return;
    }

    visitNested(node, "callback", depth, constructs, excluded, result, rootScope);
    return;
  }

  if (Node.isIfStatement(node)) {
    const next = recordConstruct(node, "if", depth, constructs, excluded, result);
    visitNode(node.getThenStatement(), next.depth, next.constructs, excluded, result, rootScope);

    const elseStatement = node.getElseStatement();
    if (elseStatement) {
      const elseDepth = Node.isIfStatement(elseStatement) ? depth : next.depth;
      const elseConstructs = Node.isIfStatement(elseStatement) ? constructs : next.constructs;
      visitNode(elseStatement, elseDepth, elseConstructs, excluded, result, rootScope);
    }
    return;
  }

  const construct = getControlFlowConstruct(node);
  if (construct) {
    visitNested(node, construct, depth, constructs, excluded, result, rootScope);
    return;
  }

  visitChildren(node, depth, constructs, excluded, result, rootScope);
}

function visitNested(
  node: Node,
  construct: NestingConstruct,
  depth: number,
  constructs: NestingConstruct[],
  excluded: ReadonlySet<NestingConstruct>,
  result: NestingAnalysis,
  rootScope: FunctionLikeNode,
): void {
  const next = recordConstruct(node, construct, depth, constructs, excluded, result);
  visitChildren(node, next.depth, next.constructs, excluded, result, rootScope);
}

function visitChildren(
  node: Node,
  depth: number,
  constructs: NestingConstruct[],
  excluded: ReadonlySet<NestingConstruct>,
  result: NestingAnalysis,
  rootScope: FunctionLikeNode,
): void {
  node.forEachChild((child) => {
    visitNode(child, depth, constructs, excluded, result, rootScope);
  });
}

function recordConstruct(
  node: Node,
  construct: NestingConstruct,
  depth: number,
  constructs: NestingConstruct[],
  excluded: ReadonlySet<NestingConstruct>,
  result: NestingAnalysis,
): { depth: number; constructs: NestingConstruct[] } {
  if (excluded.has(construct)) {
    return { depth, constructs };
  }

  const nextDepth = depth + 1;
  const nextConstructs = [...constructs, construct];
  if (nextDepth > result.depth) {
    result.depth = nextDepth;
    result.constructs = nextConstructs;
    result.deepestNode = node;
  }

  return { depth: nextDepth, constructs: nextConstructs };
}

function getControlFlowConstruct(node: Node): NestingConstruct | undefined {
  switch (node.getKind()) {
    case SyntaxKind.ForStatement:
      return "for";
    case SyntaxKind.ForOfStatement:
      return "for-of";
    case SyntaxKind.ForInStatement:
      return "for-in";
    case SyntaxKind.WhileStatement:
      return "while";
    case SyntaxKind.DoStatement:
      return "do-while";
    case SyntaxKind.SwitchStatement:
      return "switch";
    case SyntaxKind.TryStatement:
      return "try";
    default:
      return undefined;
  }
}

function isNestingConstruct(value: unknown): value is NestingConstruct {
  return typeof value === "string" && NESTING_CONSTRUCTS.some((construct) => construct === value);
}
