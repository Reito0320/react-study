# CSSを書かずに機能を実装する

`src/exercises/chapters.tsx` の `section.task-workspace` の内側に、普通のHTML要素を追加してください。input、textarea、select、button、form、ul、li、role="alert"、role="status"には共通CSSが適用されます。

カードのボタンのonClickもこのファイルにあります。TaskItemを辿ったり、専用コンポーネントにpropsを追加したりする必要はありません。現在のクリックは選択状態だけを変更します。編集フォームの表示・保存・キャンセルはチャプター2で実装します。

横並びの操作には `className="task-ui-actions"` が使えます。選択ボタンは `aria-pressed`、完了したカードは `data-completed="true"` で見た目を切り替えられます。入力にはlabel、操作にはbuttonを使うと、キーボード操作やテストにも役立ちます。
