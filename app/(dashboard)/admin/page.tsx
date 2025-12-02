import { redirect } from 'next/navigation';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { meetings, meetingParticipants, users } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { AdminDashboard } from './admin-dashboard';

export default async function AdminPage() {
  const user = await getUser();

  if (!user) {
    redirect('/sign-in');
  }

  const teamData = await getTeamForUser(user.id);

  if (!teamData) {
    redirect('/dashboard');
  }

  // Check if user is admin/owner
  const isAdmin = user.role === 'owner' || user.role === 'admin';

  if (!isAdmin) {
    redirect('/dashboard');
  }

  // Get all meetings for the team
  const teamMeetings = await db
    .select({
      meeting: meetings,
      creator: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
    })
    .from(meetings)
    .leftJoin(users, eq(meetings.createdBy, users.id))
    .where(eq(meetings.teamId, teamData.id))
    .orderBy(desc(meetings.createdAt));

  // Get participant counts for each meeting
  const meetingsWithCounts = await Promise.all(
    teamMeetings.map(async ({ meeting, creator }) => {
      const participants = await db
        .select()
        .from(meetingParticipants)
        .where(eq(meetingParticipants.meetingId, meeting.id));

      return {
        ...meeting,
        creator,
        participantCount: participants.length,
        participants,
      };
    })
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminDashboard meetings={meetingsWithCounts} />
    </div>
  );
}
