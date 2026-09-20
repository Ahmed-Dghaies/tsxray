export function findValue(values: number[]): number | undefined {
  for (const value of values) {
    if (value > 0) {
      try {
        switch (value) {
          case 1:
            return value;
        }
      } catch {
        return undefined;
      }
    }
  }
  return undefined;
}