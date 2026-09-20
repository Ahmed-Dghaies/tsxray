// disable no-deep-nesting
export function disabledDeepNesting(values: number[]): void {
  if (values.length > 0) {
    for (const value of values) {
      if (value > 0) {
        try {
          while (value > 1) {
            return;
          }
        } catch {
          return;
        }
      }
    }
  }
}