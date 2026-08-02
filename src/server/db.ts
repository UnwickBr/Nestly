import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

// Local dev persistence: a JSON file under .data/. This keeps the auth +
// invite flow fully working today (across tabs/devices on the same LAN,
// since the Vite dev server binds 0.0.0.0) without requiring a database.
//
// To move to production on Vercel + NeonDB later, swap the body of every
// function below for the equivalent SQL query against Postgres — the
// call sites (src/server/handlers.ts) only depend on this async function
// signature, not on the storage mechanism.

export interface DbUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  householdId: string;
  createdAt: string;
}

export interface DbInvite {
  id: string;
  fromUserId: string;
  fromHouseholdId: string;
  toEmail: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  respondedAt: string | null;
}

interface DbShape {
  users: DbUser[];
  households: { id: string; createdAt: string }[];
  invites: DbInvite[];
}

const DB_PATH = path.resolve(process.cwd(), '.data', 'db.json');

function emptyDb(): DbShape {
  return { users: [], households: [], invites: [] };
}

async function readDb(): Promise<DbShape> {
  try {
    const raw = await readFile(DB_PATH, 'utf-8');
    return JSON.parse(raw) as DbShape;
  } catch {
    return emptyDb();
  }
}

async function writeDb(data: DbShape): Promise<void> {
  await mkdir(path.dirname(DB_PATH), { recursive: true });
  await writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// Serialize all writes so concurrent requests don't clobber each other.
let queue: Promise<unknown> = Promise.resolve();
function withDb<T>(fn: (db: DbShape) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const db = await readDb();
    const result = await fn(db);
    await writeDb(db);
    return result;
  });
  queue = run.catch(() => {});
  return run;
}

const normEmail = (email: string) => email.trim().toLowerCase();

export async function findUserByEmail(email: string): Promise<DbUser | null> {
  const db = await readDb();
  return db.users.find(u => u.email === normEmail(email)) ?? null;
}

export async function findUserById(id: string): Promise<DbUser | null> {
  const db = await readDb();
  return db.users.find(u => u.id === id) ?? null;
}

export async function createUser(input: { name: string; email: string; passwordHash: string }): Promise<DbUser> {
  return withDb(db => {
    const now = new Date().toISOString();
    const householdId = randomUUID();
    db.households.push({ id: householdId, createdAt: now });
    const user: DbUser = {
      id: randomUUID(),
      name: input.name.trim(),
      email: normEmail(input.email),
      passwordHash: input.passwordHash,
      householdId,
      createdAt: now,
    };
    db.users.push(user);
    return user;
  });
}

export async function getHouseholdMembers(householdId: string, excludeUserId?: string): Promise<DbUser[]> {
  const db = await readDb();
  return db.users.filter(u => u.householdId === householdId && u.id !== excludeUserId);
}

export async function findPendingInviteBetween(fromHouseholdId: string, toEmail: string): Promise<DbInvite | null> {
  const db = await readDb();
  return (
    db.invites.find(
      i => i.fromHouseholdId === fromHouseholdId && i.toEmail === normEmail(toEmail) && i.status === 'pending',
    ) ?? null
  );
}

export async function createInvite(input: { fromUserId: string; fromHouseholdId: string; toEmail: string }): Promise<DbInvite> {
  return withDb(db => {
    const invite: DbInvite = {
      id: randomUUID(),
      fromUserId: input.fromUserId,
      fromHouseholdId: input.fromHouseholdId,
      toEmail: normEmail(input.toEmail),
      status: 'pending',
      createdAt: new Date().toISOString(),
      respondedAt: null,
    };
    db.invites.push(invite);
    return invite;
  });
}

export async function getReceivedInvites(email: string): Promise<DbInvite[]> {
  const db = await readDb();
  return db.invites.filter(i => i.toEmail === normEmail(email) && i.status === 'pending');
}

export async function getSentInvites(userId: string): Promise<DbInvite[]> {
  const db = await readDb();
  return db.invites.filter(i => i.fromUserId === userId && i.status === 'pending');
}

export async function getInviteById(id: string): Promise<DbInvite | null> {
  const db = await readDb();
  return db.invites.find(i => i.id === id) ?? null;
}

export async function resolveInvite(
  inviteId: string,
  acceptingUserId: string,
  outcome: 'accepted' | 'declined',
): Promise<{ ok: true } | { ok: false; error: string }> {
  return withDb(db => {
    const invite = db.invites.find(i => i.id === inviteId);
    if (!invite || invite.status !== 'pending') return { ok: false, error: 'Convite não encontrado ou já respondido.' };

    const acceptingUser = db.users.find(u => u.id === acceptingUserId);
    if (!acceptingUser || acceptingUser.email !== invite.toEmail) {
      return { ok: false, error: 'Este convite não é para esta conta.' };
    }

    invite.status = outcome;
    invite.respondedAt = new Date().toISOString();

    if (outcome === 'accepted') {
      acceptingUser.householdId = invite.fromHouseholdId;
    }

    return { ok: true };
  });
}
