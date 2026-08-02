import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleInviteDecline } from '../../src/server/handlers.js';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return handleInviteDecline(req, res);
}
