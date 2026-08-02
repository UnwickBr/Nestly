import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleMe } from '../../src/server/handlers';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return handleMe(req, res);
}
