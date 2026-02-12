-- Search History Table
-- Tracks recently clicked search results for showing "Recent" items

CREATE TABLE "search_history" (
  "id" serial PRIMARY KEY NOT NULL,
  "contact_id" integer NOT NULL,
  "result_type" varchar(50) NOT NULL,
  "result_id" varchar(100) NOT NULL,
  "result_title" varchar(255) NOT NULL,
  "result_subtitle" varchar(255),
  "result_route" varchar(255) NOT NULL,
  "result_icon" varchar(50),
  "result_image_url" varchar(500),
  "clicked_at" timestamp DEFAULT now() NOT NULL
);

-- Index for efficient lookup by user, ordered by most recent
CREATE INDEX "idx_search_history_contact" ON "search_history" ("contact_id", "clicked_at" DESC);
