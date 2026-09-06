# Express 学習環境仕様

## 目的と境界

ローカルの Express サーバーを `127.0.0.1:3001` で起動する。タスク API は学習者の実装対象として残し、完成済みのミドルウェアデモとは Router とファイルを分離する。
学習者は要件を読む → 実装 → UI で確認 → テストを追加の順に取り組む。基礎のAPI課題ではメモリ保存を実装し、再起動で消えることを明示する。永続化は発展として追加可能。初期状態では保存しない。

## API

| エンドポイント | 初期状態の振る舞い |
| --- | --- |
| `GET /api/health` | 200。サーバー稼働状態を返す |
| `GET /api/reference/pipeline` | 200。リクエスト ID、経過時間、ミドルウェアの通過順序を返す |
| `GET /api/reference/pipeline?fail=1` | 400。エラーミドルウェアへの分岐と同じ観測情報を返す |
| `GET /api/tasks` | 501。学習課題が未実装であることを返す |
| `GET /api/tasks/:id` | 501。同上 |
| `POST /api/tasks` | 501。同上 |
| `PATCH /api/tasks/:id` | 501。同上 |
| `DELETE /api/tasks/:id` | 501。同上 |

## 共通の受け入れ条件

- JSON ボディは 100 KB まで受け付け、壊れた JSON は 400 JSON、サイズ超過は 413 JSON で返す。
- 未知の URL は 404 JSON で返す。
- エラーミドルウェアはすべてのルートの後に配置し、想定外エラーは内部情報を出さず 500 JSON で返す。
- デモの trace は正常時 `request-id → timer → validation → handler`、失敗時 `request-id → timer → validation → error-handler` の順序になる。
- デモの requestId はレスポンス JSON と `X-Request-Id` ヘッダーで一致し、elapsedMs は 0 以上になる。
- タスク API は初期状態で成功を装わず、未実装の状態を明示する。
- アプリ生成と listen を分離し、Vitest からポートを固定せず検証できる。
