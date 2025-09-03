# silverbullet-di

A super simple TypeScript dependency injection container with full type safety and factory functions.

## Installation

```bash
npm install silverbullet-di
```

## Features

- **Full type safety** - TypeScript types are preserved throughout
- **Factory functions** - Lazy instantiation and dependency injection support  
- **Multiple identifiers** - Use strings, symbols, or class constructors
- **Service protection** - Prevents accidental service redefinition
- **Zero dependencies** - Lightweight and fast
- **Universal compatibility** - Works in Node.js, browsers, and Cloudflare Workers
- **Ultra-lightweight** - Only 729 bytes compiled

## Usage

### Basic Usage

```typescript
import { createContainer } from 'silverbullet-di';

// Create a container
const container = createContainer();

// Register services directly
container.set('logger', console);
container.set('config', { apiUrl: 'https://api.example.com' });

// Register by class constructor
class UserService {}
container.set(UserService, new UserService());

// Retrieve services with full type safety
const logger = container.get<Console>('logger');
const config = container.get<{apiUrl: string}>('config');
const userService = container.get(UserService);
```

### Factory Functions (Lazy Loading)

```typescript
// Register services as factory functions for lazy instantiation
container.set('database', (container) => {
  const config = container.get('config');
  return new Database(config.apiUrl);
});

container.set('userService', (container) => {
  const db = container.get('database');
  const logger = container.get('logger');
  return new UserService(db, logger);
});

// Services are only instantiated when first accessed
const userService = container.get('userService'); // Creates database → userService
```

### Service Protection

```typescript
container.set('config', { apiUrl: 'https://api.example.com' });
const config = container.get('config'); // Service is now instantiated

// This will throw an error - cannot redefine after instantiation
container.set('config', { apiUrl: 'https://other.com' }); // Error!
```

### Utility Methods

```typescript
// Check if service exists
if (container.has('logger')) {
  console.log('Logger is registered');
}

// Clear all services
container.clear();
```

### Cloudflare Workers Usage

Perfect for edge computing with zero cold start overhead. For better organization, create separate modules:

**types.ts**
```typescript
export interface Config {
  databaseUrl: string;
  logLevel: string;
  apiKey: string;
}

export interface Logger {
  info: (msg: string) => void;
  error: (msg: string) => void;
}

export interface Database {
  query: (sql: string) => Promise<any>;
}
```

**container.ts**
```typescript
import { createContainer, type Container } from 'silverbullet-di';

// Global container instance
let container: Container | null = null;

/**
 * Initialize the DI container
 * This should be called once during application startup
 */
export const initContainer = (): Container => {
  if (container) {
    throw new Error('Container is already initialized. Call initContainer() only once.');
  }

  container = createContainer();
  return container;
};

/**
 * Get the initialized container instance
 * Throws an error if container hasn't been initialized
 */
export const getContainer = (): Container => {
  if (!container) {
    throw new Error('Container not initialized. Call initContainer() first.');
  }

  return container;
};

/**
 * Check if container has been initialized
 */
export const isContainerInitialized = (): boolean => {
  return container !== null;
};

/**
 * Reset container (mainly for testing purposes)
 * @internal
 */
export const resetContainer = (): void => {
  container = null;
};
```

**worker.ts**
```typescript
import { initContainer, getContainer, type Container } from './container';
import type { Config, Logger, Database } from './types';

/**
 * Initialize container with services if not already initialized
 * This function is safe to call multiple times
 */
function ensureContainerInitialized(env: any): Container {
  try {
    // Check if container is already initialized
    return getContainer();
  } catch {
    // Container not initialized, proceed with initialization
    const container = initContainer();
    
    // Register configuration from environment
    container.set('config', {
      databaseUrl: env.DATABASE_URL,
      logLevel: env.LOG_LEVEL || 'info',
      apiKey: env.API_KEY
    });
    
    // Register logger with factory
    container.set('logger', (container) => {
      const config = container.get<Config>('config');
      return {
        info: (msg: string) => config.logLevel === 'info' && console.log(msg),
        error: (msg: string) => console.error(msg)
      };
    });
    
    // Register database service
    container.set('db', (container) => {
      const config = container.get<Config>('config');
      return new DatabaseClient(config.databaseUrl, config.apiKey);
    });
    
    return container;
  }
}

export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    // Ensure container is initialized (safe to call on every request)
    const container = ensureContainerInitialized(env);
    
    // Use services (can now be used in other files too)
    const logger = container.get<Logger>('logger');
    const db = container.get<Database>('db');
    
    logger.info('Processing request');
    const data = await db.query('SELECT * FROM users');
    
    return new Response(JSON.stringify(data));
  }
};
```

**other-service.ts**
```typescript
import { getContainer } from './container';
import type { Database, Logger } from './types';

export class UserService {
  async getUsers() {
    const container = getContainer();
    const db = container.get<Database>('db');
    const logger = container.get<Logger>('logger');
    
    logger.info('Fetching users');
    return await db.query('SELECT * FROM users');
  }
}
```

## API

### `createContainer()`
Creates and returns a new container instance.

### `container.set<T>(identifier, value)`
Registers a service with the given identifier.
- `identifier`: string, symbol, or class constructor
- `value`: the service instance or factory function `(container) => T`

### `container.get<T>(identifier)`
Retrieves a service by identifier. Throws error if not found.
- `identifier`: string, symbol, or class constructor
- Returns: the registered service (instantiated if it was a factory)

### `container.has<T>(identifier)`
Checks if a service is registered.
- `identifier`: string, symbol, or class constructor
- Returns: boolean

### `container.clear()`
Removes all registered services.

## Error Handling

The container provides clear error messages:
- `Service 'X' is not registered in the container` - when trying to get unregistered service
- `Cannot redefine service 'X' after it has been instantiated` - when trying to override instantiated service
- `Failed to instantiate service 'X': [reason]` - when factory function throws an error

## Author

Created by [Denis Povarov](https://denpo.dev)

## License

MIT