import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleRegister, handleLogin, handleLogout, handleMe } from '../../src/server/handlers.js';

// Single function handling all /api/auth/* routes — Vercel's Hobby plan
// caps a deployment at 12 Serverless Functions, so routes are grouped by
// resource instead of one file per action. Dispatch mirrors the local
// dev middleware in vite.config.ts.
export default function handler(req: IncomingMessage, res: ServerResponse) {
  const path = (req.url || '').split('?')[0];
  if (path === '/api/auth/register' && req.method === 'POST') return handleRegister(req, res);
  if (path === '/api/auth/login' && req.method === 'POST') return handleLogin(req, res);
  if (path === '/api/auth/logout' && req.method === 'POST') return handleLogout(req, res);
  if (path === '/api/auth/me' && req.method === 'GET') return handleMe(req, res);
  res.statusCode = 404;
  res.end('Not found');
}
