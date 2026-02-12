import { defineConfig } from 'drizzle-kit';

// Drizzle ORM Configuration for Neon PostgreSQL
//
// This file configures Drizzle Kit for managing Neon database schemas.
// Update the connection string in .env when ready to use Neon.

export default defineConfig({
  // Schema location
  schema: './packages/core/database/src/neon/schemas/**/*.ts',

  // Migration output directory
  out: './database/neon/migrations',

  // Database driver
  dialect: 'postgresql',

  // Database connection (from environment variable)
  dbCredentials: {
    url: process.env.DATABASE_URL || '',
  },

  // Verbose logging
  verbose: true,

  // Strict mode (recommended)
  strict: true,
});
