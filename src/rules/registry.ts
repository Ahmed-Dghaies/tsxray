import type { Rule, RuleConfig } from "./types";

class RuleRegistry {
  private rules = new Map<string, Rule>();

  registerRule(rule: Rule): void {
    if (this.rules.has(rule.id)) {
      console.warn(`Rule with id "${rule.id}" already registered, overwriting`);
    }
    this.rules.set(rule.id, rule);
  }

  getRuleById(id: string): Rule | undefined {
    return this.rules.get(id);
  }

  getAllRules(): Rule[] {
    return Array.from(this.rules.values());
  }

  getEnabledRules(config?: Record<string, Partial<RuleConfig>>): Rule[] {
    return this.getAllRules().filter((rule) => {
      const ruleConfig = config?.[rule.id];
      return ruleConfig?.enabled !== false;
    });
  }

  clearRules(): void {
    this.rules.clear();
  }
}

export const ruleRegistry = new RuleRegistry();
