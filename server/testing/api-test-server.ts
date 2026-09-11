import { once } from 'node:events'
import type { Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { createApp } from '../app.ts'
import { createLocalPrisma } from '../db/client.ts'
import { createTestDatabaseScope } from './test-database.ts'

export async function createApiTestServer(buildApp: typeof createApp = createApp) {
  const scope = await createTestDatabaseScope()
  let prisma: ReturnType<typeof createLocalPrisma> | undefined
  let server: Server | undefined
  let origin = ''

  async function stop() {
    try {
      if (server?.listening) {
        const current = server
        await new Promise<void>((resolve, reject) => {
          current.close(error => error ? reject(error) : resolve())
          current.closeAllConnections()
        })
      }
    } finally {
      server = undefined
      await prisma?.$disconnect()
      prisma = undefined
    }
  }
  async function start() {
    prisma = createLocalPrisma(scope.url)
    await prisma.$connect()
    server = buildApp(prisma).listen(0, '127.0.0.1')
    await once(server, 'listening')
    origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
  }
  async function close() {
    try { await stop() } finally { await scope.close() }
  }
  try { await start() }
  catch (error) { await close(); throw error }
  return {
    get origin() { return origin },
    // 新しいExpressとPrismaを作るが、テスト中のDBデータは保持する。
    async restart() { await stop(); await start() },
    close,
  }
}
