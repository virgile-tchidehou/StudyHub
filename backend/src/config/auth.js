import { betterAuth } from 'better-auth';
import { Pool } from 'pg';
import { env } from './env.js';

const isProduction = process.env.NODE_ENV === 'production';
const developmentAuthSecret = 'dev-only-studyhub-secret-change-before-production';

if (isProduction && !env.betterAuthSecret) {
  throw new Error('BETTER_AUTH_SECRET is required in production.');
}

export const auth = betterAuth({
  secret: env.betterAuthSecret || developmentAuthSecret,
  baseURL: env.betterAuthUrl,
  trustedOrigins: [
    env.betterAuthUrl,
    env.frontendUrl,
    'http://localhost:3000',
  ].filter(Boolean),
  advanced: {
    // Keep CSRF/origin protections enabled. The frontend sends credentials
    // through the Next.js proxy, while trustedOrigins defines valid origins.
    cookieOptions: {
      sameSite: 'lax',
      secure: isProduction,
      httpOnly: true,
      path: '/',
    },
  },
  database: new Pool({
    connectionString: env.databaseUrl,
  }),
  emailAndPassword: {
    enabled: true,
  },
});
