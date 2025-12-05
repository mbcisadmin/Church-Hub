# @church/database

Zod schemas and database utilities for MinistryPlatform tables.

## Features

- ✅ Type-safe Zod schemas for MP baseline tables
- ✅ Schemas for custom church-specific tables
- ✅ Runtime validation
- ✅ TypeScript types auto-generated from schemas

## Installation

```bash
npm install @church/database
```

## Usage

### Baseline Table Schemas

Schemas for MinistryPlatform's built-in tables (only fields actually used in your apps):

```typescript
import { EventSchema, ContactSchema, CongregationSchema } from '@church/database';
import type { Event, Contact } from '@church/database';

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
  Domain_ID: 1
};
```

## Schema Organization

```
schemas/
├── baseline/           # MP built-in tables
│   ├── events.ts
│   ├── contacts.ts
│   └── congregations.ts
│
└── custom/            # Church-specific tables
    └── event-metrics.ts
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

- ✅ **Only include fields you use** - MP tables have 100+ fields, don't schema them all
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
