import { config } from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));

config({
  path: [
    resolve(currentDir, '../../../../.env'),
    resolve(currentDir, '../../.env'),
  ],
  // Keep root database settings as the shared source of truth while allowing
  // apps/api/.env to provide API-specific values that are not set at the root.
  override: false,
});
