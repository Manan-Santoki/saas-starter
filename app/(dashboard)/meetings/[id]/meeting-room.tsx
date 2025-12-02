'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { JitsiMeetingComponent } from '@/components/jitsi-meeting';
import { Loader2 } from 'lucide-react';
import type { Meeting, User } from '@/lib/db/schema';

interface MeetingRoomProps {
  meeting: Meeting;
  user: User;
  isModerator: boolean;
}

export function MeetingRoom({ meeting, user, isModerator }: MeetingRoomProps) {
  const [jwt, setJwt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const roomSlug = meeting.roomName.split('/').pop() || meeting.roomName;

  useEffect(() => {
    const generateToken = async () => {
      try {
        // Join the meeting (log participant)
        await fetch(`/api/meetings/${meeting.id}/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isModerator }),
        });

        // Generate JWT token
        const response = await fetch('/api/jwt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomName: roomSlug,
            isModerator,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate token');
        }

        const data = await response.json();
        setJwt(data.token);
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to join meeting. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    generateToken();
  }, [meeting.id, meeting.roomName, isModerator, roomSlug]);

  const handleMeetingEnd = () => {
    router.push('/dashboard/meetings');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-sm text-gray-600">Preparing meeting room...</p>
        </div>
      </div>
    );
  }

  if (error || !jwt) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">
            {error || 'Failed to join meeting'}
          </p>
          <button
            onClick={() => router.push('/dashboard/meetings')}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Back to Meetings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            {meeting.title}
          </h1>
          {meeting.description && (
            <p className="text-sm text-gray-500">{meeting.description}</p>
          )}
        </div>
        {isModerator && (
          <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
            Moderator
          </span>
        )}
      </div>
      <div className="w-full h-[calc(100vh-64px-48px)] bg-black">
        <JitsiMeetingComponent
          roomName={roomSlug}
          userDisplayName={user.name || user.email}
          userEmail={user.email}
          jwt={jwt}
          onMeetingEnd={handleMeetingEnd}
          recordingEnabled={meeting.recordingEnabled}
        />
      </div>
    </div>
  );
}
