import { createLocalPrisma } from '../server/db/client.ts'
import { createPracticeService } from '../server/db/practice-service.ts'

const db = createLocalPrisma()
try {
  const service = createPracticeService(db)
  const title = process.argv[2]
  if (title !== undefined) await service.add(title)
  console.table(await service.list())
} finally { await db.$disconnect() }
