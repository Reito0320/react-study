import exampleSource from '../../scripts/prisma-tutorial.ts?raw'

const queries = [
  { name: 'findMany', title: '一覧を取得', code: `const tasks = await db.practiceTask.findMany();`, note: '戻り値は配列。該当なしなら []。順序が必要ならorderByを指定します。' },
  { name: 'findUnique', title: 'IDで1件取得', code: `const task = await db.practiceTask.findUnique({
  where: { id: targetId },
});`, note: 'idなど一意な項目で検索。該当なしならnull。通常の条件で先頭の1件を探す場合はfindFirstを使います。' },
  { name: 'create', title: '1件追加', code: `const task = await db.practiceTask.create({
  data: { title: 'Prismaを学ぶ' },
});`, note: '戻り値は保存した1件。参考モデルではID・完了状態・作成日時にデフォルト値があります。' },
  { name: 'update', title: '1件更新', code: `const task = await db.practiceTask.update({
  where: { id: targetId },
  data: { completed: true },
});`, note: 'whereが対象、dataが変更内容。指定しない項目は維持されます。対象なしはエラーです。' },
  { name: 'delete', title: '1件削除', code: `const task = await db.practiceTask.delete({
  where: { id: targetId },
});`, note: '戻り値は削除した1件。対象なしはエラーです。APIでは対象不在とDB接続失敗を区別します。' },
  { name: 'count', title: '件数を取得', code: `const count = await db.practiceTask.count({
  where: { completed: false },
});`, note: '戻り値は数値。一覧を全部取得せずに未完了件数を調べられます。' },
]

export default function PrismaTutorial({ onContinue }: { onContinue: () => void }) {
  return <article className="chapter-zero" aria-label="Prismaチュートリアル">
    <div className="eyebrow">PRISMA TUTORIAL · よく使うクエリ</div>
    <h1>Prismaチュートリアル</h1>
    <p className="chapter-lead">取得・追加・更新・削除を、async / awaitで書く。</p>
    <p>この教材のPrisma 7と、参考用のPracticeTaskで紹介します。自分の課題ではモデル名・項目名を読み替えてください。</p>
    <nav className="action-links" aria-label="Prismaチュートリアルの目次"><a href="#prisma-run">実行する</a><a href="#prisma-crud">基本6クエリ</a><a href="#prisma-filter">検索・並べ替え</a><a href="#prisma-more">まとめて操作</a></nav>
    <section className="walkthrough-step" id="prisma-run"><h2>01 コマンドで動かす</h2>
      <p>基礎7のセットアップ後、プロジェクトのターミナルで実行します。Expressの起動は不要です。</p>
      <pre><code>npm run db:tutorial</code></pre>
      <p>1件作成 → ID検索 → 条件検索 → 更新 → 件数取得 → 削除。countが1、削除後の検索がnullなら一巡完了です。作成した1件は最後に片付けます。</p>
      <p><strong>書く場所：</strong><code>scripts/prisma-tutorial.ts</code> のtry内。クエリを変えて保存し、同じコマンドで再実行できます。以下の例のtargetIdは、操作したいタスクのIDです。実演ファイルでは作成したidを使っています。</p>
      <details className="reference"><summary>実行するコード全体</summary><div className="reference-content"><pre><code>{exampleSource}</code></pre><p>createLocalPrismaが.envのDB接続を準備し、finallyで切断します。実演のwhereにあるidは、操作対象を今回の1件に絞るためのものです。</p></div></details>
    </section>
    <section className="walkthrough-step" id="prisma-crud"><h2>02 まず覚える6つ</h2>
      <p><code>db.practiceTask</code> は、schema.prismaのPracticeTaskモデルを操作する入口です。クエリはサーバー側のコードに書きます。</p>
      {queries.map(query => <details className="reference" key={query.name}><summary>{query.name} — {query.title}</summary><div className="reference-content"><pre><code>{query.code}</code></pre><p>{query.note}</p></div></details>)}
    </section>
    <section className="walkthrough-step" id="prisma-filter"><h2>03 絞り込みと並べ替え</h2>
      <pre><code>{`const tasks = await db.practiceTask.findMany({
  where: {
    completed: false,
    title: { contains: 'Prisma' },
  },
  orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
  select: { id: true, title: true },
  skip: 0,
  take: 10,
});`}</code></pre>
      <ul><li><code>where</code>：未完了かつタイトルにPrismaを含む。ORを使うと「どちらか」にできます。</li><li><code>orderBy</code>：作成日時の新しい順。同時刻ならID順。</li><li><code>select</code>：返す項目を絞る。この例の結果にはcompletedは含まれません。</li><li><code>skip / take</code>：先頭から何件飛ばし、何件取るか。次のページはskipを10にします。</li></ul>
    </section>
    <section className="walkthrough-step" id="prisma-more"><h2>04 必要になったら使うもの</h2>
      <details className="reference"><summary>updateMany / deleteMany — 条件に合う複数件</summary><div className="reference-content"><pre><code>{`const result = await db.practiceTask.updateMany({
  where: { id: { in: targetIds } },
  data: { completed: true },
});
// resultは { count: 更新件数 }

await db.practiceTask.deleteMany({
  where: { id: { in: targetIds } },
});`}</code></pre><p>targetIdsは操作したいIDの配列です。対象0件でも成功し、countは0。whereを省略すると全件が対象になるので、操作条件を確認します。</p></div></details>
      <details className="reference"><summary>upsert — あれば更新、なければ追加</summary><div className="reference-content"><pre><code>{`await db.practiceTask.upsert({
  where: { id: targetId },
  update: { title: '復習する' },
  create: { id: targetId, title: '復習する' },
});`}</code></pre><p>whereには一意な項目を指定します。参考モデルのtitleは一意ではないので、titleだけでは指定できません。</p></div></details>
      <details className="reference"><summary>$transaction — 複数の変更をまとめる</summary><div className="reference-content"><pre><code>{`await db.$transaction([
  db.practiceTask.update({
    where: { id: firstId }, data: { completed: true },
  }),
  db.practiceTask.update({
    where: { id: secondId }, data: { completed: true },
  }),
]);`}</code></pre><p>firstId・secondIdは対象のIDです。片方が失敗すると、まとめた変更は取り消されます。</p></div></details>
    </section>
    <section className="walkthrough-step"><h2>05 自分のAPIへ</h2><p>基礎8では、このクエリを自分のモデルで使います。配列操作を置き換え、今のAPIのURLとJSON形式を維持しましょう。</p><button className="primary" onClick={onContinue}>基礎8：タスクAPIをDB保存へ →</button></section>
    <p className="muted">公式資料：<a href="https://www.prisma.io/docs/orm/v7/reference/prisma-client-reference" target="_blank" rel="noreferrer">Prisma 7 クエリリファレンス</a></p>
  </article>
}
