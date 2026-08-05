import { auth } from '../config/auth.js';

// Resolves the current session user from the request cookies/headers.
// Returns the user object or null.
export async function getSessionUser(req) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session || !session.user) return null;
    return session.user;
  } catch {
    return null;
  }
}

// Express middleware that requires a valid session.
export async function requireAuth(req, res, next) {
  const user = await getSessionUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.user = user;
  next();
}
