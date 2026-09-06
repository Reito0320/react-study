# 作業中断・再開メモ

2026-09-07。ユーザーのweekly token節約希望により、追加作業を止めて中断。

## 完了

- specs/overview.md, application.md, curriculum.md, server.md に仕様を保存。
- React/Express/課題/参考コード/テストはTypeScript。strict型検査対象にUI・サーバー・E2E・テスト設定を含む。
- 基礎→中級→ナイトメア各6課題、計18課題。
- 学習の4工程、順序制御、取消伝播、ブラウザ内進捗保存。
- 課題別の初期閉トグル、完成済み独立デモ、未実装の学習者UI/API。
- Vitestの画面・進捗13件、API基盤4件。
- ChromeによるE2E3件成功（キーボード/進捗保存/実API/モバイル幅）。
- build・lint成功。
- 独立レビュー指摘を修正: 課題APIが永遠に501であることを要求する5テストを除去、E2E設定等の型検査を追加、保存仕様をメモリに統一。

## 再開時

1. このメモとREADME、specsの仕様を読む。
2. 必要に応じて npm run dev。127.0.0.1:5173 は既存サーバー稼働を確認済み、/api/healthはok。起動済みなら重複起動しない。
3. ブラウザ画面の目視レビューは未実施。E2Eによる操作検証は成功済み。
4. 学習開始ならbasic-01から。TaskWorkspaceの機能を代理で完成させず、学習者が実装→UI確認→テスト追加の流れを守る。

## 実行情報

- npm run build / npm run lint / npm test
- PLAYWRIGHT_CHANNEL=chrome npm run test:e2e
- Playwright用Chromiumのダウンロードはタイムアウト。このPCのGoogle ChromeでE2E成功。
- 課題コード: src/exercises/TaskWorkspace.tsx, server/exercises.ts
- 課題データ: src/data/curriculum.ts
- Notionページ: https://app.notion.com/p/3d3cfeb6cd5080419c90c08bf0ed5b81

## 追加作業（中断後、1件のみ）

ユーザーの依頼で非同期リファレンスの回帰テストを1件追加。
`src/components/ReferenceDemo.test.tsx` で連続入力時の古い結果の抑止、最新結果の反映、アンマウント時のタイマー解除を検証。対象テスト実行成功。既存17件とは別の追加1件であり、追加後の全件再実行は未実施。

ブラウザ接続は利用可能なブラウザが0件で、目視レビューは引き続き未実施。
