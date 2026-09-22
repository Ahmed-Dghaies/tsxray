export function createUser(name: string, isAdmin: boolean): string {
  return isAdmin ? `${name}:admin` : name;
}

export class Session {
  private readonly persistent: boolean;

  public constructor(persistent = false) {
    this.persistent = persistent;
  }

  public isPersistent(): boolean {
    return this.persistent;
  }
}