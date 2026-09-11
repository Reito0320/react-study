// @vitest-environment node
import express from 'express'
import { expect, it } from 'vitest'
import type { PrismaClient } from '../../generated/prisma/client.ts'
import { createApiTestServer } from './api-test-server.ts'

// 教材基盤の実DB検証。通常のnpm testでは実行しない。
// npm run db:test:setup の後、RUN_DB_INFRA_TESTS=1 npm test -- server/testing/api-test-server.test.ts
function fixtureApp(prisma?: PrismaClient) {
  if (!prisma) throw new Error('Test Prisma is required')
  const app = express()
  app.use(express.json())
  app.post('/items', async (req, res) => {
    res.json(await prisma.practiceTask.create({ data: { title: req.body.title } }))
  })
  app.get('/items', async (_req, res) => { res.json(await prisma.practiceTask.findMany()) })
  return app
}

it.skipIf(process.env.RUN_DB_INFRA_TESTS !== '1')('isolates data between tests and preserves it across API and Prisma restarts', async () => {
  const first = await createApiTestServer(fixtureApp)
  let second: Awaited<ReturnType<typeof createApiTestServer>> | undefined
  try {
    const response = await fetch(`${first.origin}/items`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'fixture-check' }),
    })
    expect(response.status).toBe(200)
    const saved = await response.json()
    await first.restart()
    expect(await (await fetch(`${first.origin}/items`)).json()).toEqual([saved])
    second = await createApiTestServer(fixtureApp)
    expect(await (await fetch(`${second.origin}/items`)).json()).toEqual([])
  } finally {
    try { await first.close() } finally { await second?.close() }
  }
}, 60000)

it.skipIf(process.env.RUN_DB_INFRA_TESTS !== '1')('removes only its generated schema on cleanup', async () => {
  const { Client } = await import('pg')
  const { createTestDatabaseScope, configuredTestUrl } = await import('./test-database.ts')
  const scope = await createTestDatabaseScope()
  const schema = new URL(scope.url).searchParams.get('schema')
  const db = new Client({ connectionString: configuredTestUrl(), connectionTimeoutMillis: 3000 })
  let closed = false
  try {
    await db.connect()
    const lookup = () => db.query('SELECT nspname FROM pg_namespace WHERE nspname = $1', [schema])
    expect((await lookup()).rowCount).toBe(1)
    await scope.close()
    closed = true
    expect((await lookup()).rowCount).toBe(0)
    expect((await db.query("SELECT 1 FROM pg_namespace WHERE nspname = 'public'")).rowCount).toBe(1)
  } finally {
    try { if (!closed) await scope.close() } finally { await db.end() }
  }
}, 30000)
