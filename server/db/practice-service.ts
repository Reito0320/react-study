import type { PrismaClient } from '../../generated/prisma/client.ts'

export type PracticeDatabase = Pick<PrismaClient, 'practiceTask'>

// Completed reference example, independent from the learner's /api/tasks.
export function createPracticeService(db: PracticeDatabase) {
  return {
    async add(title: string) {
      const trimmed = title.trim()
      if (!trimmed) throw new Error('タイトルを入力してください。')
      return db.practiceTask.create({ data: { title: trimmed } })
    },
    async list() {
      return db.practiceTask.findMany({ orderBy: [{ createdAt: 'asc' }, { id: 'asc' }] })
    },
  }
}
