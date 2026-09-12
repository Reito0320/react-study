const steps = ['まず削除処理を見つける', '削除からuseReducerへ置き換える', '今までと同じ操作を試す', '状態の更新ルールをテストする']

export default function ReducerGuide({ current }: { current: number }) {
  return <section className="next-action" aria-labelledby="next-action-title">
    <div className="eyebrow">YOUR NEXT ACTION</div>
    <h2 id="next-action-title">{current === 4 ? 'この課題の記録が完了しました' : `次にすること：${steps[current]}`}</h2>
    <p>この章では、追加・編集・削除・完了切替で使っている「タスク配列をどう更新するか」を一つの関数にまとめます。</p>
    <h3>どんな場面で役立つ？</h3>
    <p>操作が増えると、各イベントハンドラーにmapやfilterが散らばり、更新ルールを追いにくくなります。reducerに集めると、どの操作が配列をどう変えるかを一か所で読めて、画面やDBを起動せずにそのルールをテストできます。状態更新が少ない画面ならuseStateのままでも十分です。</p>
    <h3>action・dispatch・reducerの役割</h3>
    <ul>
      <li><strong>action</strong>：「何が起きたか」と必要なデータを入れたオブジェクト。例：<code>{'{ type: "deleted", id }'}</code>。Next.jsのServer Actionsとは別です。</li>
      <li><strong>dispatch</strong>：actionをReactに渡す関数。Reactがreducerを呼び、返された状態で画面を更新します。</li>
      <li><strong>reducer</strong>：今のstateとactionを受け取り、次のstateを返す関数。元の配列を書き換えず、新しい配列を返します。</li>
    </ul>
    <details className="reference">
      <summary>削除の書き換え例を見る</summary>
      <p>Taskは自分の型を使います。まず削除だけの例を読み、追加・編集・完了切替も自分の操作に合わせて増やします。</p>
      <pre style={{ maxWidth: '100%', overflowX: 'auto' }}><code>{`// 変更前：イベントハンドラー内で配列を更新
setTasks(tasks => tasks.filter(task => task.id !== id));

// 変更後：コンポーネントの外に更新ルールを書く
type TaskAction = { type: 'deleted'; id: Task['id'] };

function taskReducer(state: Task[], action: TaskAction): Task[] {
  switch (action.type) {
    case 'deleted':
      return state.filter(task => task.id !== action.id);
    default:
      return state;
  }
}

// コンポーネント内：ReactからuseReducerをimportして使う
const [tasks, dispatch] = useReducer(taskReducer, []);

// 削除イベント内（API連携中ならDELETEの成功を確認した後）
dispatch({ type: 'deleted', id });`}</code></pre>
      <p>空配列で始める例です。APIから初期一覧を取得する場合は、取得した配列を渡すactionも用意します。</p>
    </details>
    <p>API連携中は「イベントハンドラーで通信をawait → 成功を確認 → dispatch」の順です。fetch・Prisma・日時やIDの生成はreducerの外に置きます。保存時にAPIが返したタスクや一覧をactionに渡せば、サーバーが決めたIDも反映できます。</p>
    {current === 0 && <p><code>src/exercises/chapters.tsx</code> を開き、タスク配列を更新するset関数を探します。「削除なら対象ID、追加なら保存済みタスクが必要」のように、各操作に渡すデータを整理したら「要件を読んだ」にチェックします。</p>}
    {current === 1 && <ol>
      <li><code>src/exercises/chapters.tsx</code> のコンポーネント外に、actionの型とreducerを書きます。まず削除のfilter処理を移します。</li>
      <li>タスク配列のuseStateをuseReducerへ置き換え、削除成功時のset関数をdispatchに変更します。</li>
      <li>追加・編集・完了切替・初期一覧取得にもactionを用意し、残りの配列更新を移します。操作名やデータの形は自分の実装に合わせて決めます。</li>
      <li>入力中の文字や通信中の表示はuseStateのままでも構いません。表示できたら「実装した」にチェックします。</li>
    </ol>}
    {current === 2 && <p>プレビューで追加 → 編集 → 完了切替 → 削除を試します。対象以外のタスクが変わらないこと、API連携中は再読込後も保存結果が一致することを確認して「UIで確認した」にチェックします。</p>}
    {current === 3 && <><p>reducerをexportし、<code>src/exercises/chapters.test.tsx</code> の中級1のTODOを実装します。タスク2件のstateと片方を削除するactionを渡し、残る1件と元のstateが変わっていないことをexpectで確認します。追加・編集・完了切替・存在しないIDも試します。</p><p>既存のUI操作テストも確認し、<code>npm run test:learning -- intermediate-01</code> で自分のテストが成功したら「テストを追加・実行した」にチェックします。</p></>}
    {current === 4 && <p>操作結果を維持したまま、状態の更新ルールを整理できました。「次の課題へ」から学習を続けられます。</p>}
    <p className="action-location">チェック欄は、この課題の下部「取り組みを記録」にあります。</p>
  </section>
}
