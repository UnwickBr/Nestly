import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  handleItemCreate,
  handleItemUpdate,
  handleItemToggleFavorite,
  handleItemSetStatus,
  handleItemMoveToList,
  handleItemDelete,
  handleCommentsList,
  handleCommentAdd,
} from '../../src/server/handlers.js';

// GET /api/items (list) lives in api/items/index.ts — a bare route with
// no extra path segment isn't reliably matched by an *optional* catch-all
// ([[...action]]) outside Next.js, so this file only needs to cover the
// action routes below. Vercel's generic (non-Next) routing for [...action]
// only reliably matches a single extra segment, not true multi-segment
// catch-all — so /comments is shared by GET (list) and POST (add) instead
// of a nested /comments/add path.
export default function handler(req: IncomingMessage, res: ServerResponse) {
  const path = (req.url || '').split('?')[0];
  if (path === '/api/items/create' && req.method === 'POST') return handleItemCreate(req, res);
  if (path === '/api/items/update' && req.method === 'POST') return handleItemUpdate(req, res);
  if (path === '/api/items/toggle-favorite' && req.method === 'POST') return handleItemToggleFavorite(req, res);
  if (path === '/api/items/set-status' && req.method === 'POST') return handleItemSetStatus(req, res);
  if (path === '/api/items/move-to-list' && req.method === 'POST') return handleItemMoveToList(req, res);
  if (path === '/api/items/delete' && req.method === 'POST') return handleItemDelete(req, res);
  if (path === '/api/items/comments' && req.method === 'GET') return handleCommentsList(req, res);
  if (path === '/api/items/comments' && req.method === 'POST') return handleCommentAdd(req, res);
  res.statusCode = 404;
  res.end('Not found');
}
