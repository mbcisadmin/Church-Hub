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
 * Categories Table
 * Groups applications in the navigation sidebar.
 * Each category can link to an internal route or external URL,
 * and optionally has a "New" action button.
 */
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  key: varchar('key', { length: 50 }).notNull().unique(),
  icon: varchar('icon', { length: 50 }),
  route: varchar('route', { length: 255 }), // Internal route or external URL
  addActionUrl: varchar('add_action_url', { length: 255 }), // "New" button URL
  addActionLabel: varchar('add_action_label', { length: 50 }), // "New" button label
  sortOrder: integer('sort_order').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

/**
 * Applications Table
 * Stores configuration for apps and dashboards in the platform.
 */
export const applications = pgTable('applications', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  key: varchar('key', { length: 50 }).notNull().unique(),
  type: applicationTypeEnum('type').notNull().default('app'),
  categoryId: integer('category_id').references(() => categories.id, { onDelete: 'set null' }),
  description: text('description'),
  route: varchar('route', { length: 255 }).notNull(),
  icon: varchar('icon', { length: 50 }),
  illustration: varchar('illustration', { length: 255 }),
  sortOrder: integer('sort_order').default(0),
  isActive: boolean('is_active').default(true),
  requiresAuth: boolean('requires_auth').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

/**
 * App Permissions Table
 * Controls which users/roles have access to which apps and dashboards.
 */
export const appPermissions = pgTable('app_permissions', {
  id: serial('id').primaryKey(),
  applicationId: integer('application_id')
    .notNull()
    .references(() => applications.id, { onDelete: 'cascade' }),
  userEmail: varchar('user_email', { length: 255 }),
  roleName: varchar('role_name', { length: 255 }),
  canView: boolean('can_view').default(true),
  canEdit: boolean('can_edit').default(false),
  canDelete: boolean('can_delete').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Define relations
export const categoriesRelations = relations(categories, ({ many }) => ({
  applications: many(applications),
}));

export const applicationsRelations = relations(applications, ({ one, many }) => ({
  category: one(categories, {
    fields: [applications.categoryId],
    references: [categories.id],
  }),
  permissions: many(appPermissions),
}));

export const appPermissionsRelations = relations(appPermissions, ({ one }) => ({
  application: one(applications, {
    fields: [appPermissions.applicationId],
    references: [applications.id],
  }),
}));

// Export types
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Application = typeof applications.$inferSelect;
export type NewApplication = typeof applications.$inferInsert;
export type ApplicationType = 'app' | 'dashboard';

export type AppPermission = typeof appPermissions.$inferSelect;
export type NewAppPermission = typeof appPermissions.$inferInsert;
