import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleInviteSend, handleInviteAccept, handleInviteDecline } from '../../src/server/handlers.js';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  const path = (req.url || '').split('?')[0];
  if (path === '/api/invites/send' && req.method === 'POST') return handleInviteSend(req, res);
  if (path === '/api/invites/accept' && req.method === 'POST') return handleInviteAccept(req, res);
  if (path === '/api/invites/decline' && req.method === 'POST') return handleInviteDecline(req, res);
  res.statusCode = 404;
  res.end('Not found');
}
