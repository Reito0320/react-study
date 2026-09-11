import { localDatabaseUrl } from '../db/local-url.ts'

// 接続情報は画面やログに出さない。テスト用DB名は学習用DB名 + _test。
export function testDatabaseUrl(learningValue: string | undefined, testValue?: string): string {
  let learning: URL
  let test: URL
  try {
    learning = new URL(localDatabaseUrl(learningValue))
    test = new URL(localDatabaseUrl(testValue ?? learningValue))
  } catch {
    throw new Error('.envのDATABASE_URLにローカルPostgreSQLの接続先を設定してください。')
  }
  const learningName = decodeURIComponent(learning.pathname.slice(1))
  if (!/^[a-zA-Z_][a-zA-Z0-9_]{0,57}$/.test(learningName)) {
    throw new Error('自動準備には58文字以内の英数字・_の学習用DB名を使用してください。')
  }
  const expected = `${learningName}_test`
  if (!testValue) test.pathname = `/${expected}`
  if (decodeURIComponent(test.pathname.slice(1)) !== expected) {
    throw new Error('TEST_DATABASE_URLのDB名は学習用DB名に_testを付けた名前にしてください。学習用DBは使えません。')
  }
  // ホストやsearch_pathをクエリで上書きさせない。
  for (const key of test.searchParams.keys()) {
    if (key !== 'schema') throw new Error('テスト用接続URLの追加パラメーターはschemaだけ使用できます。')
  }
  test.searchParams.delete('schema')
  return test.toString()
}

export function testSchemaName(value: string): string {
  if (!/^learning_test_[a-f0-9]{32}$/.test(value)) throw new Error('テスト領域の名前が不正です。')
  return value
}
