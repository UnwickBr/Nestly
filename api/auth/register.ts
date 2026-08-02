import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleRegister } from '../../src/server/handlers';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return handleRegister(req, res);
}
