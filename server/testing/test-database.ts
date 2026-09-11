import 'dotenv/config'
import { randomUUID } from 'node:crypto'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { Client } from 'pg'
import { testDatabaseUrl, testSchemaName } from './database-url.ts'

const root = fileURLToPath(new URL('../../', import.meta.url))
export function configuredTestUrl() {
  return testDatabaseUrl(process.env.DATABASE_URL, process.env.TEST_DATABASE_URL)
}

export async function migrateTestDatabase(url: string) {
  const checked = testDatabaseUrl(process.env.DATABASE_URL, url)
  const schema = new URL(url).searchParams.get('schema')
  const target = new URL(checked)
  if (schema) target.searchParams.set('schema', testSchemaName(schema))
  await new Promise<void>((resolveDone, reject) => {
    const child = spawn(process.execPath, [resolve(root, 'node_modules/prisma/build/index.js'), 'migrate', 'deploy'], {
      cwd: root, env: { ...process.env, DATABASE_URL: target.toString() }, stdio: 'ignore', timeout: 20000,
    })
    child.once('error', () => reject(new Error('Prismaを起動できません。npm installを確認してください。')))
    child.once('exit', code => code === 0 ? resolveDone() : reject(new Error('テスト用DBへのマイグレーションに失敗しました。DBの権限とprisma/migrationsを確認してください。')))
  })
}

export async function prepareTestDatabase() {
  const url = configuredTestUrl()
  const target = new URL(url)
  const name = decodeURIComponent(target.pathname.slice(1))
  // 接続先インスタンス上の管理DBへ接続し、未作成のときだけDBを追加する。
  const adminUrl = new URL(url)
  adminUrl.pathname = '/postgres'
  const admin = new Client({ connectionString: adminUrl.toString(), connectionTimeoutMillis: 3000 })
  try {
    await admin.connect()
    const result = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [name])
    if (result.rowCount === 0) {
      // nameはdatabase-url.tsで英数字と_に制限済み。
      try { await admin.query(`CREATE DATABASE "${name}"`) }
      catch (error) { if ((error as { code?: string }).code !== '42P04') throw error }
    }
  } catch {
    throw new Error('テスト用DBを準備できません。DBの起動・接続設定・DB作成権限を確認してください。権限がなければ同じ接続先に学習用DB名_testを一度作成してください。')
  } finally { await admin.end() }
  await migrateTestDatabase(url)
  return name
}

export async function createTestDatabaseScope() {
  const baseUrl = configuredTestUrl()
  const schema = testSchemaName(`learning_test_${randomUUID().replaceAll('-', '')}`)
  const admin = new Client({ connectionString: baseUrl, connectionTimeoutMillis: 3000 })
  try { await admin.connect() }
  catch {
    await admin.end()
    throw new Error('テスト用DBに接続できません。先に npm run db:test:setup を実行してください。')
  }
  let created = false
  async function close() {
    try {
      if (created) {
        await admin.query(`DROP SCHEMA "${testSchemaName(schema)}" CASCADE`)
        created = false
      }
    } finally { await admin.end() }
  }
  try {
    await admin.query(`CREATE SCHEMA "${schema}"`)
    created = true
    const url = new URL(baseUrl)
    url.searchParams.set('schema', schema)
    await migrateTestDatabase(url.toString())
    return { url: url.toString(), close }
  } catch (error) {
    await close()
    throw error
  }
}
