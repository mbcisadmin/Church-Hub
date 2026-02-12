// Neon PostgreSQL Client (Drizzle ORM)
//
// This file provides a type-safe database client for Neon PostgreSQL.
// Configure DATABASE_URL in your .env file to connect.

import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http';

// Import all schemas
import * as applicationsSchema from './schemas/applications';

// Lazy-initialized database client
let _db: NeonHttpDatabase<typeof applicationsSchema> | null = null;

/**
 * Get the Drizzle database client.
 * Lazily initializes on first call to avoid build-time errors when DATABASE_URL isn't set.
 */
export function getDb(): NeonHttpDatabase<typeof applicationsSchema> {
  if (!_db) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    const sql = neon(process.env.DATABASE_URL);
    _db = drizzle(sql, {
      schema: {
        ...applicationsSchema,
      },
    });
  }
  return _db;
}

// For backwards compatibility, export db as a getter
// This will throw at runtime if DATABASE_URL isn't set, but won't fail at build time
export const db = new Proxy({} as NeonHttpDatabase<typeof applicationsSchema>, {
  get(_, prop) {
    return (getDb() as any)[prop];
  },
});

// Re-export schema types for convenience
export * from './schemas/applications';

// Example usage:
// import { db, applications, appPermissions } from '@church/database/neon/client';
//
// // Get all active apps
// const apps = await db.select().from(applications).where(eq(applications.isActive, true));
//
// // Check user permissions
// const permissions = await db.select().from(appPermissions).where(eq(appPermissions.roleName, 'My Group'));
