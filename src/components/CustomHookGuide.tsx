const steps = [
  '切り出す処理を見つける',
  'カスタムフックへ切り出して共有する',
  '切り出し前後の動作を比べる',
  '共有する範囲をテストする',
];

export default function CustomHookGuide({ current }: { current: number }) {
  return (
    <section className="next-action" aria-labelledby="next-action-title">
      <div className="eyebrow">YOUR NEXT ACTION</div>
      <h2 id="next-action-title">
        {current === 4
          ? 'この課題の記録が完了しました'
          : `次にすること：${steps[current]}`}
      </h2>
      <p>
        この章では前章のreducerを使い、chapters.tsxに書いた関数を自分の手で別ファイルへ移します。
      </p>
      <h3>演習1：まず画面を変えずに切り出す</h3>
      <ol>
        <li>
          <code>src/exercises/chapters.tsx</code>
          で、useReducer、初回取得のuseEffect、追加・保存・削除・完了切替の関数を探します。移す前に既存の操作を確認します。
        </li>
        <li>
          <code>src/exercises/useTasks.ts</code>を作り、
          <code>export function useTasks()</code>
          を定義します。useReducerと、それが管理するstate・dispatchを使う関数、初回取得のEffectを移します。ReactのHookと既存の
          <code>reducer.ts</code>
          から必要な値・型をimportします。通信は引き続きreducerの外で行います。
        </li>
        <li>
          画面が使う状態・操作関数・派生値をオブジェクトでreturnし、ChaptersのトップレベルでuseTasksを呼んで受け取ります。JSXはchapters.tsxに残し、元のuseReducerやEffectの重複を取り除きます。JSXを書かないフックのファイルは.tsで構いません。
        </li>
        <li>
          まず現在の状態構造のまま動作を保ちます。その後、入力途中の文字や編集中のIDなど、フォームだけで使う状態をフォーム側に置くよう整理します。操作関数にはタイトルやIDを引数で渡せます。
        </li>
      </ol>
      <h3>演習2：Contextで一覧とサマリーへ届ける</h3>
      <p>
        カスタムフックが再利用するのは処理です。useReducerを持つuseTasksを一覧とサマリーで別々に呼ぶと、状態も別々になります。
      </p>
      <ol>
        <li>
          <code>src/exercises/TasksProvider.tsx</code>
          を作り、Provider内でuseTasksを1回呼んで返り値をContextへ渡します。Contextの型には
          <code>ReturnType&lt;typeof useTasks&gt; | undefined</code>も使えます。
        </li>
        <li>
          Contextを読む利用用フック<code>useTaskContext</code>
          をuseTasks.tsへ追加します。Contextの定義もそこに置くと、Providerからの循環importを避けられます。Provider外なら理由が分かるエラーをthrowします。
        </li>
        <li>
          一覧と件数サマリーを別コンポーネントに分け、同じProviderで囲みます。両方でuseTaskContextを呼びます。演習1でChaptersに置いたuseTasksの呼び出しはProviderへ移し、取得処理が重複しないようにします。
        </li>
      </ol>
      <p>
        useTasks・useTaskContextはコンポーネントやカスタムフックのトップレベルで呼びます。イベントハンドラーや条件分岐の中では呼びません。
      </p>
      {current === 0 && (
        <p>
          「reducerは更新ルール、useTasksは状態と操作、Providerは共有範囲、JSXは表示」と役割を整理したら「要件を読んだ」にチェックします。
        </p>
      )}
      {current === 1 && (
        <p>
          演習1の動作を確認してから演習2へ進みます。完成コードを写すのではなく、今の関数を移し、足りない引数・import・返り値を考えて接続したら「実装した」にチェックします。
        </p>
      )}
      {current === 2 && (
        <p>
          初回取得 → 追加 → 編集 → 完了切替 →
          削除を試し、移動前と同じ結果になること、一覧の変更がサマリーにも反映されることを確認して「UIで確認した」にチェックします。
        </p>
      )}
      {current === 3 && (
        <>
          <p>
            <code>src/exercises/chapters.test.tsx</code>
            の中級2のTODOで、同じProviderでの連動・別Providerの状態の独立・Provider外のエラーを検証します。APIをモックし、別Providerの検証では再取得によるサーバーデータの同期とReactの状態共有を区別します。
          </p>
          <p>
            切り出し前後で既存の操作テストも実行します。テストの成功だけではファイル分割は確認できないため、useTasks.tsへの移動をコードでも確認します。
            <code>npm run test:learning -- intermediate-02</code>
            で追加したテストが成功したら「テストを追加・実行した」にチェックします。
          </p>
        </>
      )}
      {current === 4 && (
        <p>
          処理を別ファイルに切り出すことと、状態をContextで共有することの両方を体験できました。
        </p>
      )}
      <p className="action-location">
        チェック欄は、この課題の下部「取り組みを記録」にあります。
      </p>
    </section>
  );
}
