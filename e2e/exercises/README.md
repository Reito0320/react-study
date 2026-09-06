# 学習者のUIテスト

プロダクトコードを実装し、ブラウザで動作確認した後、このフォルダに `tasks.spec.ts` を追加します。

Playwrightの `test` と `expect` を `@playwright/test` からimportし、要件のユーザー操作と結果を検証してください。`npm run test:e2e` で実行できます。

タスク画面は `page.getByRole('region', { name: 'タスク管理プレビュー' })` で絞り込めます。参考デモの操作と課題の操作を取り違えないでください。
