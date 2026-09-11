// @vitest-environment node
import { afterEach, beforeEach, describe, it } from 'vitest';
import { createApiTestServer } from './testing/api-test-server.ts';

// 初回だけ npm run db:test:setup。その後はこのファイルに操作とexpectを書きます。
// テストごとに空の専用領域を作成し、終了時にその領域だけ片付けます。
// 学習用DBに接続するPrismaやdeleteManyは不要です。
let api: Awaited<ReturnType<typeof createApiTestServer>> | undefined;
export let origin: string;

beforeEach(async () => {
  api = await createApiTestServer();
  origin = api.origin;
}, 30000);

afterEach(async () => {
  try { await api?.close(); } finally { api = undefined; }
}, 30000);

// テスト内で await restartApiServer() → 更新後のoriginにGET。
export async function restartApiServer() {
  if (!api) throw new Error('テスト用サーバーが起動していません。');
  await api.restart();
  origin = api.origin;
}

// fetch(`${origin}/api/tasks`, ...) でAPIを操作してください。
// テストの本文は async () => { ... } とし、再起動を含む場合は
// it('説明', async () => { ... }, 30000) のように制限時間を付けられます。
describe('[basic-08] 基礎8：タスクAPIをPrismaで永続化する', () => {
  // POST → await restartApiServer() → GET → IDとタイトルをexpectで確認。
  it.todo('[basic-08-01] POSTしたタスクをAPIの再起動後も同じID・タイトルでGETできる');
  it.todo('[basic-08-02] PATCHしたタイトルと完了状態がAPI再起動後も維持される');
  it.todo('[basic-08-03] DELETEしたタスクがAPI再起動後の一覧に戻らない');
  it.todo(
    '[basic-08-04] 存在しないIDの更新と削除は404になり他のデータを変更しない',
  );
  it.todo('[basic-08-05] DB障害時は成功応答を返さずエラーを返す');
});
