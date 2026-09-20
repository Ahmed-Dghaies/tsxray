/**
 * Built-in rules registry
 *
 * Add your rules here as you create them
 */

import { godModuleRule } from "@/rules/implementations/god-module";
import { noDeepNestingRule } from "@/rules/implementations/no-deep-nesting";
import { noLargeFunctionsRule } from "@/rules/implementations/no-large-functions";

import type { Rule } from "@/rules/types";

/**
 * All built-in rules
 */
export const builtInRules: Rule[] = [noLargeFunctionsRule, godModuleRule, noDeepNestingRule];
