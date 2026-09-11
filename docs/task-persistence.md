# 基礎8：タスクAPIをPrismaで永続化する

基礎6のCRUDと基礎7のPrisma接続を使う課題です。ReactのURL・JSON形式を維持し、保存先を配列からDBに変えます。既存メモリデータの移行は行いません。

## 1. モデルを追加する

`prisma/schema.prisma` に、自分のタスク設計に合わせたモデルを追加します。モデル名・項目名・型は学習者ごとに決めて構いません。参考教材のPracticeTaskは残します。クエリの書き方は、サイドバーの「Prismaチュートリアル」で確認できます。

```sh
npm run db:migrate -- --name add_task
npm run db:generate
```

`.env` の学習用DBに実行します。既存データを保持し、リセットを求められたら理由を確認します。生成後はモデル名に対応したクライアントが使えます。

## 2. 保存処理を作る

`server/db/task-service.ts` を新規作成し、`createTaskService(db)` から一覧・追加・更新・削除の関数を返す形で書きます。`server/db/practice-service.ts` が構造の参考です。

- 引数のdbは自分のモデルに必要な操作へ型を絞ると、モックや別DBを渡しやすくなります。
- 一覧はfindManyで、自分の画面に必要な表示順を明示。
- 追加はcreate。IDをサーバーで生成する場合、Reactは返ってきたIDを使います。
- 更新はupdate。送られていない項目を消さず、入力の型・空タイトルを確認。
- 削除はdelete。対象不在は404へ変換し、接続障害と区別。

## 3. APIを接続する

Prismaを外から受け取る接続部分は準備済みです。`server/exercises.ts` の各ハンドラーで、受け取ったPrismaを使って配列操作をDBクエリに置き換えます。必要ならサービス関数へ切り出して構いません。

今のAPIで決めたレスポンス形式を維持します。一覧を返す更新・削除は、処理後にDBから一覧を再取得します。

`createApp(prisma)` → `createExerciseRouter(prisma)` の順でクライアントを渡します。テスト用クライアントを受け取った場合、Router内で別のクライアントを作り直さず、そのまま使います。

ReactはGETで初期一覧を取得します。古いlocalStorageを読む初期化やキャンセル時の一覧復元は外し、キャンセルは編集中の入力を破棄する処理にします。DateTimeはJSONで文字列になるため、自分の型定義も通信後の表現と整合させます。

## 4. 動作確認

`npm run dev` で追加・編集・完了切替 → API終了・再起動 → 再取得。値が残ることを確認します。削除したタスクは再起動しても戻らないこと、Studioで同じTaskが見えることも確認します。

## 5. テストの準備は最初に1コマンド

PostgreSQLが起動し、学習用DBの `.env` が設定済みなら実行します。

```sh
npm run db:test:setup
```

同じホスト・ポート・ユーザーで、学習用DB名に `_test` を付けたDBを自動作成し、このプロジェクトのマイグレーションを適用します。例：`hook_build` → `hook_build_test`。`.env` の書き換えや `.env.test` の作成は不要です。DBがあれば再利用するので再実行できます。スキーマ変更後は先にマイグレーションと `npm run db:generate` を実行してください。

DB作成権限がない場合は、自分の管理するPostgreSQLにその名前のDBを一度作成してから再実行します。別ユーザーで接続したい場合だけ `TEST_DATABASE_URL` を `.env` またはシェルに設定できます。DB名は学習用DB名 + `_test` に限定します。

### テストファイルで書くこと

`server/task-persistence.test.ts` には、起動・終了・origin・再起動関数が用意済みです。TODOをitに変えて、API操作とexpectだけを書きます。

```ts
// テストの本文で使用（レスポンスの検証は自分で書く）
const res = await fetch(`${origin}/api/tasks`);
const data = await res.json();

// POSTなどで保存した後に使う。再起動後は更新されたoriginでGETする。
await restartApiServer();
```

各テストは新しい空の保存領域から始まります。HTTPサーバーの再起動中はデータが残り、テスト終了時にその領域だけを削除します。モデル名・項目名によるdeleteManyは不要です。PrismaインスタンスやDELETEによる後片付けを自分で追加しないでください。

```sh
npm run test:learning -- basic-08
```

TODOは未実装扱いでDBへ接続しません。書きかけの確認にexpectがなければ、保存できたことを検証したとは言えません。

### 仕組みを知りたいとき

- `scripts/setup-test-db.ts`：別DBを準備する入口。
- `server/testing/test-database.ts`：テストごとのschema（DB内の専用領域）を作り、現在のマイグレーションを適用・後片付け。
- `server/testing/api-test-server.ts`：専用DBのPrismaをcreateApp → Routerへ渡し、空きポートでHTTPサーバーを起動。再起動ではExpressとPrismaを作り直し、保存領域は維持。
- `server/db/client.ts`：引数の接続URL・schemaをPrismaに適用。通常起動はこれまでどおり.envを使う。

DBの分離とサーバー起動は教材側で準備済みです。学習者はAPIの保存処理と、その動作の検証に集中できます。DB化した基礎6のAPIテストにも同じ専用サーバーを使います。

接続できない場合はDBの起動と.envを確認。マイグレーション失敗は権限と `prisma/migrations` を確認します。テストの強制終了では専用領域が残ることがありますが、次の実行とは別名なので学習データや次のテストには混ざりません。
