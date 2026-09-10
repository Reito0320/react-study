import ApiTasks from './ApiTasks'
import ApiWritingGuide from './ApiWritingGuide'
import clientSource from './ApiTasks.tsx?raw'
import serverSource from '../../server/tutorial-tasks.ts?raw'
import testSource from '../../server/tutorial-tasks.test.ts?raw'

export default function ExpressTutorial({ onContinue }: { onContinue: () => void }) {
  return <article aria-label="Expressチュートリアル" className="chapter-zero api-walkthrough">
    <div className="eyebrow">EXPRESS TUTORIAL · APIの実演</div>
    <h1>Expressチュートリアル</h1>
    <p className="chapter-lead">起動 → コードを書く → UIで確認 → テスト。</p>
    <nav className="action-links" aria-label="チュートリアルの目次"><a href="#api-start">01 起動</a><a href="#api-writing">02 書く場所と手順</a><a href="#api-practice">03 実演UI</a><a href="#api-tests">04 テスト</a></nav>
    <section id="api-start" className="walkthrough-step"><h2>01 起動する</h2>
      <p>package.jsonがあるフォルダで実行。起動済みなら不要です。</p>
      <pre><code>npm run dev</code></pre>
      <p>ターミナルAは起動したまま、画面は <code>http://127.0.0.1:5173</code>。確認コマンドは別のターミナルBで実行します。</p>
      <details className="reference"><summary>起動を確認する</summary><div className="reference-content">
        <pre><code>curl -i http://127.0.0.1:3001/api/health</code></pre>
        <p>HTTP 200 と {'{"ok":true}'} ならOK。接続できなければAのログを確認。npm run dev:webだけではAPIは起動しません。</p>
      </div></details>
    </section>
    <section id="api-writing" className="walkthrough-step"><h2>02 ファイルを開いて、順に書く</h2>
      <ApiWritingGuide />
      <details className="reference"><summary>Expressの完成コード</summary><div className="reference-content"><p><code>server/tutorial-tasks.ts</code> 全体：</p><pre><code>{serverSource}</code></pre></div></details>
      <details className="reference"><summary>Reactの完成コード</summary><div className="reference-content"><p><code>src/tutorial/ApiTasks.tsx</code> 全体：</p><pre><code>{clientSource}</code></pre></div></details>
    </section>
    <section id="api-practice" className="walkthrough-step"><h2>03 このUIで確かめる</h2>
      <ol><li>「APIを学ぶ」を追加 → 編集して保存 → 完了にチェック。</li><li>ページ再読込 → 内容が残る。削除 → 一覧から消える。</li><li>「404エラーを試す」→ エラー表示。「再取得」→ 復旧。</li></ol>
      <p>実演用APIは <code>/api/tutorial/tasks</code>。課題のデータ・進捗とは別です。</p>
      <ApiTasks />
      <details className="reference"><summary>API停止時のエラーも試す</summary><div className="reference-content">
        <ol><li>Aのnpm run devをCtrl+Cで終了。</li><li>Aで <code>npm run dev:web</code>、Bで <code>npm run dev:api</code> を起動。</li><li>BだけCtrl+Cで停止。「再取得」でエラーが出て、通信中が終了することを確認。</li><li>BのAPIを再起動して「再取得」。保存データは空になります。</li></ol>
      </div></details>
    </section>
    <section id="api-tests" className="walkthrough-step"><h2>04 テストで確かめる</h2>
      <p>ターミナルBで実行。開発サーバーは不要です。各3件成功すればOK。</p>
      <pre><code>{`npm test -- server/tutorial-tasks.test.ts
npm test -- src/tutorial/ApiTasks.test.tsx`}</code></pre>
      <details className="reference"><summary>APIテストの完成コード</summary><div className="reference-content"><p><code>server/tutorial-tasks.test.ts</code> 全体。自分で書く場合もこのファイルを編集します。</p><pre><code>{testSource}</code></pre><p>beforeAllでサーバー起動 → fetchで操作 → expectで検証 → afterAllで終了。</p></div></details>
    </section>
    <section className="walkthrough-step"><h2>05 チャプター6へ</h2>
      <p>次は <code>server/exercises.ts</code> にAPIを書き、<code>src/exercises/chapters.tsx</code> から <code>/api/tasks</code> を呼びます。</p>
      <button className="primary" onClick={onContinue}>チャプター6：Expressで取得と保存へ進む →</button>
    </section>
  </article>
}
