import type { NESTING_CONSTRUCTS } from "@/rules/implementations/no-deep-nesting/consts";
import type { Node } from "ts-morph";

export type NestingConstruct = (typeof NESTING_CONSTRUCTS)[number];

export interface NoDeepNestingOptions {
  maxDepth: number;
  excludedConstructs: readonly NestingConstruct[];
}

export interface NestingAnalysis {
  depth: number;
  constructs: NestingConstruct[];
  deepestNode?: Node;
}