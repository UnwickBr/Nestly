import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleItemDelete } from '../../src/server/handlers.js';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return handleItemDelete(req, res);
}
