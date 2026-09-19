import { ts } from "ts-morph";

import type { SourceFile } from "ts-morph";

const DISABLE_DIRECTIVE = /^\/\/\s*disable\s+([A-Za-z0-9_-]+)\s*$/;

export function isRuleDisabledForFile(sourceFile: SourceFile, ruleId: string): boolean {
  const scanner = ts.createScanner(
    ts.ScriptTarget.Latest,
    false,
    ts.LanguageVariant.Standard,
    sourceFile.getFullText(),
  );

  for (let token = scanner.scan(); token !== ts.SyntaxKind.EndOfFileToken; token = scanner.scan()) {
    if (token !== ts.SyntaxKind.SingleLineCommentTrivia) {
      continue;
    }

    const match = DISABLE_DIRECTIVE.exec(scanner.getTokenText());

    if (match?.[1] === ruleId) {
      return true;
    }
  }

  return false;
}
