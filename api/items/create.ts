import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleItemCreate } from '../../src/server/handlers.js';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return handleItemCreate(req, res);
}
