import 'dotenv/config'
import { defineConfig } from 'prisma/config'
import { localDatabaseUrl } from './server/db/local-url.ts'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  // generate / mock tests do not require an actual DB or a .env file.
  datasource: { url: localDatabaseUrl(process.env.DATABASE_URL ?? 'postgresql://YOUR_USER:YOUR_PASSWORD@127.0.0.1:5432/hook_build') },
})
