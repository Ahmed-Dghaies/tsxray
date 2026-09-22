const unusedVariable = 1;

function unusedFunction() {
  return "unused";
}

export function usesFirstParameter(usedParameter: string, unusedParameter: string): string {
  return usedParameter;
}