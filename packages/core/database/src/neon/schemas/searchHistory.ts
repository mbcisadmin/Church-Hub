import { pgTable, serial, varchar, timestamp, integer, index } from 'drizzle-orm/pg-core';

/**
 * Search History Table
 * Tracks recently clicked search results for each user.
 *
 * Used to show "Recent" items in the search sheet before the user starts typing.
 * Stored by MP Contact ID for cross-device sync.
 */
export const searchHistory = pgTable(
  'search_history',
  {
    id: serial('id').primaryKey(),
    contactId: integer('contact_id').notNull(), // MP Contact ID
    resultType: varchar('result_type', { length: 50 }).notNull(), // 'app', 'dashboard', 'person', etc.
    resultId: varchar('result_id', { length: 100 }).notNull(), // MP ID, app route, etc.
    resultTitle: varchar('result_title', { length: 255 }).notNull(), // Display title
    resultSubtitle: varchar('result_subtitle', { length: 255 }), // Optional subtitle (email, etc.)
    resultRoute: varchar('result_route', { length: 255 }).notNull(), // Full route to navigate to
    resultIcon: varchar('result_icon', { length: 50 }), // Icon name for apps/dashboards
    resultImageUrl: varchar('result_image_url', { length: 500 }), // Image URL for people
    clickedAt: timestamp('clicked_at').defaultNow().notNull(),
  },
  (table) => [
    // Index for efficient lookup by user, ordered by most recent
    index('idx_search_history_contact').on(table.contactId, table.clickedAt),
  ]
);

// Export types
export type SearchHistoryEntry = typeof searchHistory.$inferSelect;
export type NewSearchHistoryEntry = typeof searchHistory.$inferInsert;
