import { prepareTestDatabase } from '../server/testing/test-database.ts'

try {
  const name = await prepareTestDatabase()
  console.info(`テスト用DB ${name} を準備しました。学習用データは変更していません。`)
  console.info('次は npm run test:learning -- basic-08 を実行してください。')
} catch (error) {
  console.error(error instanceof Error ? error.message : 'テスト用DBの準備に失敗しました。')
  process.exitCode = 1
}
