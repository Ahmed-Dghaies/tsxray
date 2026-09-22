import type { NoUnusedVarsOptions } from "@/rules/implementations/no-unused-vars/types";

export const ESLINT_NO_UNUSED_VARS_RULE_ID = "no-unused-vars";

export const DEFAULT_NO_UNUSED_VARS_OPTIONS: NoUnusedVarsOptions = {
  args: "after-used",
  caughtErrors: "none",
  ignoreClassWithStaticInitBlock: false,
  ignoreRestSiblings: false,
  reportUsedIgnorePattern: false,
  vars: "all",
};