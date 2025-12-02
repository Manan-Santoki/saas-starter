# Jitsi Meet Integration Setup Guide

This application integrates **Jitsi as a Service (JaaS)** for video conferencing capabilities. Follow this guide to set up and configure Jitsi Meet in your application.

## Overview

The application includes:
- 🎥 Video conferencing with Jitsi Meet
- 👥 Meeting management (create, join, delete)
- 🛡️ Admin panel with kill switch functionality
- 📹 Recording support for moderators
- 🔐 JWT-based authentication
- 📊 Meeting analytics and participant tracking

## Prerequisites

1. **Jitsi as a Service (JaaS) Account**
   - Sign up at [https://jaas.8x8.vc/](https://jaas.8x8.vc/)
   - Your AppID: `vpaas-magic-cookie-0b07da497b1a4f618546829fdfbb9621`

2. **API Key Pair**
   - You need to generate an RSA key pair for JWT signing
   - Follow the instructions below

## Step 1: Generate RSA Key Pair

Generate a 4096-bit RSA key pair using ssh-keygen:

```bash
# Generate the private key
ssh-keygen -t rsa -b 4096 -m PEM -f jaasauth.key

# When prompted, leave the passphrase empty (just press Enter)

# Convert public key to PEM format
openssl rsa -in jaasauth.key -pubout -outform PEM -out jaasauth.key.pub
```

This will create two files:
- `jaasauth.key` - Your private key (keep this secret!)
- `jaasauth.key.pub` - Your public key

## Step 2: Upload Public Key to JaaS

1. Go to the [JaaS Developer Console](https://jaas.8x8.vc/#/apikeys)
2. Navigate to **API Keys** section
3. Click **Add API Key**
4. Copy the contents of `jaasauth.key.pub` and paste it
5. Save the API key
6. Copy the **Key ID (kid)** that is generated (format: `vpaas-magic-cookie-xxx/xxxxx`)

## Step 3: Configure Environment Variables

Create or update your `.env` file with the following variables:

```env
# Jitsi Configuration
JITSI_APP_ID=vpaas-magic-cookie-0b07da497b1a4f618546829fdfbb9621
JITSI_API_KEY_ID=vpaas-magic-cookie-0b07da497b1a4f618546829fdfbb9621/YOUR_KEY_ID
JITSI_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
YOUR_PRIVATE_KEY_CONTENT_HERE
-----END PRIVATE KEY-----"
NEXT_PUBLIC_JITSI_APP_ID=vpaas-magic-cookie-0b07da497b1a4f618546829fdfbb9621
```

**Important Notes:**
- Replace `YOUR_KEY_ID` with the Key ID from Step 2
- Replace `YOUR_PRIVATE_KEY_CONTENT_HERE` with the contents of `jaasauth.key`
- Keep the private key on one line with `\n` for line breaks, OR use multi-line format as shown above
- The `NEXT_PUBLIC_` prefix makes the AppID available on the client side

### How to format the private key:

Option 1 - Multi-line (recommended):
```env
JITSI_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
[rest of your key]
-----END PRIVATE KEY-----"
```

Option 2 - Single line:
```env
JITSI_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----"
```

## Step 4: Run Database Migrations

The application includes meeting management tables. Run the database migrations:

```bash
npm run db:generate
npm run db:migrate
```

## Step 5: Start the Application

```bash
npm run dev
```

## Using the Application

### For Regular Users

1. **Create a Meeting**
   - Navigate to `/meetings`
   - Click "Create Meeting"
   - Fill in the meeting details
   - Click "Create"

2. **Join a Meeting**
   - Go to the meetings list
   - Click "Join" on any meeting
   - You'll be taken to the video conference room

3. **Meeting Features**
   - Video/audio controls
   - Screen sharing
   - Chat
   - Participant list
   - Recording (if enabled by moderator)

### For Admins

1. **Access Admin Panel**
   - Navigate to `/admin`
   - Only users with `owner` or `admin` role can access

2. **Admin Features**
   - **View all meetings**: See all team meetings and their status
   - **Kill Switch**: Disable any meeting instantly
   - **Enable meetings**: Re-enable disabled meetings
   - **Monitor participants**: See participant counts and details
   - **Analytics**: View meeting statistics

3. **Kill Switch Usage**
   - Click "Disable" on any active meeting
   - Confirm the action
   - The meeting will immediately become unavailable
   - Users trying to join will see an error message
   - You can re-enable it by clicking "Enable"

## JWT Token Details

The application automatically generates JWT tokens for each participant with the following claims:

```json
{
  "aud": "jitsi",
  "iss": "chat",
  "sub": "vpaas-magic-cookie-0b07da497b1a4f618546829fdfbb9621",
  "room": "vpaas-magic-cookie-xxx/meeting-room-id",
  "context": {
    "user": {
      "id": "unique-user-id",
      "name": "User Name",
      "email": "user@example.com",
      "moderator": "true/false"
    },
    "features": {
      "livestreaming": true,
      "recording": true,
      "transcription": false,
      "outbound-call": false
    }
  }
}
```

## Features Breakdown

### Meeting Management
- Create scheduled or instant meetings
- Set maximum participant limits
- Enable/disable recording
- Add descriptions and metadata

### Security
- JWT-based authentication
- Private key signing
- Meeting creator is automatically a moderator
- Admin-only access to control panel

### Admin Controls
- **Kill Switch**: Instantly disable any meeting
- **Meeting Status**: View real-time meeting states
- **Participant Tracking**: See who joined each meeting
- **Analytics**: Total, active, scheduled, and disabled meetings

### Recording
- Enable recording when creating a meeting
- Only moderators can start/stop recordings
- Recording URLs are stored in the database

## Troubleshooting

### Issue: JWT generation fails
**Solution**: Check that your private key is correctly formatted in the `.env` file

### Issue: "Meeting is not active" error
**Solution**: An admin has disabled the meeting using the kill switch. Ask an admin to re-enable it.

### Issue: Can't access admin panel
**Solution**: Only users with `owner` or `admin` role can access. Update your user role in the database.

### Issue: Jitsi iframe doesn't load
**Solution**:
- Check that `NEXT_PUBLIC_JITSI_APP_ID` is set correctly
- Verify your AppID is active on JaaS
- Check browser console for errors

### Issue: "Failed to generate JWT" error
**Solution**:
- Verify `JITSI_PRIVATE_KEY` is correctly set
- Ensure `JITSI_API_KEY_ID` matches your uploaded public key
- Check that the key pair was generated correctly

## API Endpoints

- `POST /api/jwt` - Generate JWT token for a user
- `GET /api/meetings` - List all meetings
- `POST /api/meetings` - Create a new meeting
- `PATCH /api/meetings` - Update meeting (kill switch)
- `GET /api/meetings/[id]` - Get meeting details
- `DELETE /api/meetings/[id]` - Delete a meeting
- `POST /api/meetings/[id]/join` - Join a meeting (log participant)

## Database Schema

### meetings table
- `id` - Primary key
- `roomName` - Unique Jitsi room name
- `teamId` - Associated team
- `createdBy` - User who created the meeting
- `title` - Meeting title
- `description` - Meeting description
- `status` - scheduled | active | ended | cancelled
- `isActive` - Kill switch flag
- `recordingEnabled` - Recording flag
- `scheduledAt`, `startedAt`, `endedAt` - Timestamps
- `maxParticipants` - Maximum allowed participants

### meeting_participants table
- `id` - Primary key
- `meetingId` - Associated meeting
- `userId` - User who joined
- `name` - Participant name
- `email` - Participant email
- `isModerator` - Moderator flag
- `joinedAt`, `leftAt` - Timestamps
- `duration` - Meeting duration in seconds

## Additional Resources

- [JaaS Documentation](https://jaas.8x8.vc/)
- [Jitsi Meet React SDK](https://github.com/jitsi/jitsi-meet-react-sdk)
- [JWT.io Debugger](https://jwt.io/) - Debug your JWT tokens
- [Jitsi IFrame API](https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-iframe/)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the Jitsi documentation
3. Check your environment variables
4. Verify your API keys are correct

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit your private key** to version control
2. Keep your `.env` file secure and out of git
3. Rotate your API keys periodically
4. Use the kill switch to immediately stop compromised meetings
5. Review participant lists regularly
6. Enable recording only when necessary

## License

This integration follows the same license as the main application.
