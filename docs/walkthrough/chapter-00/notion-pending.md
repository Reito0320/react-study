## チャプター0：カウンターでVitestを学ぶ

入力フォームより簡単な例として、カウンターを使うチャプター0を追加した。初期画面から入り、最後にbasic-01へ進める。既存18課題の進捗とユーザーのタスク実装は維持。

### 実際に行った順序

1. 要件：初期0、＋1で1増える、リセットで0。
2. 実装：src/tutorial/Counter.tsxにuseStateで実装。
3. UI確認：Chromeで0→1→2→0を確認。テスト追加前の観測をdocs/walkthrough/chapter-00/ui-observations.jsonに保存。
4. テスト追加：Counter.test.tsxに初期・加算・リセットの3件を記述。
5. 解説：準備→操作→検証、import元、it、render、screen、getByRole、userEvent.setup、async/await、expect、matcher、jsdom、cleanupを説明。
6. 全体検証・独立レビュー：Vitest28件・ブラウザ6件成功、build・lint成功。レビューで重大な指摘なし。

### 教材のポイント

- コードと解説は初期閉トグル。ユーザーが必要なときに開く。
- 実際に実行するTSXとテストをrawで表示し、解説用コピーとの乖離を抑える。
- jsdomのコンポーネントテストは開発サーバーなしでも実行できる。レイアウトや実ブラウザ操作の確認はPlaywrightで行う。
- expect(count).toHaveTextContent(/^1$/)のように、数字全体を確認する。
- 失敗例は説明用であり、実際の実行履歴と区別する。
- 初期0→加算→リセット→テストという順で、小さな成功体験からタスク入力へつなぐ。

### ファイル

- docs/vitest-guide.md：コード解説全文。
- docs/walkthrough/chapter-00/README.md：一連の実演と再現手順。
- src/tutorial/Counter.tsx、Counter.test.tsx、ChapterZero.tsx。
- specs/chapter-00.md：仕様。

2026-09-07：Notion「学習アプリ開発」へ要約を送信済み。再取得して掲載を確認。
