import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@church/nextjs-auth';
import { getEventMetrics, updateEventMetric, deleteEventMetric } from '@/services/counterService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { eventId } = await params;
    const eventMetrics = await getEventMetrics(parseInt(eventId));

    return NextResponse.json(eventMetrics);
  } catch (error) {
    console.error('Error fetching event metrics:', error);
    return NextResponse.json({ error: 'Failed to fetch event metrics' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { eventMetricId, data } = await request.json();

    if (!eventMetricId) {
      return NextResponse.json({ error: 'Missing eventMetricId' }, { status: 400 });
    }

    const userId = parseInt(session.userId, 10);
    await updateEventMetric(eventMetricId, data, userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating event metric:', error);
    return NextResponse.json({ error: 'Failed to update event metric' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { eventMetricId } = await request.json();

    if (!eventMetricId) {
      return NextResponse.json({ error: 'Missing eventMetricId' }, { status: 400 });
    }

    const userId = parseInt(session.userId, 10);
    await deleteEventMetric(eventMetricId, userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting event metric:', error);
    return NextResponse.json({ error: 'Failed to delete event metric' }, { status: 500 });
  }
}
