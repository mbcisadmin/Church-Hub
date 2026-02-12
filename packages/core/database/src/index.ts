// Database Package
//
// This package provides type-safe schemas for all database systems used in Gospel Kit.
// Schemas are organized by database system (MinistryPlatform, Neon, etc.)

// Re-export all MinistryPlatform schemas (for backward compatibility)
export * from './ministry-platform';

// Re-export all Neon schemas
export * from './neon';

// Future database systems can be added here:
// export * from './rock-rms';
// export * from './planning-center';
