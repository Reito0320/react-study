export default function DatabaseSetupGuide() {
  return <>
    <p>自分のPCに学習用DBを用意します。DBはこの章から必要です。すでに接続できる場合は「2」へ進んでください。</p>
    <h3>1 自分のDB環境を選ぶ</h3>
    <details className="reference"><summary>PostgreSQLをまだ用意していない</summary><div className="reference-content">
      <p><a href="https://www.postgresql.org/download/" target="_blank" rel="noreferrer">PostgreSQL公式のOS別手順</a>でインストール・起動します。設定したユーザー名・パスワード・ポートを控えてください。</p>
      <p>Dockerを使える場合は、次の1行でも学習用DBを作れます。Docker未導入なら <a href="https://docs.docker.com/get-started/get-docker/" target="_blank" rel="noreferrer">公式の導入手順</a>を確認します。</p>
      <pre><code>docker run --name hook-build-postgres -e POSTGRES_USER=learner -e POSTGRES_PASSWORD=local_learning_only -e POSTGRES_DB=hook_build -p 127.0.0.1:5433:5432 -v hook-build-postgres-data:/var/lib/postgresql/data -d postgres:17</code></pre>
      <p>この例の接続先は127.0.0.1:5433、DBはhook_build、ユーザーはlearnerです。パスワードは上のローカル学習用の値です。起動確認：</p>
      <pre><code>docker exec hook-build-postgres pg_isready -U learner -d hook_build</code></pre>
      <p>accepting connectionsなら次へ。同名コンテナを作成済みなら <code>docker start hook-build-postgres</code> で再開できます。停止は <code>docker stop hook-build-postgres</code>。データはvolumeに残ります。</p>
    </div></details>
    <details className="reference"><summary>PostgreSQLが起動している</summary><div className="reference-content">
      <p>まだ学習用DBがない場合だけ作成します。YOUR_USERとポートは自分の設定に置き換えます。Dockerの例では作成済みです。</p>
      <pre><code>createdb -h 127.0.0.1 -p 5432 -U YOUR_USER hook_build</code></pre>
      <p>作成権限がない場合は、自分で管理するローカルDBを上の手順で用意します。</p>
    </div></details>
    <h3>2 接続先を.envに書く</h3>
    <p>プロジェクト直下に <code>.env</code> を作り、<code>.env.example</code> を参考に設定します。既に接続できている.envはそのままでOKです。</p>
    <pre><code>DATABASE_URL="postgresql://ユーザー:パスワード@127.0.0.1:ポート/hook_build"</code></pre>
    <p>Dockerの例ならユーザーはlearner、パスワードはlocal_learning_only、ポートは5433に置き換えます。実際の.envはGitに含めません。</p>
    <h3>3 テーブルを作って確認する</h3>
    <p>package.jsonがあるフォルダのターミナルで順に実行します。</p>
    <pre><code>{`npm run db:apply
npm run db:generate
npm run db:check`}</code></pre>
    <p>「作成・再取得に成功」が出れば接続できています。次に保存した1件をStudioで確認します。</p>
    <pre><code>{`npm run db:demo -- "Prismaを学ぶ"
npm run db:studio`}</code></pre>
    <p>ターミナルに表示されたURLを開き、PracticeTaskに追加したタイトルがあれば完了です。基礎8で自分のタスクAPIをDBへつなげます。</p>
    <details className="reference"><summary>接続できないとき</summary><div className="reference-content"><ul>
      <li>接続拒否：DBの起動状態とポートを確認。5432と5433の取り違えに注意。</li>
      <li>認証失敗：.envのユーザー・パスワードを確認。DBの設定と一致させます。</li>
      <li>DBがない：DB名と作成済みかを確認。psql単体は.envを読みません。</li>
      <li>テーブルがない：正しいDBに対してdb:applyを実行。</li>
      <li>Dockerのポートが使用中：別のホスト側ポートを選び、.envのポートも揃えます。</li>
    </ul><p>詳しい設定と各コマンドの意味は <code>docs/prisma-local.md</code> にあります。</p></div></details>
  </>
}
