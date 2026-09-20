export function processItems(items: Array<{ valid: boolean }>): void {
  if (items.length > 0) {
    for (const item of items) {
      if (item.valid) {
        try {
          while (items.length > 0) {
            break;
          }
        } catch {
          return;
        }
      }
    }
  }
}