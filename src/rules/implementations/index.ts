/**
 * Built-in rules registry
 *
 * Add your rules here as you create them
 */

import { booleanParameterTrapRule } from "@/rules/implementations/boolean-parameter-trap/index";
import { godModuleRule } from "@/rules/implementations/god-module";
import { noDeepNestingRule } from "@/rules/implementations/no-deep-nesting";
import { noLargeFunctionsRule } from "@/rules/implementations/no-large-functions";
import { noUnusedFilesRule } from "@/rules/implementations/no-unused-files";
import { noUnusedVarsRule } from "@/rules/implementations/no-unused-vars";

import type { Rule } from "@/rules/types";

/**
 * All built-in rules
 */
export const builtInRules: Rule[] = [
	booleanParameterTrapRule,
	noLargeFunctionsRule,
	godModuleRule,
	noDeepNestingRule,
	noUnusedFilesRule,
	noUnusedVarsRule,
];
