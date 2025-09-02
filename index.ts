type Constructor<T = {}> = new (...args: any[]) => T;
type ServiceIdentifier<T = any> = string | symbol | Constructor<T>;
type ServiceFactory<T> = (container: Container) => T;

interface ServiceDefinition<T = any> {
  value?: T;
  factory?: ServiceFactory<T>;
  instantiated: boolean;
}

function isFunction(value: any): value is Function {
  return typeof value === 'function';
}

class Container {
  private services = new Map<ServiceIdentifier, ServiceDefinition>();

  set<T>(identifier: ServiceIdentifier<T>, value: T | ServiceFactory<T>): void {
    if (this.services.has(identifier) && this.services.get(identifier)!.instantiated) {
      throw new Error(`Cannot redefine service '${String(identifier)}' after it has been instantiated`);
    }

    if (isFunction(value)) {
      this.services.set(identifier, {
        factory: value as ServiceFactory<T>,
        instantiated: false
      });
    } else {
      this.services.set(identifier, {
        value,
        instantiated: true
      });
    }
  }

  get<T>(identifier: ServiceIdentifier<T>): T {
    if (!this.services.has(identifier)) {
      throw new Error(`Service '${String(identifier)}' is not registered in the container`);
    }

    const definition = this.services.get(identifier)!;

    if (definition.factory && !definition.instantiated) {
      try {
        const instance = definition.factory(this);
        definition.value = instance;
        definition.instantiated = true;
        return instance;
      } catch (error) {
        throw new Error(`Failed to instantiate service '${String(identifier)}': ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    return definition.value;
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