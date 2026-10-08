import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // Provide a stable test-only JWT secret so the fail-closed guard in
    // lib/auth/jwt.ts doesn't throw during tests (NODE_ENV=test, not development).
    env: {
      JWT_SECRET: 'test-only-jwt-secret-minimum-32-chars-offset-io',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
