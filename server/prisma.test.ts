// @vitest-environment node
import { beforeEach, describe, expect, it } from 'vitest'
import { mockDeep, mockReset } from 'vitest-mock-extended'
import type { PrismaClient } from '../generated/prisma/client.ts'
import { createPracticeService } from './db/practice-service.ts'
import { localDatabaseUrl } from './db/local-url.ts'

const prismaMock = mockDeep<PrismaClient>()
const service = createPracticeService(prismaMock)
beforeEach(() => mockReset(prismaMock))

// These check local configuration rules, not actual PostgreSQL connectivity.
describe('[basic-07] 基礎7：ローカルPostgreSQLとPrisma', () => {
  it('[basic-07-01] localhostのPostgreSQL接続URLを受け付ける', () => {
    const url = 'postgresql://learner:password@127.0.0.1:5432/hook_build'
    expect(localDatabaseUrl(url)).toBe(url)
  })
  it('[basic-07-02] 外部ホストへの接続を拒否する', () => {
    expect(() => localDatabaseUrl('postgresql://user:password@example.com/db')).toThrow('ローカルPostgreSQL専用')
    expect(() => localDatabaseUrl('postgresql://user:password@localhost/db?host=example.com')).toThrow('ローカルPostgreSQL専用')
  })
})

describe('[intermediate-07] 中級7：Prismaのモックテスト', () => {
  it('[intermediate-07-01] 前後空白を除いたタイトルをPrismaに渡し、保存結果を返す（参考例）', async () => {
    const saved = { id: 'practice-1', title: 'Prismaを学ぶ', completed: false, createdAt: new Date('2026-01-01T00:00:00Z') }
    prismaMock.practiceTask.create.mockResolvedValue(saved)

    const result = await service.add('  Prismaを学ぶ  ')

    expect(prismaMock.practiceTask.create).toHaveBeenCalledExactlyOnceWith({ data: { title: 'Prismaを学ぶ' } })
    expect(result).toEqual(saved)
  })
  it('[intermediate-07-02] 空白タイトルを拒否し、Prismaの作成処理を呼ばない（参考例）', async () => {
    await expect(service.add('   ')).rejects.toThrow('タイトルを入力してください。')
    expect(prismaMock.practiceTask.create).not.toHaveBeenCalled()
  })
  it('[intermediate-07-03] DBエラーを成功として扱わず、呼び出し元に伝える（参考例）', async () => {
    prismaMock.practiceTask.create.mockRejectedValue(new Error('DB unavailable'))
    await expect(service.add('Prismaを学ぶ')).rejects.toThrow('DB unavailable')
  })
  it.todo('[intermediate-07-04] 一覧を作成日時とIDの昇順で問い合わせ、取得した2件を返す')
  it.todo('[intermediate-07-05] 一覧取得の失敗を呼び出し元に伝える')
})
