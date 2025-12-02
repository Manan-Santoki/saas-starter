import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { meetings, meetingParticipants, activityLogs } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq, desc, and } from 'drizzle-orm';
import { getTeamForUser } from '@/lib/db/queries';
import { v4 as uuidv4 } from 'uuid';

// GET - List all meetings for the user's team
export async function GET(request: NextRequest) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const teamData = await getTeamForUser(user.id);

    if (!teamData) {
      return NextResponse.json({ error: 'No team found' }, { status: 404 });
    }

    const teamMeetings = await db
      .select()
      .from(meetings)
      .where(eq(meetings.teamId, teamData.id))
      .orderBy(desc(meetings.createdAt));

    return NextResponse.json({ meetings: teamMeetings });
  } catch (error) {
    console.error('Error fetching meetings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meetings' },
      { status: 500 }
    );
  }
}

// POST - Create a new meeting
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const teamData = await getTeamForUser(user.id);

    if (!teamData) {
      return NextResponse.json({ error: 'No team found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      title,
      description,
      scheduledAt,
      recordingEnabled,
      maxParticipants,
    } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Generate a unique room name
    const roomName = `${process.env.JITSI_APP_ID}/${uuidv4()}`;

    const [meeting] = await db
      .insert(meetings)
      .values({
        roomName,
        teamId: teamData.id,
        createdBy: user.id,
        title,
        description: description || null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        recordingEnabled: recordingEnabled || false,
        maxParticipants: maxParticipants || 50,
      })
      .returning();

    // Log the activity
    await db.insert(activityLogs).values({
      teamId: teamData.id,
      userId: user.id,
      action: 'Meeting created: ' + title,
    });

    return NextResponse.json({ meeting }, { status: 201 });
  } catch (error) {
    console.error('Error creating meeting:', error);
    return NextResponse.json(
      { error: 'Failed to create meeting' },
      { status: 500 }
    );
  }
}

// PATCH - Update meeting (for kill switch and other updates)
export async function PATCH(request: NextRequest) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { meetingId, isActive, status, recordingUrl } = body;

    if (!meetingId) {
      return NextResponse.json(
        { error: 'Meeting ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (isActive !== undefined) updateData.isActive = isActive;
    if (status) updateData.status = status;
    if (recordingUrl) updateData.recordingUrl = recordingUrl;
    updateData.updatedAt = new Date();

    if (status === 'active' && !updateData.startedAt) {
      updateData.startedAt = new Date();
    }
    if (status === 'ended' && !updateData.endedAt) {
      updateData.endedAt = new Date();
    }

    const [updatedMeeting] = await db
      .update(meetings)
      .set(updateData)
      .where(eq(meetings.id, meetingId))
      .returning();

    if (!updatedMeeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    return NextResponse.json({ meeting: updatedMeeting });
  } catch (error) {
    console.error('Error updating meeting:', error);
    return NextResponse.json(
      { error: 'Failed to update meeting' },
      { status: 500 }
    );
  }
}
