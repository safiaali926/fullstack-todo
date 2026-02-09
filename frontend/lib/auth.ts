/**
 * Better Auth Configuration
 * Configures Better Auth with JWT plugin, database connection, and session management
 */

import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

// Only initialize Better Auth if DATABASE_URL is available (runtime only, not build time)
export const auth = betterAuth({
  database: process.env.DATABASE_URL ? {
    provider: "postgres",
    url: process.env.DATABASE_URL,
  } : undefined as any,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  secret: process.env.BETTER_AUTH_SECRET || "fallback-secret-for-build",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
