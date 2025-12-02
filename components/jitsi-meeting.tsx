'use client';

import { JaaSMeeting } from '@jitsi/react-sdk';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface JitsiMeetingComponentProps {
  roomName: string;
  userDisplayName: string;
  userEmail: string;
  jwt: string;
  onMeetingEnd?: () => void;
  recordingEnabled?: boolean;
}

export function JitsiMeetingComponent({
  roomName,
  userDisplayName,
  userEmail,
  jwt,
  onMeetingEnd,
  recordingEnabled = false,
}: JitsiMeetingComponentProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for the iframe
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleApiReady = (externalApi: any) => {
    console.log('Jitsi Meet API is ready');
    setLoading(false);

    // Listen to events
    externalApi.addListener('videoConferenceJoined', () => {
      console.log('User joined the conference');
    });

    externalApi.addListener('videoConferenceLeft', () => {
      console.log('User left the conference');
      if (onMeetingEnd) {
        onMeetingEnd();
      }
    });

    externalApi.addListener('participantJoined', (participant: any) => {
      console.log('Participant joined:', participant);
    });

    externalApi.addListener('participantLeft', (participant: any) => {
      console.log('Participant left:', participant);
    });
  };

  const getIFrameRef = (iframeRef: HTMLIFrameElement) => {
    if (iframeRef) {
      iframeRef.style.height = '100%';
      iframeRef.style.width = '100%';
    }
  };

  return (
    <div className="relative w-full h-full min-h-[600px]">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            <p className="text-sm text-gray-600">Loading meeting room...</p>
          </div>
        </div>
      )}
      <JaaSMeeting
        appId={process.env.NEXT_PUBLIC_JITSI_APP_ID || ''}
        roomName={roomName}
        jwt={jwt}
        configOverwrite={{
          startWithAudioMuted: true,
          disableModeratorIndicator: false,
          startScreenSharing: false,
          enableEmailInStats: false,
          prejoinPageEnabled: true,
          disableInviteFunctions: false,
        }}
        interfaceConfigOverwrite={{
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          TOOLBAR_BUTTONS: [
            'microphone',
            'camera',
            'closedcaptions',
            'desktop',
            'fullscreen',
            'fodeviceselection',
            'hangup',
            'chat',
            'recording',
            'livestreaming',
            'etherpad',
            'sharedvideo',
            'settings',
            'raisehand',
            'videoquality',
            'filmstrip',
            'feedback',
            'stats',
            'shortcuts',
            'tileview',
            'videobackgroundblur',
            'download',
            'help',
            'mute-everyone',
            'security',
          ],
        }}
        userInfo={{
          displayName: userDisplayName,
          email: userEmail,
        }}
        onApiReady={handleApiReady}
        getIFrameRef={getIFrameRef}
      />
    </div>
  );
}
