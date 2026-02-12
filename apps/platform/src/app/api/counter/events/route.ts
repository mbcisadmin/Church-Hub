import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@church/nextjs-auth';
import { getEvents } from '@/services/counterService';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');
    const congregationIdParam = searchParams.get('congregationId');

    if (!date) {
      return NextResponse.json({ error: 'Missing required parameter: date' }, { status: 400 });
    }

    const congregationId = congregationIdParam ? parseInt(congregationIdParam) : null;
    const events = await getEvents(date, congregationId);

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}
