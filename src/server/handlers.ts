import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  createInvite,
  createUser,
  findPendingInviteBetween,
  findUserByEmail,
  findUserById,
  getHouseholdMembers,
  getReceivedInvites,
  getSentInvites,
  resolveInvite,
} from './db';
import { clearSessionCookieHeader, getSessionUserId, hashPassword, sessionCookieHeader, verifyPassword } from './auth';

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body);
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(payload);
}

async function readJsonBody(req: IncomingMessage): Promise<any> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  if (chunks.length === 0) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf-8'));
  } catch {
    return {};
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function publicUser(u: { id: string; name: string; email: string }) {
  return { id: u.id, name: u.name, email: u.email };
}

export async function handleRegister(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const body = await readJsonBody(req);
  const name = String(body.name ?? '').trim();
  const email = String(body.email ?? '').trim();
  const password = String(body.password ?? '');

  if (!name || !EMAIL_RE.test(email) || password.length < 6) {
    return sendJson(res, 400, { error: 'Preencha nome, e-mail válido e senha com pelo menos 6 caracteres.' });
  }
  if (await findUserByEmail(email)) {
    return sendJson(res, 409, { error: 'Já existe uma conta com este e-mail.' });
  }

  const user = await createUser({ name, email, passwordHash: hashPassword(password) });
  res.setHeader('Set-Cookie', sessionCookieHeader(user.id));
  sendJson(res, 200, { user: publicUser(user) });
}

export async function handleLogin(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const body = await readJsonBody(req);
  const email = String(body.email ?? '').trim();
  const password = String(body.password ?? '');

  const user = await findUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return sendJson(res, 401, { error: 'E-mail ou senha incorretos.' });
  }

  res.setHeader('Set-Cookie', sessionCookieHeader(user.id));
  sendJson(res, 200, { user: publicUser(user) });
}

export async function handleLogout(_req: IncomingMessage, res: ServerResponse): Promise<void> {
  res.setHeader('Set-Cookie', clearSessionCookieHeader());
  sendJson(res, 200, { ok: true });
}

export async function handleMe(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const userId = getSessionUserId(req);
  if (!userId) return sendJson(res, 200, { user: null });

  const user = await findUserById(userId);
  if (!user) return sendJson(res, 200, { user: null });

  const [members, receivedInvites, sentInvites] = await Promise.all([
    getHouseholdMembers(user.householdId, user.id),
    getReceivedInvites(user.email),
    getSentInvites(user.id),
  ]);

  const receivedWithSender = await Promise.all(
    receivedInvites.map(async i => {
      const sender = await findUserById(i.fromUserId);
      return { id: i.id, fromName: sender?.name ?? 'Alguém', fromEmail: sender?.email ?? '', createdAt: i.createdAt };
    }),
  );

  sendJson(res, 200, {
    user: publicUser(user),
    partner: members[0] ? publicUser(members[0]) : null,
    receivedInvites: receivedWithSender,
    sentInvites: sentInvites.map(i => ({ id: i.id, toEmail: i.toEmail, createdAt: i.createdAt })),
  });
}

async function requireUser(req: IncomingMessage, res: ServerResponse) {
  const userId = getSessionUserId(req);
  const user = userId ? await findUserById(userId) : null;
  if (!user) {
    sendJson(res, 401, { error: 'Não autenticado.' });
    return null;
  }
  return user;
}

export async function handleInviteSend(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const user = await requireUser(req, res);
  if (!user) return;

  const body = await readJsonBody(req);
  const toEmail = String(body.toEmail ?? '').trim().toLowerCase();

  if (!EMAIL_RE.test(toEmail)) return sendJson(res, 400, { error: 'Informe um e-mail válido.' });
  if (toEmail === user.email) return sendJson(res, 400, { error: 'Você não pode convidar a si mesmo.' });

  const existing = await findUserByEmail(toEmail);
  if (existing && existing.householdId === user.householdId) {
    return sendJson(res, 400, { error: 'Essa pessoa já faz parte do seu perfil compartilhado.' });
  }

  const dup = await findPendingInviteBetween(user.householdId, toEmail);
  if (dup) return sendJson(res, 200, { invite: { id: dup.id, toEmail: dup.toEmail, createdAt: dup.createdAt } });

  const invite = await createInvite({ fromUserId: user.id, fromHouseholdId: user.householdId, toEmail });
  sendJson(res, 200, { invite: { id: invite.id, toEmail: invite.toEmail, createdAt: invite.createdAt } });
}

async function handleInviteResolve(
  req: IncomingMessage,
  res: ServerResponse,
  outcome: 'accepted' | 'declined',
): Promise<void> {
  const user = await requireUser(req, res);
  if (!user) return;

  const body = await readJsonBody(req);
  const inviteId = String(body.inviteId ?? '');
  if (!inviteId) return sendJson(res, 400, { error: 'Convite inválido.' });

  const result = await resolveInvite(inviteId, user.id, outcome);
  if (!result.ok) return sendJson(res, 400, { error: result.error });
  sendJson(res, 200, { ok: true });
}

export const handleInviteAccept = (req: IncomingMessage, res: ServerResponse) => handleInviteResolve(req, res, 'accepted');
export const handleInviteDecline = (req: IncomingMessage, res: ServerResponse) => handleInviteResolve(req, res, 'declined');
