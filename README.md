# silverbullet-di

A super simple TypeScript dependency injection container with full type safety.

## Installation

```bash
npm install silverbullet-di
```

## Usage

```typescript
import { createContainer } from 'silverbullet-di';

// Create a container
const container = createContainer();

// Register services
container.set('logger', console);
container.set('config', { apiUrl: 'https://api.example.com' });

// Register by class constructor
class UserService {}
container.set(UserService, new UserService());

// Retrieve services with full type safety
const logger = container.get<Console>('logger');
const config = container.get<{apiUrl: string}>('config');
const userService = container.get(UserService);

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
- `value`: the service instance

### `container.get<T>(identifier)`
Retrieves a service by identifier. Throws error if not found.
- `identifier`: string, symbol, or class constructor
- Returns: the registered service

### `container.has<T>(identifier)`
Checks if a service is registered.
- `identifier`: string, symbol, or class constructor
- Returns: boolean

### `container.clear()`
Removes all registered services.

## License

MIT