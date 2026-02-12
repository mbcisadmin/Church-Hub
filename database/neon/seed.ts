// Seed script for Neon database
// Run with: npx tsx database/neon/seed.ts

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import {
  applications,
  appPermissions,
} from '../../packages/core/database/src/neon/schemas/applications';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function seed() {
  console.log('Seeding database...');

  // Insert applications
  const apps = await db
    .insert(applications)
    .values([
      {
        name: 'Counter',
        key: 'counter',
        type: 'app',
        description: 'Event attendance and metrics tracking',
        route: '/counter',
        icon: 'calculator',
        sortOrder: 1,
        isActive: true,
        requiresAuth: true,
      },
      {
        name: 'People Search',
        key: 'people-search',
        type: 'app',
        description: 'Search and view contact information',
        route: '/people-search',
        icon: 'search',
        sortOrder: 2,
        isActive: true,
        requiresAuth: true,
      },
      {
        name: 'Circles Dashboard',
        key: 'circles',
        type: 'dashboard',
        description: 'Engagement circles analytics and metrics',
        route: '/analytics/dashboards/circles',
        icon: 'pie-chart',
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

  // Get app IDs
  const counterApp = apps.find((a) => a.key === 'counter')!;
  const peopleSearchApp = apps.find((a) => a.key === 'people-search')!;
  const circlesApp = apps.find((a) => a.key === 'circles')!;

  // Insert permissions
  // Note: Admins (isAdmin=true from security role) bypass these checks
  // These permissions are for User Groups
  const permissions = await db
    .insert(appPermissions)
    .values([
      // CircleDashboard group gets access to Circles Dashboard
      {
        applicationId: circlesApp.id,
        roleName: 'CircleDashboard',
        canView: true,
        canEdit: false,
        canDelete: false,
      },
      // You can add more permissions here as needed
      // Example: Counter access for a specific group
      // {
      //   applicationId: counterApp.id,
      //   roleName: 'Counter Team',
      //   canView: true,
      //   canEdit: true,
      //   canDelete: false,
      // },
    ])
    .returning();

  console.log('Inserted permissions:', permissions.length);
  console.log('\nSeed complete!');
  console.log('\nNote: Admins (isAdmin=true) have access to all apps by default.');
  console.log('The permissions table is for granting access to specific User Groups.');
}

seed().catch(console.error);
