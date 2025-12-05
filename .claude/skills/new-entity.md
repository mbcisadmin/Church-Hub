# New Entity Schema

Create a new Zod schema in the `@church/database` package for type-safe MinistryPlatform data handling.

## What You'll Create

A Zod schema file that provides:
- Runtime validation of MP data
- TypeScript type inference
- Metadata about the table
- Consistent data handling across the app

## Implementation

### Step 1: Determine Schema Type

Ask the user:
- Is this a **baseline MP table** (built-in to MP) or a **custom table** (church-specific)?
- What is the table name in MinistryPlatform?
- What fields will the app actually use?

### Step 2: Create the Schema File

#### For Baseline Tables (MP Built-in)

Create `packages/core/database/schemas/baseline/[table-name].ts`:

```typescript
import { z } from 'zod';

/**
 * [TableName] Schema
 * Only includes fields actually used in applications (not all MP fields)
 */
export const [TableName]Schema = z.object({
  [Table]_ID: z.number(),
  [Field1]: z.string(),
  [Field2]: z.number().nullable(),
  [Field3]: z.date().nullable(),
  Created_Date: z.date().optional(),
  Modified_Date: z.date().optional(),
  Domain_ID: z.number().default(1),
});

/**
 * TypeScript type inferred from schema
 */
export type [TableName] = z.infer<typeof [TableName]Schema>;

/**
 * Metadata about this table
 */
export const [TableName]Meta = {
  table: '[Table_Name]',
  type: 'baseline' as const,
  usedBy: ['apps-platform'], // Which apps use this schema
  notes: 'Only core fields included - MP has 100+ fields'
};
```

#### For Custom Tables (Church-specific)

Create `packages/core/database/schemas/custom/[table-name].ts`:

```typescript
import { z } from 'zod';

/**
 * [TableName] Schema
 * Custom table - includes ALL fields since it's church-defined
 */
export const [TableName]Schema = z.object({
  [Table]_ID: z.number(),
  [Field1]: z.string(),
  [Field2]: z.number(),
  [Field3]: z.date().nullable(),
  Created_Date: z.date(),
  Created_By: z.number(),
  Modified_Date: z.date().nullable(),
  Modified_By: z.number().nullable(),
  Domain_ID: z.number().default(1),
});

export type [TableName] = z.infer<typeof [TableName]Schema>;

/**
 * Schema for creating records (excludes auto-generated fields)
 */
export const Create[TableName]Schema = [TableName]Schema.omit({
  [Table]_ID: true,
  Created_Date: true,
  Created_By: true,
  Modified_Date: true,
  Modified_By: true,
});

export type Create[TableName] = z.infer<typeof Create[TableName]Schema>;

/**
 * Metadata about this custom table
 */
export const [TableName]Meta = {
  table: '[Table_Name]',
  type: 'custom' as const,
  migration: '001_create_[table_name].sql',
  dependencies: ['OtherTable1', 'OtherTable2'], // FK dependencies
  usedBy: ['apps-platform'],
  description: 'Purpose of this custom table'
};
```

### Step 3: Common Field Types

Use these Zod types for common MinistryPlatform field patterns:

```typescript
// Primary Key
Table_ID: z.number()

// Foreign Keys
Related_Table_ID: z.number().nullable()

// Text fields
Short_Text: z.string()
Long_Text: z.string().nullable()

// Numbers
Integer_Field: z.number()
Decimal_Field: z.number()
Nullable_Number: z.number().nullable()

// Booleans
Is_Active: z.boolean().default(true)
Nullable_Boolean: z.boolean().nullable()

// Dates
Date_Field: z.date()
Nullable_Date: z.date().nullable()
Optional_Date: z.date().optional()

// Enums (if MP has specific values)
Status: z.enum(['Active', 'Inactive', 'Pending'])

// Audit fields (standard on all MP tables)
Created_Date: z.date()
Created_By: z.number()
Modified_Date: z.date().nullable()
Modified_By: z.number().nullable()
Domain_ID: z.number().default(1)
```

### Step 4: Export from Index

Add to `packages/core/database/src/index.ts`:

```typescript
// Baseline schemas (if baseline)
export * from '../schemas/baseline/[table-name]';

// OR

// Custom schemas (if custom)
export * from '../schemas/custom/[table-name]';
```

### Step 5: Use in Services

Now you can use the schema in your service:

```typescript
import { [TableName], Create[TableName]Schema } from "@church/database";

export class YourService {
  async getData() {
    return this.tableService.getTableRecords<[TableName]>('[Table_Name]', {
      $select: 'Field1,Field2,Field3',
    });
  }

  async createData(data: unknown) {
    // Validate with Zod
    const validatedData = Create[TableName]Schema.parse(data);

    const result = await this.tableService.createTableRecords(
      '[Table_Name]',
      [validatedData],
      this.userId
    );
    return result[0];
  }
}
```

## Best Practices

### Baseline Tables
1. **Only include used fields** - MP tables have 100+ fields, only add what you need
2. **Document which apps use it** - helps with refactoring
3. **Make nullable fields explicit** - use `.nullable()` or `.optional()`

### Custom Tables
1. **Include ALL fields** - since it's church-defined, document everything
2. **Create separate "Create" schema** - omit auto-generated fields
3. **Document migrations** - link to the SQL migration file
4. **List dependencies** - what other tables have foreign keys

### General
1. **Use descriptive field names** - follow MP naming (snake_case with table prefix)
2. **Default Domain_ID to 1** - unless multi-tenant
3. **Include audit fields** - Created_Date, Created_By, etc.
4. **Add JSDoc comments** - explain complex fields
5. **Group related fields** - use comments to organize

## Example: Complete Event Metric Schema

```typescript
import { z } from 'zod';

/**
 * Event Metric Schema
 * Tracks numeric metrics for events (attendance, guests, etc.)
 */
export const EventMetricSchema = z.object({
  Event_Metric_ID: z.number(),
  Event_ID: z.number(),
  Metric_ID: z.number(),
  Numerical_Value: z.number(),
  Group_ID: z.number().optional().nullable(),
  Created_Date: z.date(),
  Created_By: z.number(),
  Modified_Date: z.date().nullable(),
  Modified_By: z.number().nullable(),
  Domain_ID: z.number().default(1),
});

export type EventMetric = z.infer<typeof EventMetricSchema>;

export const CreateEventMetricSchema = EventMetricSchema.omit({
  Event_Metric_ID: true,
  Created_Date: true,
  Created_By: true,
  Modified_Date: true,
  Modified_By: true,
});

export type CreateEventMetric = z.infer<typeof CreateEventMetricSchema>;

export const EventMetricMeta = {
  table: 'Event_Metrics',
  type: 'custom' as const,
  migration: '001_create_event_metrics.sql',
  dependencies: ['Events', 'Metrics'],
  usedBy: ['apps-platform'],
  description: 'Numeric metrics recorded for events (attendance, etc.)'
};
```

## Testing

After creation:
1. Import the schema in a service file
2. Test validation with valid data: `Schema.parse(validData)`
3. Test validation with invalid data (should throw ZodError)
4. Verify TypeScript autocomplete works
5. Check that the types match actual MP data structure
