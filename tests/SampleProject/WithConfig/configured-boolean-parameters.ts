export function logMessage(verbose: boolean, message: string): string {
  return verbose ? message.toUpperCase() : message;
}

export function updateUser(name: string, notify: boolean): string {
  return notify ? `${name}:notified` : name;
}