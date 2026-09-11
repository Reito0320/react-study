// @vitest-environment node
import { afterEach, beforeEach, describe, it } from 'vitest';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { createApp } from './app.ts';

// 準備済み：各テストで空のAPIサーバーを起動し、終了後に片付けます。
// npm run devは不要。普段の画面のデータには触れません。
// fetchには相対URLではなく `${origin}/api/tasks` を渡してください。
let server: Server;
// TODO本文から参照するテスト専用サーバーのURL。
export let origin: string;
beforeEach(async () => {
  server = createApp().listen(0, '127.0.0.1');
  await new Promise<void>((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
afterEach(async () => {
  if (server?.listening) {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});

// 要件を実装 → ブラウザで確認 → it.todoをitに変えて第二引数にテスト本体を記述。
// [ID]と既存タイトルは結果表示に使うため保持してください。追加テストはIDなしで自由に書けます。
// APIの最低テストです。通信中・失敗・競合時の下書き保持や再試行上限などのUI確認は、
// src/exercises/chapters.test.tsxへTesting Libraryのテストを追加できます。

describe("[basic-06] チャプター6：Expressで取得と保存", () => {
  it.todo("[basic-06-01] POSTしたタスクをGETすると同じIDとタイトルを取得できる")
  it.todo("[basic-06-02] PATCHでタイトルと完了状態を保存し、再取得しても変更が維持される")
  it.todo("[basic-06-03] DELETEしたタスクは再取得した一覧に含まれない")
  it.todo("[basic-06-04] 存在しないIDの更新と削除に404を返す")
})

describe("[intermediate-06] 中級6：ミドルウェアでAPIを整える", () => {
  it.todo("[intermediate-06-01] 不正なJSONに400と統一形式のエラーを返す")
  it.todo("[intermediate-06-02] 空白タイトルに400を返し、タスクを保存しない")
  it.todo("[intermediate-06-03] 未知のIDに404と統一形式のエラーを返す")
  it.todo("[intermediate-06-04] 入力検証で拒否したリクエストは後続ルートを実行せず一度だけ応答する")
})

describe("[nightmare-05] ナイトメア5：同時編集の競合を検出", () => {
  it.todo("[nightmare-05-01] 現在のversionによる更新に成功し、versionを更新する")
  it.todo("[nightmare-05-02] 同じ古いversionによる2回目の更新には409を返す")
  it.todo("[nightmare-05-03] 競合した更新でサーバーの最新タイトルとversionを上書きしない")
})

describe("[nightmare-06] ナイトメア6：障害から安全に復旧", () => {
  it.todo("[nightmare-06-01] 同じ操作IDのPOSTを再送しても件数が増えず同じタスクIDを返す")
  it.todo("[nightmare-06-02] 異なる操作IDのPOSTは別々のタスクを作成する")
  it.todo("[nightmare-06-03] エラー応答とログを同じ追跡IDで照合できる")
  it.todo("[nightmare-06-04] エラーログに認証値などの秘密値を含めない")
})
