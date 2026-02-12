import { NextResponse } from 'next/server';
import { auth } from '@church/nextjs-auth';
import { getUserProfile } from '@/services/profileService';

/**
 * GET /api/profile
 * Fetch the current user's complete profile including household and address
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get admin role ID from environment
    const adminRoleId = process.env.ADMIN_SECURITY_ROLE_ID
      ? parseInt(process.env.ADMIN_SECURITY_ROLE_ID, 10)
      : null;

    const profile = await getUserProfile(session.sub, adminRoleId);

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch profile',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
