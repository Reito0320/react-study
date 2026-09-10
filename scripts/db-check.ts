import assert from 'node:assert/strict'
import { createLocalPrisma } from '../server/db/client.ts'
import { createPracticeService } from '../server/db/practice-service.ts'

const db = createLocalPrisma()
const service = createPracticeService(db)
let createdId: string | undefined
try {
  const created = await service.add('  Prisma接続確認  ')
  createdId = created.id
  const saved = await db.practiceTask.findUniqueOrThrow({ where: { id: created.id } })
  assert.equal(saved.title, 'Prisma接続確認')
  assert.equal(saved.completed, false)
  console.info('PostgreSQLへの作成・再取得に成功しました。確認用の1件だけ削除します。')
} finally {
  try {
    if (createdId) await db.practiceTask.delete({ where: { id: createdId } })
  } finally { await db.$disconnect() }
}
