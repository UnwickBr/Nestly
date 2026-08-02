import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleItemMoveToList } from '../../src/server/handlers.js';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return handleItemMoveToList(req, res);
}
