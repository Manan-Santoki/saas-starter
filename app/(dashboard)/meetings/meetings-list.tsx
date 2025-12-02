'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Video, Users, Trash2 } from 'lucide-react';
import type { Meeting } from '@/lib/db/schema';
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

interface MeetingsListProps {
  meetings: Meeting[];
  userId: number;
}

export function MeetingsList({ meetings, userId }: MeetingsListProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleJoinMeeting = (meetingId: number) => {
    router.push(`/meetings/${meetingId}`);
  };

  const handleDeleteClick = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedMeeting) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/meetings/${selectedMeeting.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error('Error deleting meeting:', error);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setSelectedMeeting(null);
    }
  };

  const getStatusBadge = (status: string, isActive: boolean) => {
    if (!isActive) {
      return <Badge variant="destructive">Disabled</Badge>;
    }

    switch (status) {
      case 'scheduled':
        return <Badge variant="secondary">Scheduled</Badge>;
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>;
      case 'ended':
        return <Badge variant="outline">Ended</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Not scheduled';
    return new Date(date).toLocaleString();
  };

  if (meetings.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No meetings yet
          </h3>
          <p className="text-gray-600">
            Create your first meeting to get started
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {meetings.map((meeting) => (
          <Card key={meeting.id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{meeting.title}</CardTitle>
                {getStatusBadge(meeting.status, meeting.isActive)}
              </div>
              {meeting.description && (
                <CardDescription className="line-clamp-2">
                  {meeting.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-2 text-sm text-gray-600">
                {meeting.scheduledAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(meeting.scheduledAt)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Created {formatDate(meeting.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Max {meeting.maxParticipants} participants</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button
                onClick={() => handleJoinMeeting(meeting.id)}
                disabled={!meeting.isActive}
                className="flex-1"
              >
                <Video className="h-4 w-4 mr-2" />
                Join
              </Button>
              {meeting.createdBy === userId && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleDeleteClick(meeting)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Meeting</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedMeeting?.title}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
