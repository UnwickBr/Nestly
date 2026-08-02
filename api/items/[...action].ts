import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  handleItemCreate,
  handleItemToggleFavorite,
  handleItemSetStatus,
  handleItemMoveToList,
  handleItemDelete,
} from '../../src/server/handlers.js';

// GET /api/items (list) lives in api/items/index.ts — a bare route with
// no extra path segment isn't reliably matched by an *optional* catch-all
// ([[...action]]) outside Next.js, so this file only needs to cover the
// action routes below, which always have a segment.
export default function handler(req: IncomingMessage, res: ServerResponse) {
  const path = (req.url || '').split('?')[0];
  if (path === '/api/items/create' && req.method === 'POST') return handleItemCreate(req, res);
  if (path === '/api/items/toggle-favorite' && req.method === 'POST') return handleItemToggleFavorite(req, res);
  if (path === '/api/items/set-status' && req.method === 'POST') return handleItemSetStatus(req, res);
  if (path === '/api/items/move-to-list' && req.method === 'POST') return handleItemMoveToList(req, res);
  if (path === '/api/items/delete' && req.method === 'POST') return handleItemDelete(req, res);
  res.statusCode = 404;
  res.end('Not found');
}
