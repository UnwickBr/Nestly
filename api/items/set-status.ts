import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleItemSetStatus } from '../../src/server/handlers.js';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return handleItemSetStatus(req, res);
}
