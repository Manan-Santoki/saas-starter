'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Calendar,
  Clock,
  Users,
  Power,
  PowerOff,
  Video,
  Shield,
  TrendingUp,
} from 'lucide-react';
import type { Meeting, MeetingParticipant } from '@/lib/db/schema';

interface MeetingWithDetails extends Meeting {
  creator: {
    id: number;
    name: string | null;
    email: string;
  } | null;
  participantCount: number;
  participants: MeetingParticipant[];
}

interface AdminDashboardProps {
  meetings: MeetingWithDetails[];
}

export function AdminDashboard({ meetings }: AdminDashboardProps) {
  const router = useRouter();
  const [killDialogOpen, setKillDialogOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingWithDetails | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleKillSwitch = async (meeting: MeetingWithDetails, disable: boolean) => {
    setIsUpdating(true);
    try {
      const response = await fetch('/api/meetings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingId: meeting.id,
          isActive: !disable,
          status: disable ? 'cancelled' : meeting.status,
        }),
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error('Error updating meeting:', error);
    } finally {
      setIsUpdating(false);
      setKillDialogOpen(false);
      setSelectedMeeting(null);
    }
  };

  const handleKillClick = (meeting: MeetingWithDetails) => {
    setSelectedMeeting(meeting);
    setKillDialogOpen(true);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  };

  const stats = {
    total: meetings.length,
    active: meetings.filter((m) => m.status === 'active' && m.isActive).length,
    scheduled: meetings.filter((m) => m.status === 'scheduled').length,
    disabled: meetings.filter((m) => !m.isActive).length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="h-8 w-8 text-orange-500" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage all meetings and server controls</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Meetings</CardTitle>
            <Video className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disabled</CardTitle>
            <PowerOff className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.disabled}</div>
          </CardContent>
        </Card>
      </div>

      {/* Meetings List */}
      <Card>
        <CardHeader>
          <CardTitle>All Meetings</CardTitle>
          <CardDescription>
            Monitor and control all meetings across your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {meetings.map((meeting) => (
              <div
                key={meeting.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{meeting.title}</h3>
                    {meeting.isActive ? (
                      meeting.status === 'active' ? (
                        <Badge className="bg-green-500 hover:bg-green-600">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">{meeting.status}</Badge>
                      )
                    ) : (
                      <Badge variant="destructive">Disabled</Badge>
                    )}
                    {meeting.recordingEnabled && (
                      <Badge variant="outline">Recording</Badge>
                    )}
                  </div>
                  {meeting.description && (
                    <p className="text-sm text-gray-600 mb-2">
                      {meeting.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {meeting.participantCount} participants
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Created {formatDate(meeting.createdAt)}
                    </span>
                    {meeting.creator && (
                      <span>
                        by {meeting.creator.name || meeting.creator.email}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/meetings/${meeting.id}`)}
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Join
                  </Button>
                  {meeting.isActive ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleKillClick(meeting)}
                      disabled={isUpdating}
                    >
                      <PowerOff className="h-4 w-4 mr-2" />
                      Disable
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleKillSwitch(meeting, false)}
                      disabled={isUpdating}
                    >
                      <Power className="h-4 w-4 mr-2" />
                      Enable
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {meetings.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No meetings found
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Kill Switch Dialog */}
      <AlertDialog open={killDialogOpen} onOpenChange={setKillDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <PowerOff className="h-5 w-5 text-red-600" />
              Disable Meeting
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to disable "{selectedMeeting?.title}"? This
              will immediately prevent all participants from joining or
              continuing the meeting. This action can be reversed by enabling
              the meeting again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                selectedMeeting && handleKillSwitch(selectedMeeting, true)
              }
              disabled={isUpdating}
              className="bg-red-600 hover:bg-red-700"
            >
              {isUpdating ? 'Disabling...' : 'Disable Meeting'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
