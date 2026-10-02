import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { google } from 'googleapis';

export const GOOGLE_TOKEN_COOKIE = 'barakah_google_calendar_tokens';
export const GOOGLE_STATE_COOKIE = 'barakah_google_oauth_state';
export const GOOGLE_CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.events';

function getEncryptionKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured.');
  return createHash('sha256').update(secret).digest();
}

export function createGoogleOAuthClient() {
  const { GOOGLE_CLIENT_ID: clientId, GOOGLE_CLIENT_SECRET: clientSecret, GOOGLE_REDIRECT_URI: redirectUri } = process.env;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Google Calendar environment variables are not configured.');
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function encryptGoogleTokens(tokens) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', getEncryptionKey(), iv);
  const payload = Buffer.from(JSON.stringify({ refresh_token: tokens.refresh_token }), 'utf8');
  const encrypted = Buffer.concat([cipher.update(payload), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [iv, authTag, encrypted].map((part) => part.toString('base64url')).join('.');
}

export function decryptGoogleTokens(value) {
  if (!value) return null;

  try {
    const [ivValue, authTagValue, encryptedValue] = value.split('.');
    if (!ivValue || !authTagValue || !encryptedValue) return null;

    const decipher = createDecipheriv(
      'aes-256-gcm',
      getEncryptionKey(),
      Buffer.from(ivValue, 'base64url'),
    );
    decipher.setAuthTag(Buffer.from(authTagValue, 'base64url'));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedValue, 'base64url')),
      decipher.final(),
    ]);
    const tokens = JSON.parse(decrypted.toString('utf8'));
    return tokens?.refresh_token ? tokens : null;
  } catch {
    return null;
  }
}

export function getGoogleCalendarConnection(request) {
  const tokenValue = request.cookies.get(GOOGLE_TOKEN_COOKIE)?.value;
  const tokens = decryptGoogleTokens(tokenValue);
  if (!tokens) return null;

  const auth = createGoogleOAuthClient();
  auth.setCredentials(tokens);
  return {
    auth,
    calendar: google.calendar({ version: 'v3', auth }),
  };
}

export function clearGoogleTokenCookie(response) {
  response.cookies.set(GOOGLE_TOKEN_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

export function cookieOptions(maxAge) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge,
  };
}

export function getDateKeyInPakistan() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Karachi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date()).reduce((result, part) => {
    if (part.type !== 'literal') result[part.type] = part.value;
    return result;
  }, {});

  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function isDateKey(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function nextDateKey(value) {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}
