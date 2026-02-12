import { NextResponse } from 'next/server';
import { auth } from '@church/nextjs-auth';
import { getCongregations } from '@/services/counterService';

export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const congregations = await getCongregations();

    return NextResponse.json({
      congregations,
      userWebCongregation: null, // Could be enhanced to get from user profile
    });
  } catch (error) {
    console.error('Error fetching congregations:', error);
    return NextResponse.json({ error: 'Failed to fetch congregations' }, { status: 500 });
  }
}
