# 既存のPostgreSQLからDB・Prismaを学ぶ

主な利用者は、既にローカルDB環境を持つインストラクターです。その環境に教材用DBを作り、Prismaによる保存と取得を学びます。

学習順序は **ローカルにDBを作成 → Prismaで保存・取得 → モックテスト** です。
通常の `npm run dev` はDBを要求しません。今回の参考例は独立した `PracticeTask` を使い、既存タスクUIのAPI接続は学習者の実装課題です。

## 基礎7：ローカルにDBを作成して保存する

### 1. 自分のDB環境を確認する

既存のPostgreSQLの起動方法・ホスト・ポート・ユーザーを確認します。5432は一般的なポートですが、自分の環境の値を使ってください。PostgreSQL本体の再インストールは不要です。
この教材はPostgreSQLを前提とします。MySQLなど別のDBにはそのまま接続できません。

### 2. 教材専用のDBを作る

既存の業務用DBと分けて `hook_build` という空のDBを作ります。普段使っている管理ツールでも構いません。以下はpsql/createdbが利用できる場合の例です。`YOUR_USER` とポートは実際の値に置き換えます。

```sh
createdb -h 127.0.0.1 -p 5432 -U YOUR_USER hook_build
```

DB作成権限がなければ、インストラクターに専用DBを用意してもらいます。既に教材DBがあれば再作成しません。

### 3. Prismaの接続先を設定する

`.env.example` を参考に `.env` を用意し、接続可能なユーザー・パスワード・ポート・DB名へ置き換えます。既存の `.env` は上書きしないでください。

```text
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@127.0.0.1:5432/hook_build"
```

パスワード内の `@` や `#` などはURL用にパーセントエンコードします。接続情報はGit管理外で、ブラウザへ渡す `VITE_` 変数には設定しません。
シェルで `DATABASE_URL` をexportしている場合はそちらが優先されます。意図した接続先になっているか確認してください。

### 4. テーブルを準備し、保存する

```sh
npm install
npm run db:apply
npm run db:generate
npm run db:check
npm run db:demo -- "直接DBで保存する"
npm run db:demo
npm run db:studio
```

- `db:apply`：提供済みのマイグレーションを適用し、PracticeTaskテーブルを作る。新しいスキーマ変更は生成しない。専用DB内でテーブルを作る権限が必要。
- `db:generate`：スキーマからTypeScriptで使うPrisma Clientを生成する。
- `db:check`：確認用の1件を作成・再取得し、そのIDだけを削除する。
- `db:demo`：引数のタイトルを保存して残す。引数なしなら一覧だけを取得する。
- `db:studio`：表示されたローカルURLを開き、テーブルの中身を確認する。

同じタスクが次の `db:demo` でも取得できれば、プログラム終了後もDBに保存できています。
スキーマを自分で変更する段階では `npm run db:migrate -- --name describe_change` を使い、続けて `db:generate` します。`migrate dev` は変更確認用のshadow databaseを使うため、その作成権限か別途設定が必要です。初回教材は提供済み履歴を `db:apply` するので、そのためのDB作成権限は不要です。

## ファイルの役割

- `prisma/schema.prisma`：PracticeTaskの設計。
- `prisma/migrations/`：テーブル変更の履歴。
- `prisma.config.ts`：CLIの接続設定。
- `server/db/client.ts`：実PrismaClientとpgアダプター。
- `server/db/practice-service.ts`：DBの実行方法に依存しない、追加・一覧の参考コード。
- `generated/prisma/`：生成物。直接編集しない。

## 中級7：Prismaをモックする

実DBの操作を確認してから `server/prisma.test.ts` を読みます。
本番側の関数 `createPracticeService(db)` に、テストでは `mockDeep<PrismaClient>()` を渡します。実クライアントを作る `client.ts` はテストで読み込まないため、DB接続は起こりません。

- `mockResolvedValue`：DBが正常に返す値を用意する。
- `mockRejectedValue`：DBの失敗を再現する。
- `toHaveBeenCalledExactlyOnceWith`：検証・整形した値でDBを1回だけ呼んだか確かめる。
- `not.toHaveBeenCalled`：不正な入力でDBに書き込まないことを確かめる。
- `rejects`：非同期処理の失敗を待って確かめる。
- `mockReset`：前のテストの呼び出し履歴と戻り値設定を消す。

参考例3件は実装済みです。追加・入力拒否・DB障害を扱います。残りの一覧取得2件は学習者が `it.todo` を `it` に変えて書きます。
正常系は2件の戻り値と `orderBy`（createdAt、idの昇順）、異常系はエラーの伝播を検証してください。サービスを実行せずモック自体だけを呼ぶテストでは、実装の不具合は見つかりません。

```sh
npm run test:prisma
npm run test:learning -- intermediate-07
```

DB停止中でも実行できます。`test:prisma` は結果パネルを更新しません。章のパネルへ反映するには `test:learning` を使います。
基礎7のパネルはローカルURLの設定ルールを検証する提供済みテストです。実DBの疎通確認は `db:check`、保存データの保持は `db:demo` の再実行で別途確認します。モックテストだけでSQL・マイグレーション・接続の正しさは保証できません。

## 次の応用

この例を参考に、基礎6で作った `server/exercises.ts` のメモリ保存をPrismaに置き換えます。まず必要なタスク項目をスキーマに追加し、入力検証とHTTPの責務、保存の責務を分けてください。参考例は追加・一覧に絞っており、課題のCRUD完成解答ではありません。

## 公式資料

- [Prisma 7への移行・設定](https://docs.prisma.io/docs/guides/upgrade-prisma-orm/v7)
- [Prismaの単体テストと依存性注入](https://docs.prisma.io/docs/orm/prisma-client/testing/unit-testing)
- [PrismaとVitestのモックテスト](https://www.prisma.io/blog/testing-series-2-xPhjjmIEsM)
