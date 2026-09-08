# 最新状態（2026-09-07）

今回の要望は実装・検証済み。以下の過去記録より本節を優先。

- サイドメニュー折り畳みと保存、完了チェック表示。
- LEARNING NOTEを実際の要件別テスト結果に置換。コマンドは npm run test:learning -- basic-02。全章は引数なし。
- 18章のdescribeと最低65要件。既存の自作3テスト保持、残り63件TODO。本文は学習者が記述。
- TaskWorkspaceに直接HTMLとonClickを書く。TaskUIは削除、CSSは共通適用。編集の完成コードは提供していない。
- チャプター1実演はアーカイブ、Vitest解説はチャプター0。外部資料は別タブ。
- build・lint成功、Vitest29件成功/63件TODO、Chrome E2E6件成功/1件学習用スキップ。実API結果をChromeでも確認。
- レビューでTODO/失敗/古い結果/破損ファイルの区別と章間の失敗の扱いを確認。Notion再接続・追記・再取得済み。
- 仕様 specs/test-dashboard.md、手順 docs/test-workflow.md、UI docs/ui-kit.md。

---

# 中断中：学習UI調整とNotion再接続（未検証）

ユーザーの5時間枠token節約希望で中断。今回の変更はまだbuild・テスト・レビュー未実施。

## 今回の依頼

1. 左サイドバーに完了check mark。
2. チャプター1の実演ガイド削除、学習者用Vitestの中身を初期化。
3. CSSを書かず機能実装だけで見た目が整う設計。
4. 外部参考リンクを_blank。
5. Notion MCP再接続。

## 編集済み

- App.tsx: 完了課題に「✓ 完了」、chapter-00の自己確認チェック保存、WalkthroughGuide表示削除。
- LearningGuide.tsx: チャプター1実演コード除去。NextActionは維持。
- TaskWorkspace.test.tsx: it.todoのみ。e2e/exercises/basic-01.spec.ts: test.fixmeのみ。
- チャプター0実演とCounter.test.tsxは保持。
- TaskUI.tsx: 表示専用TaskLayout/TaskField/TaskActions/TaskItem/TaskTitle/TaskNoticeを追加。
- TaskWorkspace.tsx: 既存機能・状態を維持し、表示を共通部品に置き換え。
- App.css: 完了表示、共通部品と意味的HTML用のスコープ付きCSS。
- ChapterZero.tsx: 完了自己確認と外部リンクtarget/rel追加。
- 旧実演記録をdocs/archive/basic-01-walkthroughへ退避。旧captureスクリプトも.txtとして同所に保存。
- specs/learning-ux.mdに方針。

## 再開時に必須

1. 現状をreadし、ユーザーの新しい編集がないか確認。
2. docs/ui-kit.mdを作成（NextActionから参照済みだが未作成）。表示部品の使い方と状態props、CSS不要の契約を書く。
3. src/App.test.tsxの旧WalkthroughGuideテストを削除/更新。完了マークの保存・取消、chapter0完了、外部リンクの確認を追加。
4. e2e導線・UIの表示確認、必要に応じて共通部品の検証。CSSラベル/checkbox/priority/disabled/モバイルなど。
5. README/docs/vitest-guide.mdの古いbasic-01実演誘導を更新。アーカイブは履歴で現行教材にしない。
6. build/lint/Vitest/E2Eと独立レビュー。学習者テストTODOは成功テストに数えない。
7. Notion認証確認→溜まっているchapter00記録と今回記録を追記。

## Notion

MCP fetchはAuth required。ローカルcodex mcp get notionで https://mcp.notion.com/mcp が登録済みと確認。
`codex mcp login notion` を昇格実行しOAuthログイン開始済み。exec session_id=15379。
認証リンクは直前の会話に提示済み。成功確認はまだ。期限切れならユーザーの許可範囲内で再ログイン開始。
接続後の読取確認まで行って初めて再接続完了とする。

---

# 最新：チャプター0とVitestコード解説を追加

- 初期画面は「00 はじめに：カウンターで実演」。既存18課題・保存進捗は維持。
- 完成済みCounterを操作し、要件→実装→UI確認→Vitest3件を一巡。
- src/tutorial/ChapterZero.tsxで実コードとテストをraw表示し、構文を解説。
- docs/vitest-guide.md / docs/walkthrough/chapter-00/README.md に解説・実演・画像。
- 全Vitest28件、E2E6件、build、lint成功。独立レビュー完了。
- NotionはAuth requiredで未追記。再接続後に docs/walkthrough/chapter-00/notion-pending.md を「学習アプリ開発」へ追記する。

---

# 最新状態（作業再開後）

ユーザー依頼によりbasic-01の実演記録を追加。以前の中断メモはこの下に履歴として保持。

- ユーザーのTaskWorkspace実装を保存し、空白検証の順序を最小修正。
- 実演の仕様: specs/walkthrough.md。
- 実演記録: docs/walkthrough/basic-01.md。変更前後のコード、テストの固定コピー、Chromeの観測JSON・スクリーンショットを保存。
- アプリに初期閉の「最初の課題の実演ガイド」と工程連動の「次にすること」を追加。
- basic-01のVitest5件、Playwright1件をUI確認後に追加。全体でVitest24件・Playwright4件成功。build/lint成功。
- PCと390px幅のスクリーンショットを目視レビュー済み。横はみ出しなし。
- 独立レビューでテスト例の完全一致検証、既存テストの説明を修正。
- 次はユーザーが実演記録を確認し、basic-02「編集と削除」を実装する。後続機能はまだ実装していない。
- 学習者のブラウザ進捗は変更していない。

---

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
