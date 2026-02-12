// Neon PostgreSQL Database
//
// This module provides the Drizzle ORM client and schemas for Neon PostgreSQL.
// Use Neon for app-specific data that doesn't belong in MinistryPlatform:
// - Application/dashboard configuration and permissions
// - Prayer widget data
// - Anonymous voting/polls
// - Session/cache data
// - Analytics/event tracking
// - Custom app data

// Export the database client
export { db } from './client';

// Export all schemas and types
export * from './schemas/applications';
export * from './schemas/searchHistory';

// Export services
export * from './services/permissions';
