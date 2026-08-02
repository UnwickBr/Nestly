import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleItemToggleFavorite } from '../../src/server/handlers.js';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return handleItemToggleFavorite(req, res);
}
