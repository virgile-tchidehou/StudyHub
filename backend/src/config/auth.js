import { betterAuth } from 'better-auth';
import { Pool } from 'pg';
import { env } from './env.js';

const isDev = process.env.NODE_ENV !== 'production';

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || 'change-me-change-me-change-me-000000',
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:8000',
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || 'http://localhost:8000',
    env.frontendUrl,
    'http://localhost:3000',
  ],
  // Frontend (Next.js :3000) and backend (Express :8000) run on separate origins.
  // Cross-origin cookie sharing requires SameSite=None (+ Secure in prod).
  advanced: {
    disableOriginCheck: true,
    disableCSRFCheck: true,
    cookieOptions: {
      // In dev, allow cross-origin cookie without HTTPS
      sameSite: isDev ? 'none' : 'none',
      secure: isDev ? false : true,
      httpOnly: true,
      path: '/',
    },
  },
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  emailAndPassword: {
    enabled: true,
  },
});

