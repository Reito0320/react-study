import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../generated/prisma/client.ts'
import { localDatabaseUrl } from './local-url.ts'

// Only the explicit DB commands create a real client. Unit tests inject a mock.
export function createLocalPrisma() {
  const adapter = new PrismaPg({ connectionString: localDatabaseUrl(), connectionTimeoutMillis: 3000 })
  return new PrismaClient({ adapter })
}
