import { NextRequest, NextResponse } from 'next/server';
import { generateUserJWT } from '@/lib/jitsi/jwt';
import { getUser } from '@/lib/db/queries';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { roomName, isModerator, guestName } = body;

    const privateKey = process.env.JITSI_PRIVATE_KEY;

    if (!privateKey) {
      return NextResponse.json(
        { error: 'Jitsi private key not configured' },
        { status: 500 }
      );
    }

    const appId = process.env.JITSI_APP_ID;

    if (!appId) {
      return NextResponse.json(
        { error: 'Jitsi App ID not configured' },
        { status: 500 }
      );
    }

    // Normalize room name
    const rawRoomName =
      typeof roomName === 'string' && roomName.length > 0 ? roomName : '';

    const normalizedRoomName =
      rawRoomName.length > 0
        ? rawRoomName.includes('/')
          ? rawRoomName.split('/').pop() || rawRoomName
          : rawRoomName
        : '*';

    // Try to get authenticated user
    const user = await getUser();

    let userName: string;
    let userEmail: string;
    let isModeratorToken: boolean;

    if (user) {
      // Authenticated user
      userName = user.name || user.email;
      userEmail = user.email;
      isModeratorToken = isModerator || false;
    } else {
      // Guest user - need to validate meeting allows guests
      if (!guestName || typeof guestName !== 'string' || guestName.trim().length === 0) {
        return NextResponse.json(
          { error: 'Guest name is required for unauthenticated users' },
          { status: 400 }
        );
      }

      if (!roomName) {
        return NextResponse.json(
          { error: 'Room name is required for guest join' },
          { status: 400 }
        );
      }

      // Fetch meeting to check if guests are allowed
      const { db } = await import('@/lib/db/drizzle');
      const { meetings } = await import('@/lib/db/schema');
      const { eq } = await import('drizzle-orm');

      const fullRoomName = rawRoomName.includes('/') ? rawRoomName : `${appId}/${rawRoomName}`;

      const [meeting] = await db
        .select()
        .from(meetings)
        .where(eq(meetings.roomName, fullRoomName))
        .limit(1);

      if (!meeting) {
        return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
      }

      if (!meeting.allowGuests) {
        return NextResponse.json(
          { error: 'This meeting requires authentication' },
          { status: 403 }
        );
      }

      if (!meeting.isActive) {
        return NextResponse.json(
          { error: 'This meeting has been disabled' },
          { status: 403 }
        );
      }

      // Generate guest email from name and domain
      const host = request.headers.get('host') || 'meet.example.com';
      const sanitizedName = guestName.trim().toLowerCase().replace(/\s+/g, '.');
      userName = guestName.trim();
      userEmail = `${sanitizedName}@${host}`;
      isModeratorToken = false; // Guests are never moderators
    }

    // Generate JWT
    const token = generateUserJWT(
      privateKey,
      userName,
      userEmail,
      normalizedRoomName,
      isModeratorToken
    );

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error generating JWT:', error);
    return NextResponse.json(
      { error: 'Failed to generate JWT' },
      { status: 500 }
    );
  }
}
