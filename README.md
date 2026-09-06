# Hook & Build

React Hooks・Express・Vitestを、TypeScriptで段階的に学ぶローカル学習ワークスペース。

## 起動

Node.js 22.12以上（または対応する新しいLTS）を使用してください。

```sh
npm install
npm run dev
```

画面: http://127.0.0.1:5173 / API: http://127.0.0.1:3001

`npm run dev` はViteとExpressを同時に起動します。停止はCtrl+C。
画面だけなら `npm run dev:web`、APIだけなら `npm run dev:api`。

## 学習する

1. 基礎の最初の課題から、要件と受け入れ条件を読む。
2. `src/exercises/TaskWorkspace.tsx` を普段のエディタで編集する。
3. 保存し、画面右側のプレビューでUIを操作する。
4. `src/exercises/TaskWorkspace.test.tsx` にVitest + Testing Libraryのテストを追加し、実行する。
5. 必要なUIテストは `e2e/exercises/*.spec.ts` に追加する。
6. 課題の4つのチェックを順番に記録し、次へ進む。

API課題では `server/exercises.ts` も編集します。最初は501「未実装」を返す意図的な土台です。
タスクUIは空の枠で、入力・追加は未実装です。課題に合わせて有効化し、機能を追加してください。

基礎6課題 → 中級6課題 → ナイトメア6課題。同じ機能を、設計・非同期・競合・障害復旧の観点で改善します。

参考書は課題内のトグルで開きます。閉じたまま考えることもできます。完成済みデモは課題と独立し、APIデモだけは起動中のExpressへ実際に通信します。

進捗はこのブラウザに保存されます。手動の自己確認であり、自動採点ではありません。提供済み基盤テストに合格しても、学習者の課題が完成したことにはなりません。

## 検証コマンド

```sh
npm run build       # ReactとExpressの型チェック + 画面ビルド
npm run lint
npm test            # Vitest（基盤 + 自分で追加したテスト）
npm run test:watch  # Vitestの監視モード
npx playwright install chromium  # 初回のみ
npm run test:e2e    # 実ブラウザ。未起動時は開発サーバーも起動
```

Chromiumをダウンロードできず、このPCにGoogle Chromeがある場合:

```sh
PLAYWRIGHT_CHANNEL=chrome npm run test:e2e
```

すべての課題コード・参考コード・テストはTypeScriptです。

## ファイル構成

- `specs/`: 合意事項・アプリ仕様・カリキュラム・API仕様・検証結果
- `src/data/curriculum.ts`: 18課題の要件・UI確認・テスト観点
- `src/exercises/`: 学習者のReact実装と、後から書くテスト
- `server/exercises.ts`: 学習者のExpress実装
- `src/components/ReferenceDemo.tsx`: 完成済みReactデモ
- `server/reference.ts`: 完成済みExpressミドルウェアデモ
- `e2e/`: 学習基盤の実ブラウザテスト

API課題の基礎ではメモリ保存から始め、再起動による消失を明示します。永続化は発展学習として追加できます。
