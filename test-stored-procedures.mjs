#!/usr/bin/env node

/**
 * Test script to verify required stored procedures exist in MinistryPlatform
 * Usage: node test-stored-procedures.mjs
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load .env file manually
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '.env');
try {
  const envContent = readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      process.env[key] = value;
    }
  });
} catch (err) {
  console.error('❌ Could not read .env file:', err.message);
  process.exit(1);
}

async function testStoredProcedures() {
  console.log('🔍 Testing Required Stored Procedures...\n');

  // Get access token
  console.log('🔐 Getting access token...');
  try {
    const tokenUrl = `${process.env.MINISTRY_PLATFORM_BASE_URL}/ministryplatformapi/oauth/connect/token`;

    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      scope: 'http://www.thinkministry.com/dataplatform/scopes/all',
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${process.env.MINISTRY_PLATFORM_CLIENT_ID}:${process.env.MINISTRY_PLATFORM_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Token request failed: ${response.status} ${response.statusText}`);
      console.error(`   Response: ${errorText}`);
      process.exit(1);
    }

    const tokenData = await response.json();
    const accessToken = tokenData.access_token;
    console.log('✅ Access token obtained\n');

    // Test required stored procedure
    const requiredProcs = [
      {
        name: 'api_Custom_GetUserRolesAndGroups_JSON',
        description: 'Fetches user roles and groups for authentication',
        critical: true,
      },
      {
        name: 'api_Custom_GetCongregationsWithSVG',
        description: 'Fetches congregations/campuses (for Counter app)',
        critical: false,
      },
    ];

    let allPassed = true;

    for (const proc of requiredProcs) {
      console.log(`📋 Testing: ${proc.name}`);
      console.log(`   Purpose: ${proc.description}`);

      try {
        // Try to call the stored procedure
        // For the roles procedure, we need a valid User_GUID, so let's just check if it's registered
        const apiUrl = `${process.env.MINISTRY_PLATFORM_BASE_URL}/ministryplatformapi/procedures/${proc.name}`;

        const apiResponse = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (apiResponse.status === 404) {
          console.log(`   ❌ MISSING - Stored procedure not registered in MP`);
          if (proc.critical) {
            console.log(`   ⚠️  CRITICAL: Authentication will fail without this procedure!\n`);
            allPassed = false;
          } else {
            console.log(`   ⚠️  Optional: Some features may not work\n`);
          }
        } else if (apiResponse.ok) {
          console.log(`   ✅ EXISTS - Stored procedure is registered\n`);
        } else {
          console.log(`   ⚠️  UNKNOWN - Status: ${apiResponse.status}`);
          console.log(`   Response: ${await apiResponse.text()}\n`);
        }
      } catch (error) {
        console.log(`   ❌ ERROR testing procedure: ${error.message}\n`);
        if (proc.critical) allPassed = false;
      }
    }

    console.log('─────────────────────────────────────────');
    if (allPassed) {
      console.log('✅ All critical stored procedures are present!\n');
      console.log('Next steps:');
      console.log('  1. Visit: http://localhost:3000');
      console.log('  2. Click "Sign In"');
      console.log('  3. Use McLean Bible Church credentials\n');
    } else {
      console.log('❌ Missing critical stored procedures!\n');
      console.log('Required Actions:');
      console.log('  1. Connect to McLean\'s MP SQL Server using SSMS');
      console.log('  2. Create the missing stored procedures');
      console.log('  3. Register them in MP Admin Console → API Procedures');
      console.log('  4. Re-run this test\n');
      console.log('See SETUP.md for SQL scripts and detailed instructions.\n');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.cause) {
      console.error('   Cause:', error.cause);
    }
    process.exit(1);
  }
}

testStoredProcedures();
