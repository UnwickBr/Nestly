import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleItemsList } from '../../src/server/handlers.js';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return handleItemsList(req, res);
}
