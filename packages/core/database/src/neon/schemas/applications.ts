import {
  pgTable,
  serial,
  text,
  varchar,
  boolean,
  timestamp,
  integer,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

/**
 * Application type enum
 * - 'app': Standard micro-app (e.g., /counter, /people-search)
 * - 'dashboard': Data dashboard (e.g., /dashboards/circles)
 */
export const applicationTypeEnum = pgEnum('application_type', ['app', 'dashboard']);

/**
 * Applications Table
 * Stores configuration for apps and dashboards in the platform.
 *
 * Both apps and dashboards share the same permissions model and are displayed
 * in the platform navigation. The 'type' field distinguishes between them
 * for UI grouping purposes.
 */
export const applications = pgTable('applications', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  key: varchar('key', { length: 50 }).notNull().unique(), // URL-safe key (e.g., 'counter', 'circles')
  type: applicationTypeEnum('type').notNull().default('app'), // 'app' or 'dashboard'
  description: text('description'),
  route: varchar('route', { length: 255 }).notNull(), // Route path (e.g., '/counter', '/dashboards/circles')
  icon: varchar('icon', { length: 50 }), // Lucide icon name (e.g., 'calculator', 'pie-chart')
  illustration: varchar('illustration', { length: 255 }), // Path to illustration SVG (e.g., '/illustrations/circles.svg')
  sortOrder: integer('sort_order').default(0),
  isActive: boolean('is_active').default(true),
  requiresAuth: boolean('requires_auth').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

/**
 * App Permissions Table
 * Controls which users/roles have access to which apps and dashboards.
 *
 * Permissions can be granted by:
 * - User Group name (roleName) - Recommended for most cases
 * - Specific user email (userEmail) - For one-off access grants
 *
 * Permission levels:
 * - canView: Can see and access the app/dashboard
 * - canEdit: Can modify data within the app (app-specific interpretation)
 * - canDelete: Can delete data within the app (app-specific interpretation)
 */
export const appPermissions = pgTable('app_permissions', {
  id: serial('id').primaryKey(),
  applicationId: integer('application_id')
    .notNull()
    .references(() => applications.id, { onDelete: 'cascade' }),
  userEmail: varchar('user_email', { length: 255 }), // Optional: specific user email
  roleName: varchar('role_name', { length: 255 }), // Optional: MinistryPlatform User Group Name
  canView: boolean('can_view').default(true),
  canEdit: boolean('can_edit').default(false),
  canDelete: boolean('can_delete').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Define relations
export const applicationsRelations = relations(applications, ({ many }) => ({
  permissions: many(appPermissions),
}));

export const appPermissionsRelations = relations(appPermissions, ({ one }) => ({
  application: one(applications, {
    fields: [appPermissions.applicationId],
    references: [applications.id],
  }),
}));

// Export types
export type Application = typeof applications.$inferSelect;
export type NewApplication = typeof applications.$inferInsert;
export type ApplicationType = 'app' | 'dashboard';

export type AppPermission = typeof appPermissions.$inferSelect;
export type NewAppPermission = typeof appPermissions.$inferInsert;
