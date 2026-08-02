import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleLogin } from '../../src/server/handlers.js';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return handleLogin(req, res);
}
