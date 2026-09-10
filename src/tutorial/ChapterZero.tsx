import Counter from './Counter';
import counterSource from './Counter.tsx?raw';
import testSource from './Counter.test.tsx?raw';

export default function ChapterZero({ onContinue, completed, onCompletedChange }: { onContinue: () => void; completed: boolean; onCompletedChange: (completed: boolean) => void }) {
  return <article className="chapter-zero">
    <div className="eyebrow">CHAPTER 00 · はじめの実演</div>
    <h1>カウンターで、学び方をひと回り。</h1>
    <p className="chapter-lead">入力フォームの前に、ボタンを押すだけの小さな例から。要件を読み、実装して、動かしてからテストを書く流れを体験しましょう。</p>
    <p className="muted">完成済みの導入実演です。各課題の進捗とは別で、操作してもタスク管理のデータやチェックは変わりません。</p>
    <section className="walkthrough-step"><h2>01 要件を読む</h2><ul><li>最初は0を表示する。</li><li>「＋1」を押すたびに1増える。</li><li>「リセット」を押すと0に戻る。</li></ul><p>この3つだけです。配列・入力文字・APIはまだ扱いません。「0 → ＋1 → 1 → ＋1 → 2 → リセット → 0」を確認例にします。</p></section>
    <section className="walkthrough-step"><h2>02 実装する</h2><p>エディタで <code>src/tutorial/Counter.tsx</code> を開きます。実演用に完成したコードが入っています。読みながら自分でも書き直し、保存して変化を確認できます。</p><details className="reference"><summary>カウンターのTypeScriptコードと解説を開く</summary><div className="reference-content"><pre><code>{counterSource}</code></pre><ul><li><code>useState(0)</code>：最初の値は0。countはnumber型として推論されます。</li><li><code>setCount((current) =&gt; current + 1)</code>：直前の値から次の値を計算します。</li><li><code>setCount(0)</code>：リセット時は0を指定します。</li><li><code>output</code>：計算結果を表示する要素。aria-labelで「カウント」という名前を付けます。</li></ul></div></details></section>
    <section className="walkthrough-step"><h2>03 UIで確かめる</h2><p><code>npm run dev</code> で起動したこの画面で、下のボタンを押します。0から始まり、2回押すと2、リセットで0になれば要件どおりです。</p><Counter /><p>ここで期待と違ったらCounter.tsxへ戻って修正。UIで確認できてから、次のテストへ進みます。</p></section>
    <section className="walkthrough-step"><h2>04 Vitestで確かめる</h2><p>UIで操作した順序をテストコードにします。次のテストは、このカウンターをブラウザで確認した後に追加したものです。</p>
      <details className="reference"><summary>Vitestのコードと、一つずつの解説を開く</summary><div className="reference-content">
        <p>ファイル：<code>src/tutorial/Counter.test.tsx</code>。以下は実際に実行するファイルの内容です。</p><pre><code>{testSource}</code></pre>
        <h3>まずは3つに分けて読む</h3><ol><li><strong>準備</strong>：Counterをテスト用の画面に表示し、操作対象を探す。</li><li><strong>操作</strong>：＋1ボタンをクリックする。</li><li><strong>検証</strong>：表示が1になったかを確かめる。</li></ol>
        <table className="vitest-table"><thead><tr><th>コード</th><th>意味と、これが必要な理由</th></tr></thead><tbody>
          <tr><td><code>import … from 'vitest'</code></td><td>テストを実行するVitestからitとexpectを読み込みます。画面を描画するrenderや操作するuserEventは別のライブラリです。</td></tr>
          <tr><td><code>it('説明', 関数)</code></td><td>1つの確認を登録します。説明は実行結果に出るテスト名。「何ができるか」を日本語で書けます。testという名前でも使えます。</td></tr>
          <tr><td><code>render(&lt;Counter /&gt;)</code></td><td>React Testing LibraryがCounterをテスト用DOMに描画します。開いているブラウザを操作したり、ページを公開したりはしません。</td></tr>
          <tr><td><code>screen</code></td><td>描画したテスト用DOMから要素を探すための道具です。スクリーンショットのことではありません。</td></tr>
          <tr><td><code>getByRole('button', …)</code></td><td>役割がbuttonの要素を探します。nameは利用者に伝わる名前で、ここでは「＋1」。見つからない、または複数見つかるとテストは失敗します。</td></tr>
          <tr><td><code>getByRole('status', …)</code></td><td>output要素の暗黙の役割がstatusです。aria-labelに付けた「カウント」で絞り、数値の表示部分を取得します。</td></tr>
          <tr><td><code>userEvent.setup()</code></td><td>利用者の操作を再現する道具を用意します。各テストで作り、クリックなどの操作に使います。</td></tr>
          <tr><td><code>async / await user.click(…)</code></td><td>クリックは非同期の操作なので、終わるまで待ってから結果を確認します。awaitを使う関数にasyncを付けます。時間を決めてsleepする必要はありません。</td></tr>
          <tr><td><code>expect(count)</code></td><td>何を検証するかを渡します。この時点だけでは判定せず、続くtoHaveTextContentなどで期待する条件を指定します。</td></tr>
          <tr><td><code>toHaveTextContent(/^1$/)</code></td><td>要素のテキストが1かを検証します。/^1$/は正規表現で、先頭から末尾まで「1」の意味。「10」を誤って成功としません。このmatcherはjest-domが追加しています。</td></tr>
        </tbody></table>
        <h3>stateを直接調べないのはなぜ？</h3><p>利用者が見ているのは数値の表示です。内部の変数名ではなく「ボタンを押すと表示が変わる」を確かめると、後で実装方法を変えても同じ要件を検証できます。</p>
        <h3>設定はどこにある？</h3><p><code>vitest.config.ts</code> でjsdomを指定済みです。Node.js上にDOM環境を用意しますが、見た目のレイアウトや実ブラウザそのものは検証しません。<code>src/test-setup.ts</code> がjest-domのmatcherを読み込み、各テスト後にcleanupして画面を片付けます。各itでrenderするので前のカウンターの値を引き継ぎません。</p>
        <h3>タスク追加のテストへつなげる</h3><p>タスクではclickの前に <code>await user.type(input, 'Reactを学ぶ')</code> が増えます。空入力を複数試す <code>it.each</code>、入力クリアを調べる <code>toHaveValue('')</code>、エラーがないことを確認する <code>queryByRole('alert')</code> も使います。queryByRoleは見つからない場合にnullを返すので、不在の確認に使えます。</p>
      </div></details>
      <h3>実行して、結果を読む</h3><pre><code>npm test -- src/tutorial/Counter.test.tsx</code></pre><p>プロジェクトの別ターミナルで実行します。これはコンポーネントテストなので、開発サーバーを起動していなくても動きます。<code>--</code> の後はnpmからVitestへ渡す対象ファイルです。</p><pre><code>{`Test Files  1 passed (1)
Tests       3 passed (3)`}</code></pre><p>この2行は成功表示の抜粋です。自分が実行したファイル名も確認しましょう。テスト名ごとに見る場合は <code>npm test -- src/tutorial/Counter.test.tsx --reporter=verbose</code> を使います。</p>
      <details className="reference"><summary>もし赤く失敗したら？</summary><div className="reference-content"><p>たとえば「1回押したら2になる」と期待すると、実際は1なので失敗します。これは読み方の例で、実演で発生したエラーではありません。</p><pre><code>{`期待した表示: 2
実際の表示: 1`}</code></pre><p>要件は「1ずつ増える」なので、この場合はテスト側の期待値を1に戻します。実装が間違っている場合は実装を直します。成功させるためだけに期待値を変えず、最初の要件に戻りましょう。</p></div></details>
      <p>実演の記録・UI観測・画像は <code>docs/walkthrough/chapter-00/README.md</code>。Vitestの詳しい説明は <code>docs/vitest-guide.md</code> にも保存しています。</p>
      <p className="muted">公式資料：<a target="_blank" rel="noopener noreferrer" href="https://testing-library.com/docs/user-event/intro/">user-event</a> / <a target="_blank" rel="noopener noreferrer" href="https://testing-library.com/docs/queries/byrole/">ByRole</a> / <a target="_blank" rel="noopener noreferrer" href="https://vitest.dev/guide/environment.html">Vitestの実行環境</a></p>
    </section>
    <section className="walkthrough-step"><h2>次は、タスクを追加する</h2><p>次の課題でも同じ流れです。カウンターの「押す→数が変わる」が、タスクの「入力して追加→一覧が変わる」に変わります。</p><label className="intro-completion"><input type="checkbox" checked={completed} onChange={e => onCompletedChange(e.target.checked)} />チャプター0の実演を確認した</label><button className="primary" onClick={onContinue}>チャプター1：タスク追加へ進む →</button></section>
  </article>;
}
