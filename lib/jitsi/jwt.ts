import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

export interface JitsiUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  moderator?: boolean;
  hiddenFromRecorder?: boolean;
}

export interface JitsiFeatures {
  livestreaming?: boolean;
  recording?: boolean;
  transcription?: boolean;
  'sip-inbound-call'?: boolean;
  'sip-outbound-call'?: boolean;
  'inbound-call'?: boolean;
  'outbound-call'?: boolean;
  'file-upload'?: boolean;
  'list-visitors'?: boolean;
  'send-groupchat'?: boolean;
  'create-polls'?: boolean;
}

export interface JitsiJWTOptions {
  user: JitsiUser;
  features?: JitsiFeatures;
  room?: string; // Room name or "*" for all rooms
  expiresIn?: string | number; // e.g., "2h", 7200
}

/**
 * Generates a Jitsi JWT token for authentication
 * @param privateKey - The RSA private key in PEM format
 * @param options - JWT generation options
 * @returns Signed JWT token
 */
export function generateJitsiJWT(
  privateKey: string,
  options: JitsiJWTOptions
): string {
  const appId = process.env.JITSI_APP_ID!;
  const apiKeyId = process.env.JITSI_API_KEY_ID!;

  if (!appId || !apiKeyId) {
    throw new Error('JITSI_APP_ID and JITSI_API_KEY_ID must be configured');
  }

  const now = Math.floor(Date.now() / 1000);
  const exp = options.expiresIn
    ? typeof options.expiresIn === 'number'
      ? now + options.expiresIn
      : now + 7200 // default 2 hours
    : now + 7200;

  const payload = {
    aud: 'jitsi',
    iss: 'chat',
    iat: now,
    exp: exp,
    nbf: now - 5, // 5 seconds before to account for clock skew
    sub: appId,
    room: options.room || '*',
    context: {
      user: {
        id: options.user.id,
        name: options.user.name,
        email: options.user.email,
        avatar: options.user.avatar || '',
        moderator: options.user.moderator ? 'true' : 'false',
        ...(options.user.hiddenFromRecorder !== undefined && {
          'hidden-from-recorder': options.user.hiddenFromRecorder,
        }),
      },
      features: options.features || {
        livestreaming: false,
        recording: false,
        transcription: false,
        'outbound-call': false,
        'sip-outbound-call': false,
        'file-upload': false,
        'list-visitors': false,
      },
    },
  };

  const token = jwt.sign(payload, privateKey, {
    algorithm: 'RS256',
    header: {
      kid: apiKeyId,
      typ: 'JWT',
      alg: 'RS256',
    },
  });

  return token;
}

/**
 * Generates a simple JWT for a user with default features
 */
export function generateUserJWT(
  privateKey: string,
  userName: string,
  userEmail: string,
  roomName?: string,
  isModerator: boolean = false
): string {
  return generateJitsiJWT(privateKey, {
    user: {
      id: uuidv4(),
      name: userName,
      email: userEmail,
      moderator: isModerator,
    },
    room: roomName || '*',
    features: {
      livestreaming: isModerator,
      recording: isModerator,
      transcription: isModerator,
      'outbound-call': false,
      'file-upload': true,
      'list-visitors': isModerator,
    },
    expiresIn: 7200, // 2 hours
  });
}

/**
 * Verifies a Jitsi JWT token
 */
export function verifyJitsiJWT(token: string, publicKey: string): any {
  try {
    return jwt.verify(token, publicKey, {
      algorithms: ['RS256'],
    });
  } catch (error) {
    throw new Error(`JWT verification failed: ${error}`);
  }
}
