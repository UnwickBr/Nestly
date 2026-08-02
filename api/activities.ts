import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleActivitiesList } from '../src/server/handlers.js';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return handleActivitiesList(req, res);
}
