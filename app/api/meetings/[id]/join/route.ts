import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { meetings, meetingParticipants } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq } from 'drizzle-orm';

// POST - Join a meeting (log participant)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const meetingId = parseInt(id);

    const [meeting] = await db
      .select()
      .from(meetings)
      .where(eq(meetings.id, meetingId));

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    if (!meeting.isActive) {
      return NextResponse.json(
        { error: 'Meeting is not active (killed by admin)' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { isModerator } = body;

    // Add participant to the meeting
    const [participant] = await db
      .insert(meetingParticipants)
      .values({
        meetingId: meeting.id,
        userId: user.id,
        name: user.name || user.email,
        email: user.email,
        isModerator: isModerator || meeting.createdBy === user.id,
      })
      .returning();

    // Update meeting status to active if it's the first participant
    if (meeting.status === 'scheduled') {
      await db
        .update(meetings)
        .set({
          status: 'active',
          startedAt: new Date(),
        })
        .where(eq(meetings.id, meetingId));
    }

    return NextResponse.json({ participant, meeting });
  } catch (error) {
    console.error('Error joining meeting:', error);
    return NextResponse.json(
      { error: 'Failed to join meeting' },
      { status: 500 }
    );
  }
}
