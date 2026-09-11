# Hook & Build

「Hookの書き方は知ってる。でも、どこで使えばいいんだろう？」を、手を動かして確かめる学習アプリです。

自分のPCで、自分のペースで進める教材です。タスク管理アプリを少しずつ育てながら、React Hooks・Express・Vitestを学びます。コードはすべてTypeScript。CSSは用意してあるので、まずは機能づくりに集中できます。

## まずは起動してみよう

Node.js 22.12以上を用意して、プロジェクトのフォルダで実行します。

```sh
npm install
npm run dev
```

[http://127.0.0.1:5173](http://127.0.0.1:5173) を開けば準備完了。Reactの画面とExpressのAPIが一緒に起動します。止めるときは `Ctrl+C` です。

最初は **チャプター0** へ。カウンターを例に、実装からテストまでをひと回りできます。次回からは前回開いていた章に戻ります。

## どうやって進めるの？

1. **要件を読む。** 「何をしたら、どうなる？」をイメージする。
2. **エディタで実装する。** 保存すると、右側のプレビューに反映されます。
3. **UIで確かめる。** 実際に操作して、期待どおりか確認する。
4. **テストを書く。** 動いたことを、今度はコードで確かめる。

画面のチェック欄で自分の進み具合を記録したら、次の課題へ。同じアプリに機能を足していくので、章を変えても実装コードは切り替わりません。

| 書きたいもの | 編集するファイル |
| --- | --- |
| Reactの機能 | `src/exercises/chapters.tsx` |
| Reactのテスト | `src/exercises/chapters.test.tsx` |
| ExpressのAPI | `server/exercises.ts` |
| APIのテスト | `server/exercises.test.ts` |
| 実ブラウザのテスト | `e2e/exercises/` |

テストは章ごとの `describe` と、要件名入りの `it.todo` を用意しています。`it.todo` を `it` に変えて本文を書いてください。名前の `[basic-01-01]` などのIDは、画面と対応付ける目印です。

## テストを実行する

まずは取り組んでいる章だけでOKです。

```sh
npm run test:learning -- basic-01
```

右側のコピーボタンから、その章のコマンドをコピーできます。実行後は結果が自動更新され、成功は緑、失敗は赤、まだ書いていないテストは未実装と表示されます。

テスト名を変えたら、保存するだけで一覧にも反映されます。ただし、**保存しただけではテストは実行されません。** コードを変えたら、コマンドをもう一度実行してください。

| コマンド | できること |
| --- | --- |
| `npm run test:learning` | 全課題を実行して、画面の結果も更新 |
| `npm test` | 学習基盤を含むVitestを実行。結果パネルは更新しない |
| `npm run test:watch` | ファイル変更に合わせてVitestを実行 |
| `npm run build` | 型チェックとビルド |
| `npm run lint` | コードの書き方をチェック |

実ブラウザでも試す場合は、初回に `npx playwright install chromium`、その後に `npm run test:e2e` を実行します。このPCにあるChromeを使うなら `PLAYWRIGHT_CHANNEL=chrome npm run test:e2e` でもOKです。

## 基礎から、少しずつ難しく

- **基礎：** 追加・編集・削除など、まず動く機能を作る。
- **中級：** 状態管理や非同期処理を整理して、扱いやすくする。
- **ナイトメア：** 競合・取消・障害など、うまくいかない場面にも向き合う。

基本の18章に、DB準備の基礎7・API永続化の基礎8・モックテストの中級7を加えた全21章です。独立したExpress・Prismaチュートリアルも参照できます。余裕があれば「そのテスト、不具合を見つけられる？」も開いてみてください。一時的に実装を壊し、テストがちゃんと気付けるかを試す任意の挑戦です。終わったら元に戻すのを忘れずに。

## ちょっと補足

通常の学習画面はDBなしで起動できます。基礎7・8でローカルPostgreSQLとPrismaを使います。中級7のモックテストはDBなしで実行できます。ブラウザは同じPCのExpress（ポート3001）と通信して、テスト項目や結果ファイルを読みます。APIの課題は最初、501「未実装」を返します。ここから自分で作っていきます。

緑になったら「書いた検証が通った」ということ。要件を全部確かめられているかは、自分でも見直してみてください。

もっと詳しく知りたいときはこちら。

- [チャプター0の実演記録](docs/walkthrough/chapter-00/README.md)
- [Vitestの書き方](docs/vitest-guide.md)
- [テストと画面のつながり](docs/test-workflow.md)
- [CSSを書かずにUIを作る](docs/ui-kit.md)
- [アプリの仕様](specs/application.md)

## 自分のPCでPostgreSQL・Prismaを始める

基礎7の画面で環境を選び、DB準備 → Prismaチュートリアル → 基礎8のAPI永続化 → 中級7のモックテストへ進みます。DB未導入の方向けに、OS別インストール先とDockerの手順を用意しています。

[自分でDBを準備する手順](docs/prisma-local.md)に従って教材専用DBを作り、`.env.example` のユーザー名・パスワード・ポートを自分の環境に合わせて `.env` に設定してください。

```sh
npm run db:apply
npm run db:generate
npm run db:check
npm run db:demo -- "Prismaを学ぶ"
npm run test:prisma
```

保存を理解したら、中級7で `server/prisma.test.ts` のモックテストに進みます。

## 基礎8のテスト用DB

学習用DBへ接続できたら、初回だけ `npm run db:test:setup` を実行します。同じ接続先に「学習用DB名_test」を用意し、現在のマイグレーションを適用します。`.env.test` は不要です。

`server/task-persistence.test.ts` に専用サーバーの起動・終了と `origin` が用意済みです。TODOをitに変え、fetchとexpectを書きます。`await restartApiServer()` で再起動できます。各テストの保存領域と後片付けは自動です。

```sh
npm run db:test:setup
npm run test:learning -- basic-08
```

詳しくは [テストの準備](docs/task-persistence.md#5-テストの準備は最初に1コマンド) を参照してください。
