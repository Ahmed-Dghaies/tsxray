export function createConfiguredUser(options: { name: string; isAdmin: boolean }): string {
  return options.isAdmin ? `${options.name}:admin` : options.name;
}