// Seed script for Neon database
// Run with: npx tsx database/neon/seed.ts

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import {
  categories,
  applications,
  appPermissions,
} from '../../packages/core/database/src/neon/schemas/applications';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function seed() {
  console.log('Seeding database...');

  // Insert categories
  const cats = await db
    .insert(categories)
    .values([
      {
        name: 'Events',
        key: 'events',
        icon: 'calendar-days',
        route: '/events',
        addActionUrl: 'https://my.mcleanbible.org/mp/308/0',
        addActionLabel: 'New',
        sortOrder: 1,
      },
      {
        name: 'People',
        key: 'people',
        icon: 'contact',
        route: '/people',
        sortOrder: 2,
      },
      {
        name: 'Groups',
        key: 'groups',
        icon: 'users-round',
        route: 'https://my.mcleanbible.org/mp/322',
        addActionUrl: 'https://my.mcleanbible.org/mp/322/0',
        addActionLabel: 'New',
        sortOrder: 3,
      },
      {
        name: 'Giving',
        key: 'giving',
        icon: 'hand-coins',
        route: 'https://mcleanbible.org/give/',
        addActionUrl: 'https://mcleanbible.onlinegiving.org/donate',
        addActionLabel: 'New',
        sortOrder: 4,
      },
      {
        name: 'Serve',
        key: 'serve',
        icon: 'handshake',
        route: 'https://my.mcleanbible.org/mp/348',
        addActionUrl: 'https://my.mcleanbible.org/mp/348/0',
        addActionLabel: 'New',
        sortOrder: 5,
      },
      {
        name: 'Analytics',
        key: 'analytics',
        icon: 'bar-chart-3',
        route: '/analytics',
        sortOrder: 6,
      },
    ])
    .returning();

  console.log(
    'Inserted categories:',
    cats.map((c) => c.name)
  );

  const eventsCategory = cats.find((c) => c.key === 'events')!;
  const peopleCategory = cats.find((c) => c.key === 'people')!;

  // Insert applications
  const apps = await db
    .insert(applications)
    .values([
      {
        name: 'Counter',
        key: 'counter',
        type: 'app',
        categoryId: eventsCategory.id,
        description: 'Event attendance and metrics tracking',
        route: '/events/counter',
        icon: 'hash',
        sortOrder: 1,
        isActive: true,
        requiresAuth: true,
      },
      {
        name: 'Room Manager',
        key: 'room-manager',
        type: 'app',
        categoryId: eventsCategory.id,
        description: 'Manage event room assignments and check-ins',
        route: '/events/room-manager',
        icon: 'door-open',
        sortOrder: 2,
        isActive: true,
        requiresAuth: true,
      },
      {
        name: 'People Search',
        key: 'people-search',
        type: 'app',
        categoryId: peopleCategory.id,
        description: 'Search and view contact information',
        route: '/people',
        icon: 'search',
        sortOrder: 1,
        isActive: true,
        requiresAuth: true,
      },
    ])
    .returning();

  console.log(
    'Inserted applications:',
    apps.map((a) => a.name)
  );

  console.log('\nSeed complete!');
  console.log('\nNote: Admins (isAdmin=true) have access to all apps by default.');
}

seed().catch(console.error);
