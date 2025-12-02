import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { meetings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';
import nodemailer from 'nodemailer';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const meetingId = parseInt(id);

        if (isNaN(meetingId)) {
            return NextResponse.json({ error: 'Invalid meeting ID' }, { status: 400 });
        }

        // Fetch the meeting
        const [meeting] = await db
            .select()
            .from(meetings)
            .where(eq(meetings.id, meetingId))
            .limit(1);

        if (!meeting) {
            return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
        }

        // Check if user is the moderator
        if (meeting.createdBy !== user.id) {
            return NextResponse.json({ error: 'Only the meeting creator can send invites' }, { status: 403 });
        }

        const body = await request.json();
        const { emails } = body;

        if (!emails || !Array.isArray(emails) || emails.length === 0) {
            return NextResponse.json({ error: 'Emails array is required' }, { status: 400 });
        }

        // Get the base URL from environment or request
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${request.nextUrl.protocol}//${request.nextUrl.host}`;
        const meetingUrl = `${baseUrl}/meet/${meeting.roomName.split('/').pop()}`;

        // Configure nodemailer
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // Send emails
        const emailPromises = emails.map(async (email: string) => {
            try {
                await transporter.sendMail({
                    from: process.env.SMTP_FROM || process.env.SMTP_USER,
                    to: email,
                    subject: `You're invited to: ${meeting.title}`,
                    html: `
            <!DOCTYPE html>
            <html>
              <head>
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: #f97316; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                  .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                  .button { display: inline-block; background: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                  .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>Meeting Invitation</h1>
                  </div>
                  <div class="content">
                    <h2>${meeting.title}</h2>
                    ${meeting.description ? `<p>${meeting.description}</p>` : ''}
                    <p><strong>Invited by:</strong> ${user.name || user.email}</p>
                    ${meeting.scheduledAt ? `<p><strong>Scheduled for:</strong> ${new Date(meeting.scheduledAt).toLocaleString()}</p>` : ''}
                    <p>You have been invited to join this video meeting. Click the button below to join:</p>
                    <a href="${meetingUrl}" class="button">Join Meeting</a>
                    <p style="color: #666; font-size: 14px;">Or copy this link: <br/>${meetingUrl}</p>
                  </div>
                  <div class="footer">
                    <p>This is an automated invitation. Please do not reply to this email.</p>
                  </div>
                </div>
              </body>
            </html>
          `,
                });
                return { email, success: true };
            } catch (error) {
                console.error(`Failed to send email to ${email}:`, error);
                return { email, success: false, error: String(error) };
            }
        });

        const results = await Promise.all(emailPromises);
        const successCount = results.filter(r => r.success).length;

        return NextResponse.json({
            message: `Sent ${successCount} out of ${emails.length} invitations`,
            results,
        });
    } catch (error) {
        console.error('Error sending invites:', error);
        return NextResponse.json(
            { error: 'Failed to send invites' },
            { status: 500 }
        );
    }
}
