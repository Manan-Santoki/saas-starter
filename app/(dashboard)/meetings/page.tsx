import { redirect } from 'next/navigation';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { meetings } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { MeetingsList } from './meetings-list';
import { CreateMeetingDialog } from './create-meeting-dialog';

export default async function MeetingsPage() {
  const user = await getUser();

  if (!user) {
    redirect('/sign-in');
  }

  const teamData = await getTeamForUser(user.id);

  if (!teamData) {
    redirect('/dashboard');
  }

  const teamMeetings = await db
    .select()
    .from(meetings)
    .where(eq(meetings.teamId, teamData.id))
    .orderBy(desc(meetings.createdAt));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Meetings</h1>
            <p className="text-gray-600 mt-1">
              Manage and join your video meetings
            </p>
          </div>
          <CreateMeetingDialog />
        </div>

        <MeetingsList meetings={teamMeetings} userId={user.id} />
      </div>
    </div>
  );
}
