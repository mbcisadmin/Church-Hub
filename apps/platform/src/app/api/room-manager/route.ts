import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@church/nextjs-auth';
import { getRoomManagerData } from '@/services/roomManagerService';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const eventId = request.nextUrl.searchParams.get('eventId');
    if (!eventId) {
      return NextResponse.json({ error: 'Missing required parameter: eventId' }, { status: 400 });
    }

    const data = await getRoomManagerData(parseInt(eventId));
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching room manager data:', error);
    return NextResponse.json({ error: 'Failed to fetch room manager data' }, { status: 500 });
  }
}
