import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleInviteAccept } from '../../src/server/handlers.js';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return handleInviteAccept(req, res);
}
