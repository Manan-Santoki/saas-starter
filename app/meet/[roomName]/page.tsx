'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { JitsiMeetingComponent } from '@/components/jitsi-meeting';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Video } from 'lucide-react';

interface MeetingJoinPageProps {
    params: Promise<{ roomName: string }>;
}

export default function MeetingJoinPage({ params }: MeetingJoinPageProps) {
    const router = useRouter();
    const [roomName, setRoomName] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [isJoining, setIsJoining] = useState(false);
    const [guestName, setGuestName] = useState('');
    const [jwt, setJwt] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);
    const [meeting, setMeeting] = useState<any>(null);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        async function initialize() {
            const resolvedParams = await params;
            setRoomName(resolvedParams.roomName);

            // Check if user is authenticated
            try {
                const userRes = await fetch('/api/user');
                if (userRes.ok) {
                    const userData = await userRes.json();
                    setUser(userData);
                }
            } catch (err) {
                console.log('User not authenticated, guest mode available');
            }

            // Fetch meeting details
            try {
                const meetingRes = await fetch('/api/meetings/get-by-room', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ roomName: resolvedParams.roomName }),
                });

                if (meetingRes.ok) {
                    const meetingData = await meetingRes.json();
                    setMeeting(meetingData.meeting);
                } else {
                    setError('Meeting not found');
                }
            } catch (err) {
                setError('Failed to load meeting');
            }

            setIsLoading(false);
        }

        initialize();
    }, [params]);

    const handleJoin = async () => {
        setIsJoining(true);
        setError('');

        try {
            const body: any = {
                roomName,
                isModerator: user?.id === meeting?.createdBy,
            };

            // If not authenticated, provide guest name
            if (!user) {
                if (!guestName.trim()) {
                    setError('Please enter your name');
                    setIsJoining(false);
                    return;
                }
                body.guestName = guestName;
            }

            const response = await fetch('/api/jwt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (response.ok) {
                const data = await response.json();
                setJwt(data.token);
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to join meeting');
            }
        } catch (err) {
            setError('Failed to join meeting');
        } finally {
            setIsJoining(false);
        }
    };

    // If JWT is set, show the meeting in a viewport-height container under the global navbar
    if (jwt && meeting) {
        return (
            <div className="w-full h-[calc(100vh-64px)] bg-black">
                <JitsiMeetingComponent
                    roomName={roomName}
                    userDisplayName={user?.name || guestName}
                    userEmail={user?.email || `${guestName}@guest`}
                    jwt={jwt}
                    recordingEnabled={meeting.recordingEnabled}
                    onMeetingEnd={() => router.push('/meetings')}
                />
            </div>
        );
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                    <p className="text-sm text-gray-600">Loading meeting...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error && !meeting) {
        return (
            <div className="h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-red-600">Error</CardTitle>
                        <CardDescription>{error}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => router.push('/meetings')} className="w-full">
                            Go to Meetings
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Join screen
    return (
        <div className="h-[calc(100vh-64px)] bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                        <Video className="h-6 w-6 text-orange-600" />
                    </div>
                    <CardTitle className="text-2xl">Join Meeting</CardTitle>
                    <CardDescription className="text-base">
                        {meeting?.title || 'Video Conference'}
                    </CardDescription>
                    {meeting?.description && (
                        <p className="text-sm text-gray-600 mt-2">{meeting.description}</p>
                    )}
                </CardHeader>
                <CardContent className="space-y-4">
                    {!user && !meeting?.allowGuests && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                            <p className="text-sm text-yellow-800">
                                This meeting requires you to sign in. Please{' '}
                                <a href="/sign-in" className="underline font-medium">
                                    sign in
                                </a>{' '}
                                to join.
                            </p>
                        </div>
                    )}

                    {(!user && meeting?.allowGuests) || user ? (
                        <>
                            {!user && (
                                <div className="space-y-2">
                                    <Label htmlFor="guestName">Your Name</Label>
                                    <Input
                                        id="guestName"
                                        value={guestName}
                                        onChange={(e) => setGuestName(e.target.value)}
                                        placeholder="Enter your name"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleJoin();
                                        }}
                                    />
                                    <p className="text-xs text-gray-500">
                                        Joining as a guest
                                    </p>
                                </div>
                            )}

                            {user && (
                                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                                    <p className="text-sm text-blue-800">
                                        Joining as <span className="font-medium">{user.name || user.email}</span>
                                    </p>
                                </div>
                            )}

                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                                    <p className="text-sm text-red-800">{error}</p>
                                </div>
                            )}

                            <Button
                                onClick={handleJoin}
                                disabled={isJoining || (!user && !guestName.trim())}
                                className="w-full"
                                size="lg"
                            >
                                {isJoining ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Joining...
                                    </>
                                ) : (
                                    <>
                                        <Video className="h-4 w-4 mr-2" />
                                        Join Meeting
                                    </>
                                )}
                            </Button>
                        </>
                    ) : null}
                </CardContent>
            </Card>
        </div>
    );
}
