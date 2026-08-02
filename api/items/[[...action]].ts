import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  handleItemsList,
  handleItemCreate,
  handleItemToggleFavorite,
  handleItemSetStatus,
  handleItemMoveToList,
  handleItemDelete,
} from '../../src/server/handlers.js';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  const path = (req.url || '').split('?')[0];
  if (path === '/api/items' && req.method === 'GET') return handleItemsList(req, res);
  if (path === '/api/items/create' && req.method === 'POST') return handleItemCreate(req, res);
  if (path === '/api/items/toggle-favorite' && req.method === 'POST') return handleItemToggleFavorite(req, res);
  if (path === '/api/items/set-status' && req.method === 'POST') return handleItemSetStatus(req, res);
  if (path === '/api/items/move-to-list' && req.method === 'POST') return handleItemMoveToList(req, res);
  if (path === '/api/items/delete' && req.method === 'POST') return handleItemDelete(req, res);
  res.statusCode = 404;
  res.end('Not found');
}
