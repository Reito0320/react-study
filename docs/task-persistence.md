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

`server/exercises.ts` の `createExerciseRouter` にサービスを受け取る引数を追加します。各ハンドラー内の配列操作を `await service.…()` に置き換えます。

今のAPIで決めたレスポンス形式を維持します。一覧を返す更新・削除は、処理後にDBから一覧を再取得します。

`server/app.ts` の `createApp` も引数を受け取り、Routerへ渡します。`server/index.ts` で `createLocalPrisma()` と `createTaskService(db)` を作り、createAppへ渡します。DBクライアントをリクエストごとに生成・切断しないでください。サーバー終了時に切断します。

この変更に伴い、既存の `createApp()` 呼び出し箇所も更新します。API単体テストにはモックまたは専用DBのサービスを渡し、引数なしで学習用DBへ接続する設計は避けます。

ReactはGETで初期一覧を取得します。古いlocalStorageを読む初期化やキャンセル時の一覧復元は外し、キャンセルは編集中の入力を破棄する処理にします。DateTimeはJSONで文字列になるため、自分の型定義も通信後の表現と整合させます。

## 4. 動作確認

`npm run dev` で追加・編集・完了切替 → API終了・再起動 → 再取得。値が残ることを確認します。削除したタスクは再起動しても戻らないこと、Studioで同じTaskが見えることも確認します。

## 5. 最初にテスト用DBを分ける

`server/task-persistence.test.ts` が課題のテストファイルです。まだTODOなので、接続・起動処理もこれから書きます。

1. 学習用DBと異なる `hook_build_test` を作成します。ホスト・ポート・ユーザーは自分の環境に合わせます。
2. Git管理外の `.env.test` に専用DBの `DATABASE_URL` と同じ値の `TEST_DATABASE_URL` を設定します。パスワードはコミットしません。
3. テスト用DBへマイグレーションを適用します。既存の環境変数を外して.env.testを読み込む例です。

```sh
env -u DATABASE_URL -u TEST_DATABASE_URL node --env-file=.env.test node_modules/prisma/build/index.js migrate deploy
```

4. テストファイルの先頭で `.env.test` を明示的に読み、`TEST_DATABASE_URL` が未設定なら失敗させます。学習用URLへのフォールバックは作りません。接続前にDB名が `hook_build_test` であることを検証します。
5. `PrismaPg` にそのURLを渡してPrismaClientを作り、サービス → createAppへ渡します。構造は `server/db/client.ts` が参考です。
6. `listen(0, '127.0.0.1')` で専用HTTPサーバーを起動し、実ポートをoriginに設定。通信先は `fetch(`${origin}/api/tasks`)` です。

**HTTPサーバーの別ポート起動だけでは、DBは分かれません。** 基礎6の `server/exercises.test.ts` もDB化後は接続先を注入するように更新してください。DBを使わない既存テストにはモックを渡します。

テストでは自分が作ったIDを記録し、終了時にそのIDだけ削除します。再起動検証は「POST → HTTPサーバーを閉じる → 同じDBで新しいアプリを起動 → GET」の順。途中でデータを削除すると永続化を検証できません。最後にHTTPサーバーとDBを切断します。

```sh
npm run test:learning -- basic-08
```

5件のTODOは未実装です。実DBの永続化テストと、中級7のモックテストは別の検証です。
