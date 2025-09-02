type Constructor<T = {}> = new (...args: any[]) => T;
type ServiceIdentifier<T = any> = string | symbol | Constructor<T>;

class Container {
  private services = new Map<ServiceIdentifier, any>();

  set<T>(identifier: ServiceIdentifier<T>, value: T): void {
    this.services.set(identifier, value);
  }

  get<T>(identifier: ServiceIdentifier<T>): T {
    if (!this.services.has(identifier)) {
      throw new Error(`Service '${String(identifier)}' not found`);
    }
    return this.services.get(identifier);
  }

  has<T>(identifier: ServiceIdentifier<T>): boolean {
    return this.services.has(identifier);
  }

  clear(): void {
    this.services.clear();
  }
}

export function createContainer(): Container {
  return new Container();
}

export { Container, ServiceIdentifier, Constructor };