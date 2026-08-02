import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleInviteSend } from '../../src/server/handlers.js';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return handleInviteSend(req, res);
}
