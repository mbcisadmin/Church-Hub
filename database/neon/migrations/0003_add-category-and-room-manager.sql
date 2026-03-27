-- Add category column to applications for nav grouping
ALTER TABLE "applications" ADD COLUMN "category" varchar(50);

-- Fix routes to match actual app routes
UPDATE "applications" SET route = '/events/counter', category = 'events' WHERE key = 'counter';
UPDATE "applications" SET route = '/people', category = 'people' WHERE key = 'people-search';
UPDATE "applications" SET category = 'analytics' WHERE key = 'circles';

-- Deactivate Circles dashboard for McLean
UPDATE "applications" SET is_active = false WHERE key = 'circles';

-- Add Room Manager
INSERT INTO "applications" (name, key, type, category, description, route, icon, sort_order, is_active, requires_auth)
VALUES ('Room Manager', 'room-manager', 'app', 'events', 'Manage event room assignments and check-ins', '/events/room-manager', 'door-open', 2, true, true);
