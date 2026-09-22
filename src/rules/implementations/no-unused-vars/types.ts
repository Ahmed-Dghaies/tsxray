export type VariableScope = "all" | "local";
export type ArgumentHandling = "after-used" | "all" | "none";
export type CaughtErrorHandling = "all" | "none";

export interface NoUnusedVarsOptions extends Record<string, unknown> {
  args: ArgumentHandling;
  argsIgnorePattern?: string;
  caughtErrors: CaughtErrorHandling;
  caughtErrorsIgnorePattern?: string;
  destructuredArrayIgnorePattern?: string;
  ignoreClassWithStaticInitBlock: boolean;
  ignoreRestSiblings: boolean;
  reportUsedIgnorePattern: boolean;
  vars: VariableScope;
  varsIgnorePattern?: string;
}