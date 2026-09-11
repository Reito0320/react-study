import { randomUUID } from 'node:crypto'
import { createLocalPrisma } from '../server/db/client.ts'

// 自分のタスクとは別のPracticeTaskで実演。この実行の1件だけ操作します。
const db = createLocalPrisma()
const id = randomUUID()
try {
  const created = await db.practiceTask.create({
    data: { id, title: 'Prismaを学ぶ' },
  })
  console.log('create:', created)

  const found = await db.practiceTask.findUnique({ where: { id } })
  console.log('findUnique:', found)

  const rows = await db.practiceTask.findMany({
    where: { id, completed: false, title: { contains: 'Prisma' } },
    orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
    select: { id: true, title: true },
    take: 10,
  })
  console.log('findMany + where / orderBy / select / take:', rows)

  const updated = await db.practiceTask.update({
    where: { id }, data: { completed: true },
  })
  console.log('update:', updated)

  const count = await db.practiceTask.count({ where: { id, completed: true } })
  console.log('count:', count)

  const deleted = await db.practiceTask.delete({ where: { id } })
  console.log('delete:', deleted)
  console.log('削除後のfindUnique:', await db.practiceTask.findUnique({ where: { id } }))
} finally {
  try {
    // 途中で失敗しても今回のIDだけ片付ける。0件でもエラーにならない。
    await db.practiceTask.deleteMany({ where: { id } })
  } finally {
    await db.$disconnect()
  }
}
