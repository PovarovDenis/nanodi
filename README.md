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