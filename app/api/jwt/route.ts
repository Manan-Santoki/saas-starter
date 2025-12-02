import { NextRequest, NextResponse } from 'next/server';
import { generateUserJWT } from '@/lib/jitsi/jwt';
import { getUser } from '@/lib/db/queries';

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { roomName, isModerator } = body;

    const privateKey = process.env.JITSI_PRIVATE_KEY;

    if (!privateKey) {
      return NextResponse.json(
        { error: 'Jitsi private key not configured' },
        { status: 500 }
      );
    }

    // Generate JWT for the user
    const token = generateUserJWT(
      privateKey,
      user.name || user.email,
      user.email,
      roomName,
      isModerator || false
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
