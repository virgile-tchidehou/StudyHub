import { Router } from 'express';
import { auth } from '../config/auth.js';

const router = Router();

const base = process.env.BETTER_AUTH_URL || 'http://localhost:8000';

router.all('/*', async (req, res) => {
  try {
    const url = new URL(req.originalUrl, base).toString();

    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === 'string') headers.set(key, value);
      else if (Array.isArray(value)) headers.set(key, value.join(', '));
    }

    const method = req.method;

    // Auth routes are mounted BEFORE express.json(), so we read the raw stream.
    let body;
    if (method !== 'GET' && method !== 'HEAD') {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      body = Buffer.concat(chunks);
    }

    const request = new Request(url, {
      method,
      headers,
      body: body || undefined,
    });

    const response = await auth.handler(request);

    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'content-length') return;
      res.setHeader(key, value);
    });
    res.status(response.status);
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

export default router;
