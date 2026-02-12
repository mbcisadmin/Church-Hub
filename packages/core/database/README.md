# @church/database

Zod schemas and database utilities for all database systems used in Church Hub.

## Features

- ✅ Type-safe Zod schemas for MinistryPlatform tables
- ✅ Type-safe Zod schemas for Neon PostgreSQL tables
- ✅ Runtime validation
- ✅ TypeScript types auto-generated from schemas
- ✅ Organized by database system (MP, Neon, Rock RMS, etc.)

## Installation

```bash
npm install @church/database
```

## Usage

This package is organized by database system. You can import from the root (all
databases) or from specific database modules.

### Import Patterns

```typescript
// Option 1: Import from root (all databases mixed)
import { Event, Contact, PrayerRequest } from '@church/database';

// Option 2: Import from specific database (recommended for clarity)
import { Event, Contact } from '@church/database/ministry-platform';
import { PrayerRequest, WidgetSession } from '@church/database/neon';
```

---

## MinistryPlatform Schemas

### Baseline Table Schemas

Schemas for MinistryPlatform's built-in tables (only fields actually used in
your apps):

```typescript
import {
  EventSchema,
  ContactSchema,
  CongregationSchema,
} from '@church/database/ministry-platform';
import type { Event, Contact } from '@church/database/ministry-platform';

// Runtime validation
const event = EventSchema.parse(data);

// TypeScript type
const myEvent: Event = {
  Event_ID: 123,
  Event_Title: 'Sunday Service',
  Event_Start_Date: new Date(),
  // ...
};

// Validate array
const events = z.array(EventSchema).parse(dataArray);
```

### Custom Table Schemas

Schemas for your church-specific custom tables:

```typescript
import { EventMetricSchema } from '@church/database';
import type { EventMetric } from '@church/database';

const metric: EventMetric = {
  Event_Metric_ID: 1,
  Event_ID: 123,
  Metric_ID: 5,
  Value: 250,
  Created_Date: new Date(),
  Domain_ID: 1,
};
```

---

## Neon PostgreSQL Schemas

### Custom Application Data

Use Neon for app-specific data that doesn't belong in MinistryPlatform:

```typescript
import {
  PrayerRequestSchema,
  WidgetSessionSchema,
} from '@church/database/neon';
import type { PrayerRequest } from '@church/database/neon';

// Example: Prayer widget data
const prayerRequest: PrayerRequest = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  title: 'Healing for my mother',
  description: 'Please pray for...',
  created_at: new Date(),
  // ...
};
```

### When to Use Neon vs MinistryPlatform

**Use MinistryPlatform for:**

- Core church data (contacts, events, groups, giving)
- Data that needs to be in MP for reporting
- Data managed by church staff in MP portal

**Use Neon for:**

- Widget-specific data (prayer requests, voting responses)
- Anonymous submissions
- Session/cache data
- Analytics and tracking
- Data that doesn't fit MP's structure

---

## Schema Organization

```
src/
├── ministry-platform/
│   └── schemas/
│       ├── baseline/       # MP built-in tables
│       │   ├── events.ts
│       │   ├── contacts.ts
│       │   └── congregations.ts
│       └── custom/         # Church-specific MP tables
│           └── event-metrics.ts
│
└── neon/
    └── schemas/            # Neon custom tables
        ├── prayer-requests.ts (future)
        ├── widget-sessions.ts (future)
        └── voting.ts (future)
```

## Adding New Schemas

### For Baseline Tables

1. Find table in MinistryPlatform
2. Create schema with ONLY fields you actually use
3. Add to `schemas/baseline/`
4. Export from `src/index.ts`

Example:

```typescript
// schemas/baseline/groups.ts
import { z } from 'zod';

export const GroupSchema = z.object({
  Group_ID: z.number(),
  Group_Name: z.string(),
  Congregation_ID: z.number().nullable(),
  // Only fields you actually use - not all 100+ MP fields!
});

export type Group = z.infer<typeof GroupSchema>;
```

### For Custom Tables

1. Create table in MP
2. Create migration SQL in `database/customizations/`
3. Create complete Zod schema in `schemas/custom/`
4. Export from `src/index.ts`

Example:

```typescript
// schemas/custom/projects.ts
import { z } from 'zod';

export const ProjectSchema = z.object({
  Project_ID: z.number(),
  Project_Name: z.string(),
  Start_Date: z.date(),
  End_Date: z.date().nullable(),
  Domain_ID: z.number(),
  // All fields for custom tables
});

export type Project = z.infer<typeof ProjectSchema>;
```

## Best Practices

### Baseline Tables (MP Built-in)

- ✅ **Only include fields you use** - MP tables have 100+ fields, don't schema
  them all
- ✅ Document which apps use which fields
- ✅ Update schema when you start using new fields

### Custom Tables (Church-specific)

- ✅ **Include ALL fields** - these are your tables, schema everything
- ✅ Keep in perfect sync with database
- ✅ Version control SQL migrations
- ✅ Always include `Domain_ID` field (required by MP)

## TypeScript Integration

```typescript
import { EventSchema, type Event } from '@church/database';

// Parse and validate data from API
const event = EventSchema.parse(apiData);

// Use in functions
function formatEvent(event: Event): string {
  return `${event.Event_Title} on ${event.Event_Start_Date}`;
}

// Partial updates
const updates = EventSchema.partial().parse({ Event_Title: 'New Title' });
```

## Validation

```typescript
import { EventSchema } from '@church/database';

// Throws error if invalid
const event = EventSchema.parse(data);

// Returns result object
const result = EventSchema.safeParse(data);
if (result.success) {
  console.log('Valid event:', result.data);
} else {
  console.error('Validation errors:', result.error);
}
```
