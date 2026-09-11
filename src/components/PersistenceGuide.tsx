export default function PersistenceGuide() {
  return <section className="next-action" aria-labelledby="next-action-title">
    <div className="eyebrow">MEMORY → DATABASE</div>
    <h2 id="next-action-title">今のタスクAPIをDB保存へ</h2>
    <p>基礎6・7の続きです。完成解答は入っていません。次の順に編集し、各工程を下のチェック欄に記録します。</p>
    <ol>
      <li><code>prisma/schema.prisma</code>：自分のタスクの型に合わせたモデルを追加します。モデル名・項目名は自由です。</li>
      <li><code>server/db/task-service.ts</code> を新規作成：一覧・追加・更新・削除をPrismaで書きます。参考は同じフォルダのpractice-service.tsです。</li>
      <li><code>server/exercises.ts</code>：配列操作をサービスの呼び出しに変更。<code>await</code>で結果を待ち、今と同じJSONを返します。</li>
      <li><code>server/index.ts → server/app.ts → server/exercises.ts</code>：DBを使うサービスを引数で渡す形にします。テストでは別DBのサービスを渡せるようにします。</li>
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
      <p><code>docs/task-persistence.md</code> の手順で専用DBと接続設定を用意します。ポートを変えただけではDBは分離されません。</p>
      <p><code>server/task-persistence.test.ts</code> のTODOに、専用DBの接続・サーバー起動・検証・後片付けを書きます。既存のメモリ用テストの起動処理はそのまま流用できません。</p>
      <pre><code>npm run test:learning -- basic-08</code></pre>
      <p>TODOのままではDBに接続しません。再起動のテストは「保存 → サーバー終了 → 同じDBで起動 → GET」の順です。テスト後に作成したIDだけ削除します。</p>
    </div></details>
    <p>詳しい編集位置とテスト接続の例：<code>docs/task-persistence.md</code></p>
  </section>
}
