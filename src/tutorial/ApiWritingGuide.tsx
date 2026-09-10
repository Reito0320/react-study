import serverSource from '../../server/tutorial-tasks.ts?raw'

const firstServer = `import { Router } from 'express'

export function createTutorialTasksRouter() {
  const router = Router()
  const tasks: { id: string; title: string; completed: boolean }[] = []

  router.get('/', (_req, res) => {
    res.json(tasks)
  })

  return router
}`
const post = serverSource.slice(serverSource.indexOf("  router.post("), serverSource.indexOf("  router.patch("))
const mutations = serverSource.slice(serverSource.indexOf("  router.patch("), serverSource.lastIndexOf('  return router'))

export default function ApiWritingGuide() {
  return <>
    <p>コードは完成済みです。自分で書く場合は、エディタでA〜Dの順に進めます。変更前のファイルをコピーしておきましょう。</p>
    <div className="api-writing-step"><h3>A 一覧取得を書く</h3>
      <p><code>server/tutorial-tasks.ts</code> 全体を下のコードに置き換えます。この段階ではGETだけ動きます。</p>
      <details className="reference"><summary>GETのコードと確認コマンド</summary><div className="reference-content">
        <pre><code>{firstServer}</code></pre>
        <p>保存後、APIの再起動を待ち、ターミナルBで実行。HTTP 200と [] が返ればOK。</p>
        <pre><code>curl -i http://127.0.0.1:3001/api/tutorial/tasks</code></pre>
      </div></details>
    </div>
    <div className="api-writing-step"><h3>B 追加・編集・削除を書く</h3>
      <p>同じファイルの先頭にrandomUUIDのimport、関数内の <code>return router</code> の直前にPOST・PATCH・DELETEを追加します。</p>
      <details className="reference"><summary>追加するコード</summary><div className="reference-content">
        <p>ファイル先頭：</p><pre><code>{`import { randomUUID } from 'node:crypto'`}</code></pre>
        <p>return routerの直前（AのGETは残す）：</p><pre><code>{post + mutations}</code></pre>
        <p>POSTで追加、PATCHで編集・完了切替、DELETEで削除。保存でメモリが空になるため、「03」でタスクを追加して確認します。</p>
      </div></details>
    </div>
    <div className="api-writing-step"><h3>C APIの登録を確認する</h3>
      <p><code>server/app.ts</code> のcreateApp内に設定済みです。読むだけでOK。</p>
      <pre><code>{`app.use('/api/tutorial/tasks', createTutorialTasksRouter())`}</code></pre>
    </div>
    <div className="api-writing-step"><h3>D Reactから呼ぶ</h3>
      <p><code>src/tutorial/ApiTasks.tsx</code> を開きます。再現するなら、下の「Reactの完成コード」でファイル全体を置き換えます。CSS・画面への組み込みは設定済みです。</p>
      <ul>
        <li><strong>関数の外：</strong>request内の <code>await fetch(...)</code> で通信。</li>
        <li><strong>useEffect内：</strong>loadTasksで初回取得。</li>
        <li><strong>return内：</strong>フォーム・ボタンからrequestを呼ぶ。</li>
      </ul>
      <p>まず <code>'追加しました。'</code> を変えて保存し、「03」で追加して表示を確認。確認後は元に戻します。</p>
      <details className="reference"><summary>async / awaitの読み方</summary><div className="reference-content"><p>tryで通信を待ち、catchでエラー表示、finallyで通信中を終了します。useEffect自体はasyncにせず、中のasync関数loadTasksを呼びます。voidは返るPromiseを受け取らないという意味です。</p></div></details>
    </div>
  </>
}
