import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleFetchProductImage } from '../src/server/handlers.js';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return handleFetchProductImage(req, res);
}
