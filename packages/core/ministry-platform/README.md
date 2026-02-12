# @church/ministry-platform

Framework-agnostic MinistryPlatform API client for Node.js and browser
environments.

## Features

- ✅ OAuth2 client credentials authentication with automatic token refresh
- ✅ Type-safe HTTP client for MP API
- ✅ Table service with CRUD operations
- ✅ Stored procedure execution
- ✅ **REQUIRED `$userId` parameter on CREATE/UPDATE for proper audit logging**

## Installation

```bash
npm install @church/ministry-platform
```

## Usage

### Basic Setup

```typescript
import {
  MinistryPlatformClient,
  TableService,
} from '@church/ministry-platform';

// Create client instance
const client = new MinistryPlatformClient();
const tableService = new TableService(client);
```

### Table Operations

#### GET (Read)

```typescript
// Get all events
const events = await tableService.getTableRecords('Events', {
  $select: 'Event_ID,Event_Title,Event_Start_Date',
  $filter: 'Event_Start_Date >= GETDATE()',
});
```

#### POST (Create) - **userId REQUIRED**

```typescript
// Create new event
const newEvents = await tableService.createTableRecords(
  'Events',
  [{ Event_Title: 'Sunday Service', Event_Start_Date: new Date() }],
  session.user.contactId // REQUIRED: MP logs this user as creator
);
```

#### PUT (Update) - **userId REQUIRED**

```typescript
// Update events
const updatedEvents = await tableService.updateTableRecords(
  'Events',
  [{ Event_ID: 123, Event_Title: 'Updated Title' }],
  session.user.contactId // REQUIRED: MP logs this user as updater
);
```

#### DELETE

```typescript
// Delete events
await tableService.deleteTableRecords('Events', [123, 456]);
```

### Stored Procedures

```typescript
import { ProcedureService } from '@church/ministry-platform';

const procedureService = new ProcedureService(client);

// Execute with query params
const results = await procedureService.executeProcedure(
  'api_Custom_GetActiveGroups',
  { '@CongregationID': 1 }
);

// Execute with body params
const results = await procedureService.executeProcedureWithBody(
  'api_Custom_GetActiveGroups',
  { CongregationID: 1 }
);
```

## Critical: $userId Standard

**All CREATE and UPDATE operations REQUIRE a `userId` parameter.**

This ensures proper audit logging in MinistryPlatform:

- ✅ MP audit logs show the actual user (e.g., "John Doe created Event_ID 123")
- ✅ Users don't need direct MP table permissions
- ✅ App credentials handle API access, `userId` handles attribution

**TypeScript enforces this requirement** - you cannot call create/update without
providing a userId.

```typescript
// ✅ CORRECT
await tableService.createTableRecords(
  'Events',
  [{ Event_Title: 'New Event' }],
  session.user.contactId // Required!
);

// ❌ WILL NOT COMPILE - Missing userId
await tableService.createTableRecords('Events', [{ Event_Title: 'New Event' }]);
```

## Environment Variables

```env
MINISTRY_PLATFORM_BASE_URL=https://your-church.ministryplatform.com
MINISTRY_PLATFORM_CLIENT_ID=your-client-id
MINISTRY_PLATFORM_CLIENT_SECRET=your-client-secret
```

## API Reference

See TypeScript types and JSDoc comments in source code for full API
documentation.
