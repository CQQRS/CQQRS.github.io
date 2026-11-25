# CQQRS Classes

This directory contains reusable TypeScript classes and utilities for the CQQRS project.

## CQQRS API Client

A comprehensive, type-safe TypeScript client library for the CQQRS API.

### Files

- **[CqqrsApiClient.ts](./CqqrsApiClient.ts)** - Main client library implementation
  - `CqqrsApiClient` - Main client class
  - `HttpError` - Custom error class for HTTP errors
  - `createCqqrsClient()` - Factory function for creating clients
  - Type definitions for all API responses

- **[CqqrsApiClient.examples.ts](./CqqrsApiClient.examples.ts)** - Practical examples
  - 10 complete working examples
  - Common use cases and patterns
  - Error handling examples
  - File upload examples

- **[CqqrsApiClient.test.ts](./CqqrsApiClient.test.ts)** - Unit tests
  - Full test coverage for the client
  - Run with: `bun test CqqrsApiClient.test.ts`

- **[CQQRS_API_CLIENT.md](./CQQRS_API_CLIENT.md)** - Full documentation
  - Complete API reference
  - Type definitions
  - Detailed examples
  - Troubleshooting guide
  - Performance considerations

- **[CQQRS_API_CLIENT_QUICK_REF.md](./CQQRS_API_CLIENT_QUICK_REF.md)** - Quick reference
  - Quick lookup tables
  - Common patterns
  - Tips and best practices
  - Brief examples

## Quick Start

```typescript
import { createCqqrsClient } from './classes/CqqrsApiClient';

const client = createCqqrsClient();

// Get all members
const members = await client.members.getAll();

// Get a specific member
const member = await client.members.get('W5XYZ');

// Get reports
const reports = await client.reports.getAll(2026, 44);
```

## API Endpoints

### Reports
- `GET /reports/{year}/{week}` - Get all reports for an edition
- `GET /reports/{year}/{week}/{callsign}` - Get a specific report
- `GET /reports/{year}/{week}/images/{imageName}` - Get report image

### Members
- `GET /members/` - Get all members
- `GET /members/{callsign}` - Get a specific member
- `GET /members/{callsign}/avitar` - Get member avatar
- `POST /members/{callsign}/avitar` - Upload member avatar

## Features

- 🎯 **Type-Safe** - Full TypeScript support with interfaces
- ⚡ **Lightweight** - Zero external dependencies
- 🔄 **Async/Await** - Promise-based API
- 🛡️ **Error Handling** - Custom error classes
- ⏱️ **Timeout Support** - Configurable timeouts
- 📝 **Well Documented** - Comprehensive documentation and examples

## Usage

For detailed information, see:
- [Full Documentation](./CQQRS_API_CLIENT.md)
- [Quick Reference](./CQQRS_API_CLIENT_QUICK_REF.md)
- [Examples](./CqqrsApiClient.examples.ts)
- [Tests](./CqqrsApiClient.test.ts)

## Configuration

```typescript
const client = createCqqrsClient({
  baseUrl: 'https://conryclan.com/projects/cqqrsnet/api',
  apiVersion: 'v1',
  timeout: 30000, // 30 seconds
});
```

## Error Handling

```typescript
import { HttpError } from './classes/CqqrsApiClient';

try {
  const member = await client.members.get('W5XYZ');
} catch (error) {
  if (error instanceof HttpError) {
    console.error(`HTTP ${error.status}: ${error.message}`);
  }
}
```

## Running Tests

```bash
bun test CqqrsApiClient.test.ts
```

## Contributing

When adding new endpoints or features:
1. Update `CqqrsApiClient.ts` with the new functionality
2. Add examples to `CqqrsApiClient.examples.ts`
3. Add tests to `CqqrsApiClient.test.ts`
4. Update documentation in `CQQRS_API_CLIENT.md`
5. Update quick reference in `CQQRS_API_CLIENT_QUICK_REF.md`

## License

Same as CQQRS project.
