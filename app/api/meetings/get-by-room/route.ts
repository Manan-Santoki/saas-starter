import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { meetings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { roomName } = body;

        if (!roomName) {
            return NextResponse.json(
                { error: 'Room name is required' },
                { status: 400 }
            );
        }

        // Normalize room name (might come with or without app ID prefix)
        const normalizedRoomName = roomName.includes('/')
            ? roomName
            : `${process.env.JITSI_APP_ID}/${roomName}`;

        const [meeting] = await db
            .select({
                id: meetings.id,
                title: meetings.title,
                description: meetings.description,
                allowGuests: meetings.allowGuests,
                roomName: meetings.roomName,
                isActive: meetings.isActive,
            })
            .from(meetings)
            .where(eq(meetings.roomName, normalizedRoomName))
            .limit(1);

        if (!meeting) {
            return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
        }

        return NextResponse.json({ meeting });
    } catch (error) {
        console.error('Error fetching meeting by room:', error);
        return NextResponse.json(
            { error: 'Failed to fetch meeting' },
            { status: 500 }
        );
    }
}
