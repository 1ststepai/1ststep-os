import { Hono } from 'hono';

// API routes live under /os/api (ADR-010 D1). Auth, authorize(), CSRF and tenancy arrive in M2.
export const api = new Hono().basePath('/os/api');

api.get('/healthz', (c) => c.json({ status: 'ok' }));
