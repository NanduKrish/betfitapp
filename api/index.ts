import type { IncomingMessage, ServerResponse } from 'http';
import app from '../server/dist/index.js';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return (app as any)(req, res);
}
