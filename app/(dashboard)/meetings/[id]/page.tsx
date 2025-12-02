import { redirect } from 'next/navigation';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { meetings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { MeetingRoom } from './meeting-room';

export default async function MeetingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getUser();

  if (!user) {
    redirect('/sign-in');
  }

  const { id } = await params;
  const meetingId = parseInt(id);

  const [meeting] = await db
    .select()
    .from(meetings)
    .where(eq(meetings.id, meetingId));

  if (!meeting) {
    redirect('/dashboard/meetings');
  }

  if (!meeting.isActive) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Meeting Unavailable
          </h1>
          <p className="text-gray-600 mb-6">
            This meeting has been disabled by the administrator.
          </p>
          <a
            href="/dashboard/meetings"
            className="inline-block px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Back to Meetings
          </a>
        </div>
      </div>
    );
  }

  const isModerator = meeting.createdBy === user.id;

  return (
    <MeetingRoom
      meeting={meeting}
      user={user}
      isModerator={isModerator}
    />
  );
}
