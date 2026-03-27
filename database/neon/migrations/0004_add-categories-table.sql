-- Create categories table
CREATE TABLE "categories" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" varchar(100) NOT NULL,
  "key" varchar(50) NOT NULL,
  "icon" varchar(50),
  "route" varchar(255),
  "add_action_url" varchar(255),
  "add_action_label" varchar(50),
  "sort_order" integer DEFAULT 0,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now(),
  CONSTRAINT "categories_key_unique" UNIQUE("key")
);

-- Seed categories for McLean
INSERT INTO "categories" (name, key, icon, route, add_action_url, add_action_label, sort_order) VALUES
  ('Events', 'events', 'calendar-days', '/events', 'https://my.mcleanbible.org/mp/308/0', 'New', 1),
  ('People', 'people', 'contact', '/people', NULL, NULL, 2),
  ('Groups', 'groups', 'users-round', 'https://my.mcleanbible.org/mp/322', 'https://my.mcleanbible.org/mp/322/0', 'New', 3),
  ('Giving', 'giving', 'hand-coins', 'https://mcleanbible.org/give/', 'https://mcleanbible.onlinegiving.org/donate', 'New', 4),
  ('Serve', 'serve', 'handshake', 'https://my.mcleanbible.org/mp/348', 'https://my.mcleanbible.org/mp/348/0', 'New', 5),
  ('Analytics', 'analytics', 'bar-chart-3', '/analytics', NULL, NULL, 6);

-- Add category_id FK to applications
ALTER TABLE "applications" ADD COLUMN "category_id" integer;

-- Populate category_id from existing category varchar
UPDATE "applications" SET category_id = c.id
FROM "categories" c
WHERE "applications".category = c.key;

-- Drop old category varchar column
ALTER TABLE "applications" DROP COLUMN "category";

-- Add FK constraint
ALTER TABLE "applications" ADD CONSTRAINT "applications_category_id_categories_id_fk"
  FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL;
