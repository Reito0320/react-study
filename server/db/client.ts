import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.ts';
import { localDatabaseUrl } from './local-url.ts';

// Only the explicit DB commands create a real client. Unit tests inject a mock.
export function createLocalPrisma(connectionString = localDatabaseUrl()) {
  const url = new URL(localDatabaseUrl(connectionString));
  const adapter = new PrismaPg({
    connectionString,
    connectionTimeoutMillis: 3000,
  }, { schema: url.searchParams.get('schema') ?? 'public' });
  return new PrismaClient({ adapter });
}
