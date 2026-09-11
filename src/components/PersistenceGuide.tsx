export default function PersistenceGuide() {
  return <section className="next-action" aria-labelledby="next-action-title">
    <div className="eyebrow">MEMORY → DATABASE</div>
    <h2 id="next-action-title">今のタスクAPIをDB保存へ</h2>
    <p>基礎6・7の続きです。完成解答は入っていません。次の順に編集し、各工程を下のチェック欄に記録します。</p>
    <ol>
      <li><code>prisma/schema.prisma</code>：自分のタスクの型に合わせたモデルを追加します。モデル名・項目名は自由です。</li>
      <li><code>server/db/task-service.ts</code> を新規作成：一覧・追加・更新・削除をPrismaで書きます。参考は同じフォルダのpractice-service.tsです。</li>
      <li><code>server/exercises.ts</code>：配列操作をサービスの呼び出しに変更。<code>await</code>で結果を待ち、今と同じJSONを返します。</li>
      <li><code>server/index.ts → server/app.ts → server/exercises.ts</code>：接続先の受け渡しは準備済みです。Routerが受け取ったPrismaをクエリに使います。</li>
      <li>UIでCRUD → API再起動 → 再取得。Studioでも同じデータを確認します。</li>
    </ol>
    <pre><code>{`npm run db:migrate -- --name add_task
npm run db:generate
npm run dev`}</code></pre>
    <p>ReactのURLは <code>/api/tasks</code> のまま。localStorageによる一覧の初期化・復元は外し、GETの結果を使います。以前のメモリ内データの移行は今回の対象外です。</p>
    <details className="reference"><summary>配列操作とPrismaの対応</summary><div className="reference-content">
      <ul><li>一覧を返す → findMany</li><li>push → create</li><li>IDでfind → findUnique</li><li>mapで更新 → update</li><li>filterで削除 → delete</li></ul>
      <p>今のAPIのJSON形式を維持します。DBとReactで項目名・日付の表現が違う場合は、APIで変換します。</p>
    </div></details>
    <details className="reference"><summary>テスト用DBの準備と実行</summary><div className="reference-content">
      <p>初回だけ実行。.envの接続先から別名のテスト用DBを自動作成します。.env.testは不要です。</p>
      <pre><code>npm run db:test:setup</code></pre>
      <p><code>server/task-persistence.test.ts</code> はoriginと起動・終了処理を用意済み。TODOにfetchとexpectを書きます。</p>
      <pre><code>{'await fetch(`${origin}/api/tasks`);\nawait restartApiServer();'}</code></pre>
      <p>各テストは空から開始。再起動中のデータは保持し、テスト終了後の後片付けも自動です。</p>
      <pre><code>npm run test:learning -- basic-08</code></pre>
    </div></details>
    <p>詳しい編集位置とテスト接続の例：<code>docs/task-persistence.md</code></p>
  </section>
}
