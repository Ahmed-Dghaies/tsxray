import { DEFAULT_NO_UNUSED_VARS_OPTIONS } from "@/rules/implementations/no-unused-vars/consts";
import { booleanOption, compactOptions, enumOption, stringOption } from "@/utils/options";

import type {
  ArgumentHandling,
  CaughtErrorHandling,
  NoUnusedVarsOptions,
  VariableScope,
} from "@/rules/implementations/no-unused-vars/types";

export function parseNoUnusedVarsOptions(
  options: Record<string, unknown> | undefined,
): NoUnusedVarsOptions {
  return compactOptions({
    args: enumOption(options?.args, ["after-used", "all", "none"], DEFAULT_NO_UNUSED_VARS_OPTIONS.args),
    argsIgnorePattern: stringOption(options?.argsIgnorePattern),
    caughtErrors: enumOption(
      options?.caughtErrors,
      ["all", "none"],
      DEFAULT_NO_UNUSED_VARS_OPTIONS.caughtErrors,
    ),
    caughtErrorsIgnorePattern: stringOption(options?.caughtErrorsIgnorePattern),
    destructuredArrayIgnorePattern: stringOption(options?.destructuredArrayIgnorePattern),
    ignoreClassWithStaticInitBlock: booleanOption(
      options?.ignoreClassWithStaticInitBlock,
      DEFAULT_NO_UNUSED_VARS_OPTIONS.ignoreClassWithStaticInitBlock,
    ),
    ignoreRestSiblings: booleanOption(
      options?.ignoreRestSiblings,
      DEFAULT_NO_UNUSED_VARS_OPTIONS.ignoreRestSiblings,
    ),
    reportUsedIgnorePattern: booleanOption(
      options?.reportUsedIgnorePattern,
      DEFAULT_NO_UNUSED_VARS_OPTIONS.reportUsedIgnorePattern,
    ),
    vars: enumOption(options?.vars, ["all", "local"], DEFAULT_NO_UNUSED_VARS_OPTIONS.vars),
    varsIgnorePattern: stringOption(options?.varsIgnorePattern),
  });
}

export type { ArgumentHandling, CaughtErrorHandling, NoUnusedVarsOptions, VariableScope };