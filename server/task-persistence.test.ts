// @vitest-environment node
import { describe, it } from 'vitest'

// 基礎8の学習者用。手順：docs/task-persistence.md
// TODOを実装する前にTEST_DATABASE_URLで専用DBを準備する。
// createApp/createExerciseRouterにサービスを渡せる形へ変更し、テスト用DBを注入する。
// テストごとに作成IDを記録し、終了時にそのIDだけ削除してHTTPサーバーとDB接続を閉じる。
// 再起動確認では、保存とGETの間にDBを初期化しない。
describe('[basic-08] 基礎8：タスクAPIをPrismaで永続化する', () => {
  it.todo('[basic-08-01] POSTしたタスクをAPIの再起動後も同じID・タイトルでGETできる')
  it.todo('[basic-08-02] PATCHしたタイトルと完了状態がAPI再起動後も維持される')
  it.todo('[basic-08-03] DELETEしたタスクがAPI再起動後の一覧に戻らない')
  it.todo('[basic-08-04] 存在しないIDの更新と削除は404になり他のデータを変更しない')
  it.todo('[basic-08-05] DB障害時は成功応答を返さずエラーを返す')
})
