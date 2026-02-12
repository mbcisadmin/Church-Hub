#!/usr/bin/env node

/**
 * Test script to verify MinistryPlatform API connection
 * Usage: node test-mp-connection.mjs
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

// Simple test without requiring the full package imports
async function testConnection() {
  console.log('🔍 Testing MinistryPlatform Connection...\n');

  // Validate environment variables
  const requiredVars = [
    'MINISTRY_PLATFORM_BASE_URL',
    'MINISTRY_PLATFORM_CLIENT_ID',
    'MINISTRY_PLATFORM_CLIENT_SECRET',
  ];

  console.log('✓ Checking environment variables...');
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      console.error(`❌ Missing environment variable: ${varName}`);
      process.exit(1);
    }
  }
  console.log(`  Base URL: ${process.env.MINISTRY_PLATFORM_BASE_URL}`);
  console.log(`  Client ID: ${process.env.MINISTRY_PLATFORM_CLIENT_ID}`);
  console.log(`  Client Secret: ${process.env.MINISTRY_PLATFORM_CLIENT_SECRET?.substring(0, 8)}...`);
  console.log('');

  // Test OAuth token retrieval
  console.log('🔐 Testing OAuth token retrieval...');
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
    console.log('✅ Successfully obtained access token');
    console.log(`   Token type: ${tokenData.token_type}`);
    console.log(`   Expires in: ${tokenData.expires_in} seconds`);
    console.log('');

    // Test a simple API call
    console.log('📊 Testing API call (fetching tables metadata)...');
    const apiUrl = `${process.env.MINISTRY_PLATFORM_BASE_URL}/ministryplatformapi/tables`;

    const apiResponse = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error(`❌ API request failed: ${apiResponse.status} ${apiResponse.statusText}`);
      console.error(`   Response: ${errorText}`);
      process.exit(1);
    }

    const tables = await apiResponse.json();
    console.log(`✅ Successfully connected to MinistryPlatform API`);
    console.log(`   Available tables: ${tables.length}`);
    console.log(`   Sample tables: ${tables.slice(0, 5).map(t => t.name || t).join(', ')}`);
    console.log('');

    console.log('🎉 All connection tests passed!\n');
    console.log('Next steps:');
    console.log('  1. Run: npm run dev');
    console.log('  2. Visit: http://localhost:3000');
    console.log('  3. Try signing in with McLean Bible Church credentials\n');

  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    if (error.cause) {
      console.error('   Cause:', error.cause);
    }
    process.exit(1);
  }
}

testConnection();
