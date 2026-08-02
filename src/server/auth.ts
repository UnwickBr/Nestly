import { randomBytes, scryptSync, timingSafeEqual, createHmac } from 'node:crypto';
import type { IncomingMessage } from 'node:http';

// Dev-only fallback secret so sessions work out of the box locally.
// Set a real SESSION_SECRET env var before deploying anywhere shared.
const SESSION_SECRET = process.env.SESSION_SECRET || 'nestly-dev-secret-do-not-use-in-production';

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}

function sign(value: string): string {
  return createHmac('sha256', SESSION_SECRET).update(value).digest('hex');
}

export function createSessionToken(userId: string): string {
  const payload = Buffer.from(userId, 'utf-8').toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined | null): string | null {
  if (!token) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    return Buffer.from(payload, 'base64url').toString('utf-8');
  } catch {
    return null;
  }
}

const COOKIE_NAME = 'nestly_session';

export function parseCookies(req: IncomingMessage): Record<string, string> {
  const header = req.headers.cookie;
  if (!header) return {};
  const out: Record<string, string> = {};
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (key) out[key] = decodeURIComponent(value);
  }
  return out;
}

export function getSessionUserId(req: IncomingMessage): string | null {
  const cookies = parseCookies(req);
  return verifySessionToken(cookies[COOKIE_NAME]);
}

export function sessionCookieHeader(userId: string): string {
  const token = createSessionToken(userId);
  const maxAge = 60 * 60 * 24 * 30; // 30 days
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`;
}

export function clearSessionCookieHeader(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}
