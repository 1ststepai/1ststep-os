import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { fileURLToPath } from 'node:url';
import { relative } from 'node:path';
import { api } from './app.ts';

// Serves the API and the built SPA from one process under /os (ADR-010 D1, D7).
const webDist = relative(process.cwd(), fileURLToPath(new URL('../../web/dist', import.meta.url)));
const app = new Hono();
app.route('/', api);
app.use('/os/*', serveStatic({ root: webDist, rewriteRequestPath: (path) => path.replace(/^\/os/, '') }));
app.get('/os/*', serveStatic({ path: `${webDist}/index.html` }));

const port = Number(process.env.PORT ?? 3000);
serve({ fetch: app.fetch, port });
console.log(`1stStep OS listening on http://localhost:${port}/os`);
