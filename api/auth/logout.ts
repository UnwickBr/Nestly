import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleLogout } from '../../src/server/handlers';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return handleLogout(req, res);
}
