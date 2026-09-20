// disable no-large-functions
export function processRecords(records: number[]): void {
  records.forEach((record) => {
    if (record > 0) {
      try {
        for (let index = 0; index < record; index++) {
          while (index > 10) {
            break;
          }
        }
      } catch {
        return;
      }
    }
  });
}
