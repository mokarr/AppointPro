# Logging System Documentation

This application uses a flexible logging system that can be configured for different environments and logging levels.

## Features

- **Multiple log levels**: ERROR, WARN, INFO, DEBUG, TRACE
- **Environment-aware formatting**: JSON in production, colored console output in development
- **Module-based loggers**: Create loggers for specific modules/components
- **Configurable via environment variables**: Set global log level via environment variables
- **Special category loggers**: Built-in support for HTTP, database, and payment logging

## Configuration

Set the log level using the `LOG_LEVEL` environment variable:

```env
# In .env or environment variables
LOG_LEVEL=debug  # Possible values: none, error, warn, info, debug, trace
```

Default log level is `info` if not specified.

## Usage

### Creating a Logger

```typescript
import { createLogger } from '@/utils/logger';

// Create a logger for a specific module
const logger = createLogger('my-module');
```

### Logging Messages

```typescript
// Basic logging
logger.error('This is an error message');
logger.warn('This is a warning message');
logger.info('This is an info message');
logger.debug('This is a debug message');
logger.trace('This is a trace message');

// Logging objects
logger.info({
  userId: '123',
  action: 'login',
  timestamp: new Date()
});

// Logging with additional data
logger.error('Failed to process payment', { orderId: '123', amount: 99.99 });

// Special category logging
logger.http('Received request', { method: 'GET', path: '/api/users' });
logger.db('Database query completed', { table: 'users', queryTime: '10ms' });
logger.payment('Payment processed', { transactionId: 'tx_123', amount: 99.99 });
```

## Log Levels

Logs are filtered based on the configured level:

- **NONE (0)**: No logs will be shown
- **ERROR (1)**: Only error logs
- **WARN (2)**: Error and warning logs
- **INFO (3)**: Error, warning, and info logs (default)
- **DEBUG (4)**: Error, warning, info, and debug logs
- **TRACE (5)**: All logs including trace

## Output Format

### Development Environment

In development, logs are formatted with colors and readable formatting:

```
ERROR [2023-04-25T12:34:56.789Z] [my-module] This is an error message
```

### Production Environment

In production, logs are formatted as JSON for easier parsing by log management systems:

```json
{"timestamp":"2023-04-25T12:34:56.789Z","level":"ERROR","module":"my-module","message":"This is an error message"}
```

## Best Practices

1. Create specific loggers for different modules/components
2. Use appropriate log levels:
   - ERROR: Application errors that need immediate attention
   - WARN: Important issues that don't break the application
   - INFO: General operational information
   - DEBUG: Detailed information for troubleshooting
   - TRACE: Very detailed debugging information

3. Include relevant context in logs
4. Log objects directly rather than string concatenation
5. Use domain-specific loggers (http, db, payment) for better categorization

## Examples

### API Route Logging

```typescript
import { createLogger } from '@/utils/logger';

const logger = createLogger('api-users');

export async function GET(req: Request) {
  logger.http('Received GET request', { 
    headers: Object.fromEntries(req.headers.entries())
  });
  
  try {
    // Process the request
    logger.info('Request processed successfully');
    return Response.json({ success: true });
  } catch (error) {
    logger.error('Failed to process request', { error });
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
```

### Stripe Webhook Logging

```typescript
import { createLogger } from '@/utils/logger';

const logger = createLogger('stripe-webhook');

export async function POST(req: Request) {
  logger.payment('Received Stripe webhook', { 
    event: event.type,
    id: event.id
  });
  
  // Process webhook...
}
``` 